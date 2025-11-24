## Chapter 13: Let the plug-in recognize image text - OCR function in practice

> ⚠️ **Important reminder**: The code examples in this chapter are mainly used for teaching demonstrations to show the basic implementation ideas and architectural design of the OCR plug-in. Real production-level OCR plug-in development requires:
> - Real OCR API keys (SimpleTex, Doc2X, OpenAI Vision, etc.)
> - More complex network request handling (multipart/form-data, etc.)
> - Complete error handling mechanism
> - Optimized cache strategy and performance tuning
>
> Taking the MNOCR plug-in as an example, the actual complete implementation exceeds 3,000 lines of code. This tutorial provides a simplified version of the framework to help beginners understand the core principles.

> Have you ever encountered such a scenario: There is a complex mathematical formula in a PDF, but you want to copy it but find that it is a picture? Or want to convert handwritten notes into text? Today, we will learn how to make your plug-in "understand" the text in the picture. We will follow the design ideas of the MNOCR plug-in and implement the OCR function step by step.

### 13.1 Understanding OCR from scratch

#### What is OCR?

OCR (Optical Character Recognition, optical character recognition) sounds very high-end, but it is actually a technology that allows computers to "recognize characters". Just like children learning to read, OCR requires:
1. See the picture (input)
2. Recognize text (processing)
3. Output results (text)

In MarginNote, OCR is particularly useful:
- **Scanned PDF**: Many old books are scanned and text cannot be selected.
- **Handwritten Notes**: Convert handwritten content into searchable text
- **Mathematical formulas**: Convert formula images to LaTeX format
- **Chart Text**: Extract text information in the chart

#### A real scene

📝 **Code examples for this tutorial**:
- In order to simplify the demonstration, the network request part actually needs to use NSURLSession and the correct multipart format.
- The API address is a sample address. Please replace it with the real OCR service URL for actual development.
- The cache implementation is a basic version, and more edge cases need to be considered.
- OCR recognition in the complete example uses simulated data and is only used to demonstrate UI interaction and result processing

Imagine you are reading a mathematics textbook and see a formula like this:

```
[Picture of a complex integral formula]
```

You want to put it in your notes, but:
- Manually type into LaTeX? Too much trouble
- Save screenshot? Cannot edit or search
-Handwriting? Slower...

At this time, if there is a plug-in that can identify and convert it into:
```latex
$$\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$
```

Isn't it great? Let's start making it happen!

#### Try it yourself: Call the first OCR interface

Let's start with the simplest - calling a free OCR API:

```javascript
//The first OCR function: recognize text in pictures
class SimpleOCR {
    // This function receives the image and returns the recognized text
    static async recognizeText(imageData) {
        // Step 1: Prepare data
        // imageData is the image data obtained from MarginNote
        let base64Image = imageData.base64Encoding();

        // Step 2: Call the OCR service (a simple example is used here)
        //In actual projects, you can choose various OCR services
        let result = await this.callOCRService(base64Image);

        // Step 3: Return the result
        return result.text;
    }

    static async callOCRService(base64Image) {
        // Note: This is a simplified example showing the basic flow of OCR calls
        //Required in actual projects:
        // 1. Use real OCR API (such as SimpleTex, Doc2X)
        // 2. Correct network request method (NSURLSession)
        // 3. Complete error handling

        //Create request URL
        // SimpleTex real API: https://server.simpletex.cn/api/simpletex_ocr
        const url = NSURL.URLWithString("https://api.example.com/ocr");
        const request = NSMutableURLRequest.requestWithURL(url);

        //Set request method
        request.setHTTPMethod("POST");

        //Set the request header (actually needs to include API token)
        request.setValueForHTTPHeaderField("application/json", "Content-Type");
        // request.setValueForHTTPHeaderField(apiKey, "Authorization"); // Actual need

        // Build request body
        const body = JSON.stringify({
            image: base64Image,
            language: "zh-CN"
        });

        // Convert to NSData
        const bodyData = NSData.dataWithStringEncoding(body, 4);
        request.setHTTPBody(bodyData);

        //Send request (simplified example, actually using NSURLSession)
        return new Promise((resolve, reject) => {
            // Should be used in actual projects:
            // const session = NSURLSession.sharedSession();
            // const task = session.dataTaskWithRequest(request, ...);

            // This is just for demonstration
            setTimeout(() => {
                resolve({
                    text: "Recognized text content",
                    confidence: 0.95
                });
            }, 1000);
        });
    }
}

// Usage example: call in plug-in
JSB.defineClass('MyOCRPlugin : JSExtension', {
    // When the user clicks the OCR button
    performOCR: async function() {
        // Get the currently selected note
        let note = MNNote.getFocusNote();
        if (!note) {
            MNUtil.showHUD("Please select a note first");
            return;
        }

        // Get the picture in the note
        let imageData = this.getImageFromNote(note);
        if (!imageData) {
            MNUtil.showHUD("There are no pictures in the notes");
            return;
        }

        //Display the prompt during recognition
        MNUtil.showHUD("Recognizing...");

        try {
            //Call OCR
            let text = await SimpleOCR.recognizeText(imageData);

            //Add recognition results to notes
            MNNote.updateExcerptText(note, text);
            MNUtil.showHUD("Recognition completed!");

        } catch (error) {
            MNUtil.showHUD("Recognition failed: " + error.message);
        }
    },

    //Extract pictures from notes
    getImageFromNote: function(note) {
        // Check if the excerpt is an image
        if (note.excerptPic) {
            return note.excerptPic.data;
        }

        // Check if there is an image in the comment
        for (let comment of note.comments) {
            if (comment.type === "PaintNote" && comment.paint) {
                return comment.paint.data;
            }
        }

        return null;
    }
});
```

Wow! You have implemented your first OCR function! Although simple, this is the core process of OCR.

### 13.2 Create a small window that floats

Now the functionality is there, but the user experience is not good enough. Imagine if the OCR control panel was fixed in a certain position on the screen, possibly blocking the content you are reading. The solution of the MNOCR plug-in is very clever: make a floating window that can be dragged around!

#### Why make a floating panel?

Compare the two designs:

**Fixed interface issues**:
- Occupies a fixed space and may obscure content
- Different location requirements in different scenarios
- User has no control

**Advantages of Floating Panels**:
- User can drag to any location
- Can be minimized when not in use
- Expand when in use
- Give users a sense of control

#### Teach you step by step: Create a small window that can be dragged around

Let's create a basic floating panel:

```javascript
// Floating panel controller
class FloatingPanel {
    constructor() {
        //Create panel view
        this.view = UIView.new();
        this.view.frame = {x: 100, y: 100, width: 200, height: 150};

        // Styling - make it look like it's "floating"
        this.setupAppearance();

        //Add drag function
        this.addDragGesture();

        // add content
        this.setupContent();
    }

    setupAppearance() {
        // rounded corners
        this.view.layer.cornerRadius = 12;

        // Shadow effects - key! Give the panel a floating feel
        this.view.layer.shadowColor = UIColor.blackColor().CGColor;
        this.view.layer.shadowOffset = {width: 0, height: 2};
        this.view.layer.shadowRadius = 8;
        this.view.layer.shadowOpacity = 0.3;

        // semi-transparent background
        this.view.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.95);
    }

    addDragGesture() {
        //Create a drag gesture recognizer
        const panGesture = new UIPanGestureRecognizer(this, "handleDrag:");
        this.view.addGestureRecognizer(panGesture);

        //Record initial position and relative offset
        this.initialFrame = null;
        this.locationToBrowser = null; // Important: record the finger's position relative to the panel
        this.moveDate = 0; // Anti-shake
    }

    // handle dragging - real implementation requires more precise coordinate calculations
    handleDrag(gesture) {
        const state = gesture.state;
        const locationInSuperview = gesture.locationInView(this.view.superview);
        const translation = gesture.translationInView(this.view.superview);

        // Anti-bounce check (avoid too frequent updates)
        if (Date.now() - this.moveDate > 16) { // About 60fps
            const locationInPanel = gesture.locationInView(this.view);

            if (state === 1) { // Start dragging
                //Key: record the relative position of the finger within the panel
                this.locationToBrowser = {
                    x: locationInPanel.x - translation.x,
                    y: locationInPanel.y - translation.y
                };
                this.initialFrame = this.view.frame;

                // visual feedback
                this.animateScale(1.05);
            }

            this.moveDate = Date.now();
        }

        if (state === 2) { // Dragging
            // Calculate new position based on finger position and relative offset
            const location = {
                x: locationInSuperview.x - this.locationToBrowser.x,
                y: locationInSuperview.y - this.locationToBrowser.y
            };

            // Bounds check
            const bounds = this.view.superview.bounds;
            const frame = this.view.frame;

            let x = location.x;
            let y = location.y;

            // Make sure not to drag off the screen
            x = Math.max(0, Math.min(x, bounds.width - frame.width));
            y = Math.max(0, Math.min(y, bounds.height - frame.height));

            // update location
            this.view.frame = {
                x: x,
                y: y,
                width: frame.width,
                height: frame.height
            };
        }

        if (state === 3) { // Drag ends
            //restore size
            this.animateScale(1.0);
            // Automatic welt
            this.snapToEdge();
        }
    }

    // Zoom animation
    animateScale(scale) {
        UIView.animateWithDuration(0.2, () => {
            this.view.transform = CGAffineTransformMakeScale(scale, scale);
        });
    }

    setupContent() {
        // add title
        const titleLabel = UILabel.new();
        titleLabel.text = "OCR Tool";
        titleLabel.frame = {x: 10, y: 10, width: 180, height: 30};
        titleLabel.textAlignment = 1; // Centered
        titleLabel.font = UIFont.boldSystemFontOfSize(16);
        this.view.addSubview(titleLabel);

        //Add OCR button
        const ocrButton = UIButton.buttonWithType(0);
        ocrButton.frame = {x: 20, y: 50, width: 160, height: 40};
        ocrButton.setTitleForState("Start recognition", 0);
        ocrButton.setTitleColorForState(UIColor.whiteColor(), 0);
        ocrButton.backgroundColor = UIColor.systemBlueColor();
        ocrButton.layer.cornerRadius = 8;
        ocrButton.addTargetActionForControlEvents(this, "performOCR", 1 << 6);
        this.view.addSubview(ocrButton);

        //Add close button
        const closeButton = UIButton.buttonWithType(0);
        closeButton.frame = {x: 170, y: 5, width: 25, height: 25};
        closeButton.setTitleForState("×", 0);
        closeButton.setTitleColorForState(UIColor.grayColor(), 0);
        closeButton.titleLabel.font = UIFont.systemFontOfSize(20);
        closeButton.addTargetActionForControlEvents(this, "close", 1 << 6);
        this.view.addSubview(closeButton);
    }
}
```

#### A little magic to make the window automatically "welt"

MNOCR has a very considerate feature: when you drag the window close to the edge of the screen, it will automatically "snap" to it. This function is actually not difficult to implement:

```javascript
// Edge adsorption - make the panel more obedient
snapToEdge() {
    const frame = this.view.frame;
    const bounds = this.view.superview.bounds;

    // Define the adsorption distance (triggered when how many pixels close to the edge)
    const snapDistance = 20;

    // Calculate the distance to each side
    const distances = {
        left: frame.x,
        right: bounds.width - (frame.x + frame.width),
        top: frame.y,
        bottom: bounds.height - (frame.y + frame.height)
    };

    // find the nearest edge
    let minDistance = Math.min(...Object.values(distances));

    // If it's close enough, stick to it
    if (minDistance < snapDistance) {
        let targetFrame = {...frame};

        if (distances.left === minDistance) {
            targetFrame.x = 10; // Leave some space on the left
        } else if (distances.right === minDistance) {
            targetFrame.x = bounds.width - frame.width - 10;
        } else if (distances.top === minDistance) {
            targetFrame.y = 10;
        } else if (distances.bottom === minDistance) {
            targetFrame.y = bounds.height - frame.height - 10;
        }

        // Animation adsorption effect
        UIView.animateWithDuration(0.3, () => {
            this.view.frame = targetFrame;
        }, {
            // Use elastic animation to be more natural
            usingSpringWithDamping: 0.7,
            initialSpringVelocity: 0.5
        });
    }
}
```

### 13.3 Processing recognition results - making OCR smarter

Recognizing the text is only the first step, how to process the results is the key. MNOCR does a great job in this regard, let's learn its ideas.

#### How to convert formula into LaTeX?

For mathematical formulas, we need special treatment:

```javascript
class FormulaOCR {
    // Identify mathematical formulas
    static async recognizeFormula(imageData) {
        // Use a dedicated math OCR service (such as SimpleTex)
        const result = await this.callMathOCRService(imageData);

        // Process the returned LaTeX
        return this.formatLatex(result);
    }

    // Format LaTeX - so that it displays correctly in MarginNote
    static formatLatex(latex) {
        //Remove extra spaces
        latex = latex.trim();

        // Make sure you have the correct delimiters
        if (!latex.startsWith('$$')) {
            latex = '$$' + latex + '$$';
        }

        // Handle common formatting issues
        latex = latex.replace(/\\\n/g, '\\\\'); // newline character
        latex = latex.replace(/\s+/g, ' '); // extra spaces

        return latex;
    }

    // Intelligent judgment: Is this a formula or ordinary text?
    static async smartRecognize(imageData) {
        // First quickly analyze the image features
        const features = this.analyzeImage(imageData);

        if (features.likelyFormula) {
            // looks like a formula, use formula to identify
            return await this.recognizeFormula(imageData);
        } else {
            // normal text
            return await SimpleOCR.recognizeText(imageData);
        }
    }

    // Simple image feature analysis
    static analyzeImage(imageData) {
        //Here you can judge based on the image characteristics
        // For example: including mathematical symbols, structured layout, etc.
        //Simplified example:
        return {
            likelyFormula: true // Actually requires more complex judgment
        };
    }
}
```

#### Smart caching: don’t make users wait repeatedly

OCR usually takes a few seconds, and if the user recognizes the same image repeatedly, it would be silly to wait each time. MNOCR’s caching strategy is worth learning:

```javascript
class OCRCache {
    constructor() {
        // Note: real MNOCR uses objects instead of Maps
        // Actual code: static OCRBuffer = {}
        this.cache = {};
        this.cacheTime = 60 * 60 * 1000; // 1 hour
        this.maxCacheSize = 50; // Limit cache size
    }

    // Generate cache key - real implementation needs to include configuration parameters
    getCacheKey(imageData, config = {}) {
        // Important: It is actually necessary to import the configuration into MD5
        // Because different parameters may produce different OCR results
        const base64 = imageData.base64Encoding();
        const configStr = JSON.stringify(config);
        const combined = configStr + base64;

        return MNUtil.MD5(combined);
    }

    // Get cache - real implementation considers configuration parameters
    get(imageData, config = {}) {
        const key = this.getCacheKey(imageData, config);
        const cached = this.cache[key];

        if (cached) {
            // Check if it has expired
            if (Date.now() - cached.time < this.cacheTime) {
                MNUtil.waitHUD("Read from cache..."); // Use waitHUD
                return cached.result;
            } else {
                // Expired, delete
                delete this.cache[key];
            }
        }

        return null;
    }

    // Set up cache
    set(imageData, result, config = {}) {
        const key = this.getCacheKey(imageData, config);
        this.cache[key] = {
            result: result,
            time: Date.now()
        };

        // Cache restriction strategy in actual projects
        const cacheKeys = Object.keys(this.cache);
        if (cacheKeys.length > this.maxCacheSize) {
            // Delete the oldest cache (LRU strategy)
            const oldestKey = cacheKeys.reduce((oldest, current) => {
                return this.cache[current].time < this.cache[oldest].time ? current : oldest;
            });
            delete this.cache[oldestKey];
        }

        // Log (only when debugging)
        MNUtil.log({
            source: "OCR Cache",
            message: "✅ Caching results",
            detail: `Cache key: ${key.substring(0, 8)}...`
        });
    }
}

// Using cached OCR - real implementation example
class CachedOCR {
    constructor() {
        this.cache = new OCRCache();
        this.currentConfig = { //Add configuration management
            source: "SimpleTex",
            language: "zh-CN"
        };
    }

    async recognize(imageData) {
        //Check cache first
        let result = this.cache.get(imageData);
        if (result) {
            return result;
        }

        // No cache, perform OCR
        MNUtil.showHUD("Recognizing...");
        result = await FormulaOCR.smartRecognize(imageData);

        // Store in cache
        this.cache.set(imageData, result);

        return result;
    }
}
```

#### Error handling: graceful degradation when OCR fails

The network may be disconnected and the API may be limited. We need to handle these situations gracefully:

```javascript
class RobustOCR {
    // OCR with retry
    static async recognizeWithRetry(imageData, maxRetries = 3) {
        let lastError = null;

        for (let i = 0; i < maxRetries; i++) {
            try {
                // try to identify
                const result = await this.performOCR(imageData);
                return result;

            } catch (error) {
                lastError = error;

                //Determine whether to retry based on the error type
                if (this.shouldRetry(error)) {
                    MNUtil.showHUD(`Recognition failed, retrying... (${i + 1}/${maxRetries})`);
                    // Wait for a while and try again
                    await MNUtil.delay(1);
                } else {
                    // Error that should not be retried, exit directly
                    break;
                }
            }
        }

        // All retries failed
        this.handleError(lastError);
        throw lastError;
    }

    // Determine whether we should try again
    static shouldRetry(error) {
        //Network errors can be retried
        if (error.code === 'NETWORK_ERROR') {
            return true;
        }
        // API current limit can also be retried
        if (error.code === 'RATE_LIMIT') {
            return true;
        }
        // Other errors will not be retried
        return false;
    }

    // error handling
    static handleError(error) {
        //Give different prompts based on error type
        let message = "Recognition failed";

        if (error.code === 'NETWORK_ERROR') {
            message = "Network connection failed, please check the network";
        } else if (error.code === 'RATE_LIMIT') {
            message = "The request is too frequent, please try again later";
        } else if (error.code === 'INVALID_IMAGE') {
            message = "Image format not supported";
        } else if (error.code === 'API_KEY_INVALID') {
            message = "API key is invalid, please check settings";
        }

        MNUtil.showHUD(message);

        // Record error log
        MNUtil.log("OCR Error:", error);
    }
}
```

### 13.4 Small project: Make a simple formula recognition plug-in

🚫 **About the following complete example**: This is a **teaching demo version**, the main purpose is to show how to organize the code structure and implement basic functions.

**Differences from the real MNOCR plugin**:
- Real version: 3000+ lines of code, supports 40+ AI models, complete error handling
- Tutorial version: 200+ lines of code, simulated OCR calls, simplified function implementation

**Need to add during actual development**:
1. Real OCR API key management
2. Adaptation layer for multiple OCR services
3. Error retry mechanism for network requests
4. Image preprocessing and compression optimization
5. Persistent storage of user configuration
6. Multi-window support and memory management

---

Now let us integrate the knowledge we have learned and make a complete small plug-in!

#### Complete code implementation (200 lines to complete core functions)

```javascript
// MiniFormulaOCR - Mini formula recognition plug-in
JSB.newAddon = () => {
    return JSB.defineClass('MiniFormulaOCR : JSExtension', {
        //Plug-in information
        static: {
            name: "MiniFormulaOCR",
            version: "1.0.0"
        },

        // initialization
        init: function() {
            this.floatingPanel = null;
            this.ocrCache = new Map();
        },

        // When window is open - real implementation needs to check dependencies
        sceneWillConnect: async function() {
            // IMPORTANT: Check MNUtils version compatibility
            if (typeof MNUtil === 'undefined') {
                MNUtil.showHUD("Please install the MNUtils framework first");
                return;
            }

            // check version
            if (MNUtil.getExtensionVersion() < 4.0) {
                MNUtil.showHUD("The MNUtils version is out of date, please update");
                return;
            }

            this.init();
        },

        // When the notebook is opened - the actual need to determine the mode
        notebookWillOpen: async function(notebookid) {
            //Key: Get the current learning mode
            const studyController = MNUtil.studyController();
            if (!studyController) return;

            // studyMode: 0=document mode, 1=mind map mode, 2=outline mode, 3=review mode
            if (studyController.studyMode >= 3) {
                //Do not display the OCR panel in review mode
                if (this.floatingPanel) {
                    this.floatingPanel.hidden = true;
                }
                return;
            }

            //Show the panel in document/mindmap/outline mode
            try {
                this.createFloatingPanel();
                this.notebookId = notebookid; // Save notebook ID
            } catch (error) {
                MNUtil.log("Failed to create OCR panel: " + error.message);
            }
        },

        // Create floating panel
        createFloatingPanel: function() {
            // Main view
            const panel = UIView.new();
            panel.frame = {x: 50, y: 100, width: 180, height: 120};
            panel.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.95);
            panel.layer.cornerRadius = 10;
            panel.layer.shadowOpacity = 0.3;
            panel.layer.shadowRadius = 5;

            // title
            const title = UILabel.new();
            title.text = "Formula Recognition";
            title.frame = {x: 0, y: 10, width: 180, height: 30};
            title.textAlignment = 1;
            title.font = UIFont.boldSystemFontOfSize(14);
            panel.addSubview(title);

            //Identify button
            const ocrBtn = this.createButton("Identification formula", {x: 15, y: 45, width: 150, height: 35});
            ocrBtn.addTargetActionForControlEvents(this, "performOCR", 1 << 6);
            panel.addSubview(ocrBtn);

            // cache status
            const cacheLabel = UILabel.new();
            cacheLabel.text = "Cache: 0";
            cacheLabel.frame = {x: 15, y: 85, width: 150, height: 20};
            cacheLabel.textAlignment = 0;
            cacheLabel.font = UIFont.systemFontOfSize(11);
            cacheLabel.textColor = UIColor.grayColor();
            panel.addSubview(cacheLabel);
            this.cacheLabel = cacheLabel;

            //Add drag gesture
            const panGesture = new UIPanGestureRecognizer(this, "handlePan:");
            panel.addGestureRecognizer(panGesture);

            //Add to view
            MNUtil.getDocumentController().view.addSubview(panel);
            this.floatingPanel = panel;
        },

        //Create button
        createButton: function(title, frame) {
            const btn = UIButton.buttonWithType(0);
            btn.frame = frame;
            btn.setTitleForState(title, 0);
            btn.backgroundColor = UIColor.systemBlueColor();
            btn.setTitleColorForState(UIColor.whiteColor(), 0);
            btn.layer.cornerRadius = 5;
            btn.titleLabel.font = UIFont.systemFontOfSize(14);
            return btn;
        },

        // Handle dragging
        handlePan: function(gesture) {
            const translation = gesture.translationInView(this.floatingPanel.superview);
            const view = this.floatingPanel;

            if (gesture.state === 2) { // Dragging
                const center = {
                    x: view.center.x + translation.x,
                    y: view.center.y + translation.y
                };
                view.center = center;
                gesture.setTranslationInView({x: 0, y: 0}, view.superview);
            }
        },

        //Perform OCR - IMPORTANT: This is a tutorial example, not a real OCR call
        performOCR: async function() {
            try {
                // Get the selected note
                const note = MNNote.getFocusNote();
                if (!note) {
                    MNUtil.showHUD("Please select the note containing the picture first");
                    return;
                }

                // Extract image - using real MNUtils methods
                const imageData = this.extractImageFromNote(note);
                if (!imageData) {
                    MNUtil.showHUD("Image content not found");
                    return;
                }

                // ⚠️ IMPORTANT: This is a simulated OCR call, for demonstration purposes only
                //Required in actual projects:
                // 1. Apply for a real OCR API key (such as SimpleTex, Doc2X)
                // 2. Implement correct network requests
                // 3. Handle various error conditions

                MNUtil.showHUD("Recognizing image content...");

                //Simulate network delay
                await MNUtil.delay(2);

                // Simulate recognition results (delete this part in the real project)
                const mockResults = [
                    "$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$",
                    "$$E = mc^2$$",
                    "$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$",
                    "This is a recognized normal text"
                ];
                const result = mockResults[Math.floor(Math.random() * mockResults.length)];

                //Apply results to notes
                this.applyResultToNote(note, result);

                MNUtil.showHUD("✅ Recognition completed (demo mode)");

            } catch (error) {
                MNUtil.showHUD("Recognition failed: " + error.message);
                // IMPORTANT: Error handling and logging
                MNUtil.log({
                    source: "OCR Plugin",
                    message: "Recognition error",
                    level: "ERROR",
                    detail: error.toString()
                });
            }
        },

        // Extract pictures - implement logic based on real MNOCR
        extractImageFromNote: function(note) {
            // Step 1: Check the excerpt picture (excerptPic)
            if (note.excerptPic && note.excerptPic.paint) {
                //Use the media acquisition method of MNUtils
                const imageData = MNUtil.getMediaByHash(note.excerptPic.paint);
                if (imageData) return imageData;
            }

            // Step 2: Traverse the comments to find pictures
            for (const comment of note.comments) {
                // PaintNote type: handwritten notes or pictures
                if (comment.type === "PaintNote" && comment.paint) {
                    const imageData = MNUtil.getMediaByHash(comment.paint);
                    if (imageData) return imageData;
                }

                // LinkNote type: merged content (may include images)
                if (comment.type === "LinkNote" && comment.q_hpic?.paint) {
                    const imageData = MNUtil.getMediaByHash(comment.q_hpic.paint);
                    if (imageData) return imageData;
                }
            }

            return null;
        },

        // Apply results to notes - real note taking
        applyResultToNote: function(note, result) {
            // Important: Use undoGrouping to wrap operations and support undoing
            MNUtil.undoGrouping(() => {
                // Determine the result type and apply it to the appropriate location
                if (result.startsWith('$$') && result.endsWith('$$')) {
                    // LaTeX formula: add to comments
                    note.appendMarkdownComment(result);
                    MNUtil.showHUD("✅ Formula has been added to the comment");
                } else {
                    // Ordinary text: set to excerpt content
                    note.excerptText = result;
                    note.excerptTextMarkdown = true; // Support Markdown format
                    MNUtil.showHUD("✅ Text has been set to excerpt");
                }
            });

            // Optional: send notifications to other plug-ins (advanced usage)
            MNUtil.postNotification("OCRFinished", {
                noteId: note.noteId,
                result: result,
                action: result.startsWith('$$') ? "formula" : "text"
            });
        },

        // Generate cache key
        getCacheKey: function(imageData) {
            // Simplified version: use data length as key
            // Should actually use MD5 or other hashing
            return "img_" + imageData.length;
        },

        // Apply recognition results
        applyResult: function(note, latex) {
            //Add formula as comment
            MNNote.addTextComment(note, latex);

            // If the excerpt is an image, you can choose to replace it with text
            if (note.excerptPic && !note.excerptText) {
                UIAlertView.showWithTitleMessage(
                    "Replace excerpt?",
                    "Replace image excerpts with formula text?",
                    0,
                    ["Cancel", "Replace"],
                    (alert, buttonIndex) => {
                        if (buttonIndex === 1) {
                            MNNote.updateExcerptText(note, latex);
                            MNUtil.showHUD("Excerpt replaced");
                        }
                    }
                );
            }
        },

        //Update cache tag
        updateCacheLabel: function() {
            if (this.cacheLabel) {
                this.cacheLabel.text = `Cache: ${this.ocrCache.size}`;
            }
        },

        // clean up
        notebookWillClose: function(notebookid) {
            if (this.floatingPanel) {
                this.floatingPanel.removeFromSuperview();
                this.floatingPanel = null;
            }
            this.ocrCache.clear();
        }
    });
};
```

#### Testing and Debugging Tips

🛠️ **Debugging method** (based on real MNOCR development experience):

1. **Use MNUtil.log for logging**:
   ```javascript
   // structured log
   MNUtil.log({
     source: "OCR Plugin",
     message: "Image extraction successful",
     detail: `Image size: ${imageData.length} bytes`
   });
   ```

2. **Error handling and log replication**:
   ```javascript
   try {
     //OCR operation
   } catch (error) {
     // Automatically copy error information to the clipboard
     MNUtil.copyJSON({
       error: error.toString(),
       stack: error.stack,
       time: new Date().toISOString()
     });
     MNUtil.showHUD("Error copied to clipboard");
   }
   ```

3. **Test different scenarios** (Important!):
   - ✅ Mathematical formula pictures in PDF documents
   - ✅ Scanned version of handwritten notes
   - ✅ Pictures in various sizes and resolutions
   - ✅ Test in different learning modes (document/brain map/review)

### 13.5 Practical development guidelines and considerations

#### 🔑 Get real OCR API

**SimpleTex API** (dedicated to mathematical formulas):
- Official website: https://simpletex.cn/
- Features: Specifically for mathematical formulas, LaTeX output quality is high
- Pricing: Billed by the number of calls, with free quota

**Doc2X API** (Universal OCR):
- Function: Supports comprehensive recognition of documents, tables, and formulas
- Features: Chinese recognition accuracy is high, supports batch processing

**OpenAI Vision API**:
- Model: GPT-4o, GPT-4 Turbo with Vision
- Features: Strong understanding ability and can describe the content of pictures
- Suitable for: intelligent recognition of complex scenes

#### ⚠️ Common pitfalls in development

1. **Network request problem**:
   - ❌ Do not use the deprecated `NSURLConnection`
   - ✅ Use `NSURLSession` and `dataTaskWithRequest`
   - ✅ Correctly handle multipart/form-data format

2. **Life cycle management**:
   ```javascript
   // ❌ Error: Forgot to check for MNUtils
   notebookWillOpen: function(notebookid) {
       this.createPanel();
   }

   // ✅ Correct: check dependencies first
   notebookWillOpen: async function(notebookid) {
       if (!(await this.checkMNUtil())) return;
       if (MNUtil.studyController().studyMode >= 3) return; // Skip review mode
       this.createPanel();
   }
   ```

3. **Memory and Performance**:
   - ✅ Large pictures need to be compressed before sending
   - ✅ Set size limit for cache
   - ✅ Release unused views promptly

4. **Multi-window support**:
   ```javascript
   // ✅ Data is mounted to self instead of global variables
   notebookWillOpen: function(notebookid) {
       self.ocrController = new OCRController(); // ✅
       globalOCRController = new OCRController(); // ❌
   }
   ```

#### 🚀 Performance optimization suggestions

1. **Network Optimization**:
   - Image compression: compress large images to less than 1MB
   - Concurrency control: limit the number of simultaneous OCR requests
   - Timeout setting: avoid long waiting

2. **Caching Strategy**:
   ```javascript
   // Cache keys based on content and configuration
   getCacheKey: function(imageData, config) {
       const content = imageData.base64Encoding();
       const settings = JSON.stringify(config);
       return MNUtil.MD5(content + settings);
   }
   ```

3. **User Experience**:
   - Show progress indicator
   - Supports canceling ongoing requests
   - Provide clear error messages

#### 📚 Learning resources and references

1. **In-depth study of MNOCR plug-in**:
   - View the complete source code: `mnocr/mnocr/` directory
   - Read in-depth analysis: `MNOCR plug-in in-depth analysis.md`

2. **Related documents**:
   - MNUtils API Guide: `mnutils/MNUtils_API_Guide.md`
   - Basics of plug-in development: basic tutorials in previous chapters

3. **Community and Support**:
   - MarginNote official forum
   - GitHub open source plug-in project

---

### 🎯 Summary of this chapter

After studying this chapter, you should master:

✅ **Core Concept**:
- Basic principles and application scenarios of OCR
- Basic methods of network requests and API calls
- Implementation ideas of caching mechanism

✅ **Practical skills**:
- Create draggable floating panels
- Extract image data from MarginNote notes
- Process OCR results and apply them to notes

✅ **Advanced knowledge**:
- Complexity and development points of real plug-ins
- Best practices for performance optimization and error handling
- Multi-window support and memory management

**Next step suggestions**:
1. Try to apply for a free OCR API key
2. Implement a simplest version based on the tutorial code
3. Gradually add more features (multi-format support, batch processing, etc.)
4. Refer to the MNOCR plug-in to learn more advanced implementation techniques

Remember: **Excellent plug-ins are not written in a day**! Start simple, iterate step by step, and fully test each feature. The OCR plug-in involves many aspects such as network, image processing, UI interaction, etc. It is a good comprehensive exercise project.

3. **Performance Monitoring**:
   ```javascript
   const startTime = Date.now();
   const result = await this.recognizeFormula(imageData);
   const elapsed = Date.now() - startTime;
   MNUtil.log(`OCR took ${elapsed}ms`);
   ```

#### Pitfalls and solutions that users will encounter

**Pit 1: Image extraction failed**
- Problem: `note.excerptPic` is sometimes undefined
- Resolution: Always check multiple sources (excerpts, reviews, merged content)

**Pit 2: Cache key conflict**
- Problem: Different images may generate the same cache key
- Solution: Use a more reliable hash algorithm (MD5, SHA256)

**Pit 3: Memory leak**
- Problem: Infinite cache growth causes memory problems
- Solution: Limit cache size and implement LRU elimination strategy

**Pit 4: Network request blocking UI**
- Problem: The interface freezes during OCR request
- Solution: Use asynchronous requests to display progress prompts

### Summary of this chapter

Congratulations! Through this chapter, you have learned:

1. **OCR Basics**: Understand the principles of OCR and its application in MarginNote
2. **Floating Panel**: Created a floating window that can be dragged and automatically adsorbed
3. **Caching Strategy**: Implements intelligent caching to improve user experience
4. **Error Handling**: Learned to handle various abnormal situations gracefully
5. **Complete Project**: Implemented a usable formula recognition plug-in from scratch

The OCR function seems complicated, but it can be broken down into: getting the image → calling the service → processing the result. The key is to focus on user experience, such as adding caching, optimizing the interface, handling errors, etc.

In the next chapter, we’ll explore an even more exciting feature: how to make plugins talk to AI to achieve streaming responses! You will learn the essence of the MNAI plug-in and create your own AI assistant.

---

## Chapter 14: Let Plugins Talk to AI - The Secret of Streaming Response
