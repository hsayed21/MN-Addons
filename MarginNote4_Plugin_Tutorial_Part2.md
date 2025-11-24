# Part 2: Create a beautiful interface

> 🎨 **Welcome to the UI world! **
>
> We learned the basic development of plug-ins earlier, now it’s time to make your plug-ins beautiful! In this part we will learn how to create various UI interfaces, from simple buttons to complex floating panels, so that your plug-in is not only powerful but also looks good online.
>
> 📚 **Learning Path**: Button → Panel → Web Page → Architecture
>
> 💡 **Learning Tips**: Each chapter has complete runnable code. It is recommended to read and practice at the same time!

---

## Chapter 5: Your First Button - Getting Started with Native UI

> **Difficulty**: ⭐⭐ | **Estimated time**: 30 minutes | **Based on**: MNToolbar plugin analysis
>
> Imagine if MarginNote didn't have those buttons, how would you use it? Buttons are the most basic element for users to interact with plug-ins. Today, we start with the simplest button and learn the UI development of MarginNote.

### 5.1 Why should we learn UI?

#### A life-like example

Have you ever had this experience:
- When you see an ugly software interface, you immediately don’t want to use it?
- Between two apps with the same functions, do you always choose the one with a better-looking interface?

The same is true in MarginNote plug-in development. **A good UI is not a decoration, but an extension of functionality**.

#### UI elements in MarginNote

Open MarginNote and you will see:
- **Toolbar Buttons**: Export, Settings, Search...
- **Floating Panel**: color picker, font panel...
- **Pop-up window**: Setting interface, help document...

These are the UI elements we need to learn to make!

#### What are we going to do?

After this chapter, you will be able to:
- ✅ Create various styles of buttons
- ✅ Respond to user clicks
- ✅ Understand the basic principles of layout
- ✅ Make a simple toolbar

### 5.2 Create your first button

#### Hands-on time: Hello Button

Let's start with the most basic buttons:

```javascript
// Real implementation based on MNToolbar plug-in
JSB.newAddon = function(mainPath) {
    JSB.require('utils');
    
    return JSB.defineClass('MyFirstButton : JSExtension', {
        //Create button when notebook is opened
        notebookWillOpen: function(notebookid) {
            this.createMyFirstButton();
        },
        
        // Core method for creating buttons
        createMyFirstButton: function() {
            // Step 1: Create button object
            const button = UIButton.buttonWithType(0); // 0 = normal button
            
            // Step 2: Set button properties
            button.frame = {x: 100, y: 100, width: 120, height: 40}; // Position and size
            button.setTitleForState("Click me to try", 0); // Button text
            button.backgroundColor = UIColor.systemBlueColor(); // Background color
            button.setTitleColorForState(UIColor.whiteColor(), 0); // Text color
            
            // Step 3: Add click event
            button.addTargetActionForControlEvents(
                this, // target object
                "buttonClicked:", //Method name (note the colon)
                1 << 6 //Click event type
            );
            
            // Step 4: Add to interface
            const studyView = MNUtil.studyView;
            studyView.addSubview(button);
            
            //Save the button reference for subsequent operations
            this.myButton = button;
        },
        
        //Response to button click
        buttonClicked: function(sender) {
            MNUtil.showHUD("🎉 You clicked the button!");
        }
    });
};
```

**Operating effect**: A blue button will appear in MarginNote, and a prompt message will be displayed after clicking it.

#### Make the button respond to clicks

We just saw the most basic click response, now let it do something more interesting:

```javascript
// Enhanced version of button click processing
buttonClicked: function(sender) {
    //Change button text
    const clickCount = (this.clickCount || 0) + 1;
    this.clickCount = clickCount;
    
    sender.setTitleForState(`Clicked ${clickCount} times`, 0);
    
    //Change color based on number of clicks
    const colors = [
        UIColor.systemBlueColor(),
        UIColor.systemGreenColor(),
        UIColor.systemOrangeColor(),
        UIColor.systemRedColor()
    ];
    const colorIndex = (clickCount - 1) % colors.length;
    sender.backgroundColor = colors[colorIndex];
    
    //Special handling
    if (clickCount === 10) {
        MNUtil.showHUD("🏆 Congratulations! You have won the title of Click Master!");
    }
}
```

#### Add icons and styles

Tips for making your buttons look better:

```javascript
createStyledButton: function() {
    const button = UIButton.buttonWithType(0);
    button.frame = {x: 100, y: 200, width: 150, height: 50};
    
    //Set rounded corners
    button.layer.cornerRadius = 10;
    button.layer.masksToBounds = true;
    
    // add shadow
    button.layer.shadowColor = UIColor.blackColor().CGColor;
    button.layer.shadowOffset = {width: 0, height: 2};
    button.layer.shadowRadius = 4;
    button.layer.shadowOpacity = 0.3;
    
    // Gradient background (advanced technique)
    const gradient = CAGradientLayer.new();
    gradient.frame = button.bounds;
    gradient.colors = [
        UIColor.colorWithRed(0.2, 0.8, 1.0, 1.0).CGColor,
        UIColor.colorWithRed(0.1, 0.6, 0.9, 1.0).CGColor
    ];
    button.layer.insertSublayerAtIndex(gradient, 0);
    
    return button;
}
```

#### FAQ

**Q: There is no response when clicking the button? **
A: Check whether the method name is correct, be sure to add a colon `"methodName:"`

**Q: The button cannot be displayed? **
A: Make sure it is added to the correct parent view and the frame is set appropriately.

**Q: The button position is wrong? **
A: The coordinate system of the frame is relative to the parent view. Check the size of the parent view.

### 5.3 The Art of Layout

#### What is Frame?

Imagine you put pictures on your wall:
- **x, y**: The position of the upper left corner of the photo
- **width, height**: width and height of the photo

```javascript
// Frame is a description of a rectangular area
button.frame = {
    x: 50, // 50 points from the left side of the parent view
    y: 100, // 100 points from the top of the parent view
    width: 120, // width 120 points
    height: 40 // height 40 points
};
```

#### Calculate position and size

Layout algorithm based on MNToolbar:

```javascript
//Smart layout calculator
calculateButtonLayout: function(buttonCount, containerFrame) {
    const buttonWidth = 60;
    const buttonHeight = 40;
    const spacing = 10;
    const margin = 20;
    
    // Calculate how many buttons can be placed in each row
    const buttonsPerRow = Math.floor(
        (containerFrame.width - 2 * margin + spacing) /
        (buttonWidth + spacing)
    );
    
    const layouts = [];
    for (let i = 0; i < buttonCount; i++) {
        const row = Math.floor(i / buttonsPerRow);
        const col = i % buttonsPerRow;
        
        layouts.push({
            x: margin + col * (buttonWidth + spacing),
            y: margin + row * (buttonHeight + spacing),
            width: buttonWidth,
            height: buttonHeight
        });
    }
    
    return layouts;
}
```

#### Adapt to different screens

Make your UI look good on different devices:

```javascript
//Responsive layout
createResponsiveButton: function() {
    // Get screen information
    const screenBounds = UIScreen.mainScreen().bounds;
    const isPhone = screenBounds.width < 768; // Determine whether it is a mobile phone
    
    //Adjust the size of the button according to the screen
    const buttonSize = isPhone?
        {width: 100, height: 35} :
        {width: 120, height: 40};
    
    // center placement
    const button = UIButton.buttonWithType(0);
    button.frame = {
        x: (screenBounds.width - buttonSize.width) / 2,
        y: 100,
        width: buttonSize.width,
        height: buttonSize.height
    };
    
    return button;
}
```

#### Practice: Make a toolbar

Comprehensively apply the knowledge you have learned to create a simple toolbar:

```javascript
// Complete toolbar example
createToolbar: function() {
    //Create toolbar container
    const toolbar = UIView.new();
    toolbar.frame = {x: 20, y: 50, width: 300, height: 60};
    toolbar.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.95);
    toolbar.layer.cornerRadius = 8;
    toolbar.layer.shadowOpacity = 0.2;
    toolbar.layer.shadowRadius = 4;
    
    //Button configuration
    const buttons = [
        {title: "📝", action: "editNote:"},
        {title: "🎨", action: "changeColor:"},
        {title: "📋", action: "copyText:"},
        {title: "⚙️", action: "showSettings:"}
    ];
    
    //Create button
    const buttonWidth = 50;
    const buttonHeight = 40;
    const startX = 20;
    const spacing = (toolbar.frame.width - startX * 2 - buttonWidth * buttons.length) / (buttons.length - 1);
    
    buttons.forEach((config, index) => {
        const button = UIButton.buttonWithType(0);
        button.frame = {
            x: startX + index * (buttonWidth + spacing),
            y: 10,
            width: buttonWidth,
            height: buttonHeight
        };
        
        button.setTitleForState(config.title, 0);
        button.titleLabel.font = UIFont.systemFontOfSize(20);
        button.addTargetActionForControlEvents(this, config.action, 1 << 6);
        
        //Add click animation
        button.addTargetActionForControlEvents(this, "buttonTouchDown:", 1 << 0); // Press
        button.addTargetActionForControlEvents(this, "buttonTouchUp:", 1 << 7); // Lift up
        
        toolbar.addSubview(button);
    });
    
    //Add to interface
    MNUtil.studyView.addSubview(toolbar);
    this.toolbar = toolbar;
}
```

### 5.4 Summary of this chapter

#### What did you learn?

🎯 **Core Skills**:
- ✅ Create and configure UIButton
- ✅ Handle click events
- ✅ Understand the frame layout system
- ✅ Add visual effects (rounded corners, shadows)
- ✅ Responsive layout thinking

🛠️ **Practical Project**:
- Created color-changing buttons
- Implemented smart layout
- Complete toolbar created

#### What can be done next?

Now that you have mastered using buttons, try:
1. Add a button interface to your previous plug-in
2. Make a personal toolbox
3. Try more complex layouts

**Next Chapter Preview**: We will learn to make floating panels that can be dragged freely to make the interface more flexible and interesting!

---

## Chapter 6: Flying Panel - Floating Window Development

> **Difficulty**: ⭐⭐⭐ | **Estimated time**: 45 minutes | **Based on**: MNOCR, MNSnipaste plug-in analysis
>
> Remember those floating balls on your phone? They can be dragged to any position without blocking important content, making them particularly convenient to use. Today we will learn how to create such a "flying" panel in MarginNote.

### 6.1 What is a floating panel?

#### "Post-it notes" in life

Floating panels are like digital versions of sticky notes:
- 📌 **Post it anywhere**: Put it wherever you want
- 🏃‍♂️ **Follow you**: Content will not be lost when scrolling
- 💡 **Close when used**: Does not occupy a fixed space
- 🎯 **Focus function**: Only display the tools you currently need

#### Floating elements in MarginNote

In MarginNote, you will see these floating interfaces:
- **Color Panel**: pops up when selecting note color
- **Search box**: can be dragged to the appropriate location
- **Tooltip**: Temporarily displayed help information

#### Design a small toolbox

Features of the floating panel we are going to make:
- 🎨 **Semi-transparent background**: Does not completely obscure content
- 👆 **Supports dragging**: Place it wherever you want
- 📱 **Smart adsorption**: Automatically welt to prevent occlusion
- ✨ **Smooth Animation**: Animation effect when moving

### 6.2 Create a draggable panel

#### Basic panel structure

Let’s start with the simplest floating panel:

```javascript
// Real implementation based on MNOCR and MNSnipaste
createFloatingPanel: function() {
    // Create panel container
    const panel = UIView.new();
    panel.frame = {x: 100, y: 100, width: 200, height: 120};
    
    // Set the appearance - make it appear to "float" on the interface
    panel.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.95);
    panel.layer.cornerRadius = 12;
    panel.layer.shadowColor = UIColor.blackColor().CGColor;
    panel.layer.shadowOffset = {width: 0, height: 4};
    panel.layer.shadowRadius = 8;
    panel.layer.shadowOpacity = 0.3;
    
    //Add title bar (for dragging)
    const titleBar = UIView.new();
    titleBar.frame = {x: 0, y: 0, width: 200, height: 30};
    titleBar.backgroundColor = UIColor.systemBlueColor().colorWithAlphaComponent(0.1);
    panel.addSubview(titleBar);
    
    // title text
    const titleLabel = UILabel.new();
    titleLabel.frame = {x: 10, y: 5, width: 120, height: 20};
    titleLabel.text = "Small Toolbox";
    titleLabel.font = UIFont.boldSystemFontOfSize(14);
    titleBar.addSubview(titleLabel);
    
    // close button
    const closeButton = UIButton.buttonWithType(0);
    closeButton.frame = {x: 165, y: 5, width: 25, height: 20};
    closeButton.setTitleForState("✕", 0);
    closeButton.setTitleColorForState(UIColor.redColor(), 0);
    closeButton.addTargetActionForControlEvents(this, "closePanel:", 1 << 6);
    titleBar.addSubview(closeButton);
    
    //Add to interface
    MNUtil.studyView.addSubview(panel);
    MNUtil.studyView.bringSubviewToFront(panel); // Make sure it is at the front
    
    this.floatingPanel = panel;
    return panel;
}
```

#### Add drag gesture

This is the key to making the panel "fly":

```javascript
//Add drag function (based on real plug-in implementation)
addDragGesture: function(panel) {
    //Create a drag gesture recognizer
    const panGesture = new UIPanGestureRecognizer(this, "handlePanGesture:");
    panel.addGestureRecognizer(panGesture);
    
    //Initialize drag related properties
    this.isDragging = false;
    this.dragOffset = {x: 0, y: 0};
}

// Handle drag gestures (core implementation)
handlePanGesture: function(gesture) {
    const panel = this.floatingPanel;
    const state = gesture.state;
    const translation = gesture.translationInView(MNUtil.studyView);
    
    switch(state) {
        case 1: // Start dragging
            this.isDragging = true;
            this.dragStartFrame = panel.frame;
            
            // Visual feedback: slightly zoom in
            UIView.animateWithDuration(0.1, () => {
                panel.transform = CGAffineTransformMakeScale(1.05, 1.05);
                panel.layer.shadowOpacity = 0.5; // Enhance shadow
            });
            break;
            
        case 2: // Dragging
            if (this.isDragging) {
                const newFrame = {
                    x: this.dragStartFrame.x + translation.x,
                    y: this.dragStartFrame.y + translation.y,
                    width: panel.frame.width,
                    height: panel.frame.height
                };
                
                // Boundary check: prevent the panel from being dragged off the screen
                const bounds = MNUtil.studyView.bounds;
                newFrame.x = Math.max(0, Math.min(newFrame.x, bounds.width - newFrame.width));
                newFrame.y = Math.max(0, Math.min(newFrame.y, bounds.height - newFrame.height));
                
                panel.frame = newFrame;
            }
            break;
            
        case 3: // Drag ends
            this.isDragging = false;
            
            // restore appearance
            UIView.animateWithDuration(0.2, () => {
                panel.transform = CGAffineTransformIdentity;
                panel.layer.shadowOpacity = 0.3;
            });
            
            //Smart adsorption (more details below)
            this.snapToEdge();
            break;
    }
}
```

#### Handling boundary collisions

To prevent the panel from running outside the screen:

```javascript
// Bounds checking and correction
checkBounds: function(frame) {
    const bounds = MNUtil.studyView.bounds;
    const margin = 10; // Leave a little margin
    
    // Correct position
    frame.x = Math.max(margin, Math.min(frame.x, bounds.width - frame.width - margin));
    frame.y = Math.max(margin, Math.min(frame.y, bounds.height - frame.height - margin));
    
    return frame;
}

// Intelligent positioning: avoid blocking important content
smartPosition: function() {
    const bounds = MNUtil.studyView.bounds;
    const panelFrame = this.floatingPanel.frame;
    
    // Check whether the central area is blocked
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;
    const centerRegion = {
        x: centerX - 150,
        y: centerY - 100,
        width: 300,
        height: 200
    };
    
    // If in the center area, move to the edge
    if (this.frameIntersects(panelFrame, centerRegion)) {
        const newX = panelFrame.x < centerX ? 20 : bounds.width - panelFrame.width - 20;
        
        UIView.animateWithDuration(0.3, () => {
            this.floatingPanel.frame = {
                x: newX,
                y: panelFrame.y,
                width: panelFrame.width,
                height: panelFrame.height
            };
        });
    }
}
```

#### Debugging Tips

Debugging methods when developing drag functions:

```javascript
//Debug information display
debugDrag: function(gesture) {
    const translation = gesture.translationInView(MNUtil.studyView);
    const velocity = gesture.velocityInView(MNUtil.studyView);
    
    MNUtil.log({
        source: "FloatingPanel",
        message: `Drag state: ${gesture.state}`,
        detail: {
            translation: translation,
            velocity: velocity,
            frame: this.floatingPanel.frame
        }
    });
    
    // Display debugging information on the interface (used during development)
    if (this.debugMode) {
        const debugLabel = this.debugLabel || this.createDebugLabel();
        debugLabel.text = `Displacement: (${Math.round(translation.x)}, ${Math.round(translation.y)})`;
    }
}
```

### 6.3 Smart adsorption and animation

#### Edge adsorption algorithm

Let the panel automatically adhere to its edges like a magnet:

```javascript
// Edge adsorption implementation based on MNOCR
snapToEdge: function() {
    const panel = this.floatingPanel;
    const frame = panel.frame;
    const bounds = MNUtil.studyView.bounds;
    const threshold = 50; // adsorption trigger distance
    
    // Calculate the distance to each side
    const distances = {
        left: frame.x,
        right: bounds.width - (frame.x + frame.width),
        top: frame.y,
        bottom: bounds.height - (frame.y + frame.height)
    };
    
    // find the nearest edge
    const minDistance = Math.min(...Object.values(distances));
    
    // If it's close enough, stick to it
    if (minDistance < threshold) {
        let targetFrame = {...frame};
        
        if (distances.left === minDistance) {
            targetFrame.x = 10; // left edge
        } else if (distances.right === minDistance) {
            targetFrame.x = bounds.width - frame.width - 10; // right edge
        } else if (distances.top === minDistance) {
            targetFrame.y = 10; // top edge
        } else {
            targetFrame.y = bounds.height - frame.height - 10; // lower edge
        }
        
        // Move smoothly to the target position
        UIView.animateWithDuration(0.3, () => {
            panel.frame = targetFrame;
        });
        
        // Haptic feedback (if supported)
        this.triggerHapticFeedback();
    }
}
```

#### Smooth animation effect

Make panel movement more natural:

```javascript
// Flexible animation
animateToPosition: function(targetFrame) {
    const panel = this.floatingPanel;
    
    // Use elastic animation
    UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptions(
        0.6, // animation duration
        0, // delay
        0.7, // Damping coefficient (0-1, the smaller it is, the more elastic it is)
        0.5, // initial speed
        0, // Animation options
        () => {
            panel.frame = targetFrame;
        },
        () => {
            //Animation completion callback
            this.onAnimationComplete();
        }
    );
}

//Easing function (custom animation curve)
createCustomAnimation: function(targetFrame) {
    const startFrame = this.floatingPanel.frame;
    const duration = 0.5;
    let startTime = Date.now();
    
    const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        
        //Use easeOutBack easing function
        const easedProgress = this.easeOutBack(progress);
        
        const currentFrame = {
            x: startFrame.x + (targetFrame.x - startFrame.x) * easedProgress,
            y: startFrame.y + (targetFrame.y - startFrame.y) * easedProgress,
            width: startFrame.width,
            height: startFrame.height
        };
        
        this.floatingPanel.frame = currentFrame;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

//Easing function implementation
easeOutBack: function(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
```

#### User experience optimization

Make dragging more intuitive:

```javascript
// Optimize dragging experience
optimizeDragExperience: function() {
    const panel = this.floatingPanel;
    
    // 1. Prevent accidental dragging: dragging is only possible on the title bar
    this.restrictDragToTitleBar();
    
    // 2. Remember the user’s location preference
    this.rememberPosition();
    
    // 3. Adjust the panel size according to the content
    this.autoResize();
    
    // 4. Smart hiding: automatically translucent when not used for a long time
    this.setupAutoFade();
}

//Limit the dragging area
restrictDragToTitleBar: function() {
    const titleBar = this.floatingPanel.subviews[0]; // The first subview is the title bar
    
    // Remove the gesture from the panel and only add it to the title bar
    this.floatingPanel.gestureRecognizers.forEach(gesture => {
        this.floatingPanel.removeGestureRecognizer(gesture);
    });
    
    const panGesture = new UIPanGestureRecognizer(this, "handlePanGesture:");
    titleBar.addGestureRecognizer(panGesture);
}

//remember location
rememberPosition: function() {
    const frame = this.floatingPanel.frame;
    const position = {
        x: frame.x,
        y: frame.y
    };
    
    //Save to local storage
    MNUtil.setUserDefaults("FloatingPanelPosition", position);
}

// restore position
restorePosition: function() {
    const savedPosition = MNUtil.getUserDefaults("FloatingPanelPosition");
    if (savedPosition) {
        const panel = this.floatingPanel;
        panel.frame = {
            x: savedPosition.x,
            y: savedPosition.y,
            width: panel.frame.width,
            height: panel.frame.height
        };
    }
}
```

#### Practice: Mini Note Panel

Combine all the technologies and make a practical small panel:

```javascript
// Complete mini note panel
createMiniNotePanel: function() {
    //Create panel
    const panel = this.createFloatingPanel();
    
    //Add function button
    const buttons = [
        {title: "📝", action: "quickNote:", tooltip: "QuickNote"},
        {title: "🎨", action: "pickColor:", tooltip: "Pick Color"},
        {title: "📋", action: "copyNote:", tooltip: "Copy content"},
        {title: "⭐", action: "starNote:", tooltip: "Add to favorites"}
    ];
    
    const buttonSize = 30;
    const margin = 10;
    let currentY = 40; // below the title bar
    
    buttons.forEach((config, index) => {
        const button = UIButton.buttonWithType(0);
        button.frame = {
            x: margin,
            y: currentY,
            width: panel.frame.width - 2 * margin,
            height: buttonSize
        };
        
        button.setTitleForState(config.title + " " + config.tooltip, 0);
        button.titleLabel.font = UIFont.systemFontOfSize(12);
        button.contentHorizontalAlignment = 0; // Left aligned
        button.backgroundColor = UIColor.systemGrayColor().colorWithAlphaComponent(0.1);
        button.layer.cornerRadius = 4;
        
        //Add click animation
        button.addTargetActionForControlEvents(this, "buttonTouchDown:", 1 << 0);
        button.addTargetActionForControlEvents(this, config.action, 1 << 6);
        
        panel.addSubview(button);
        currentY += buttonSize + 5;
    });
    
    //Adjust panel height
    panel.frame = {
        x: panel.frame.x,
        y: panel.frame.y,
        width: panel.frame.width,
        height: currentY + margin
    };
    
    //Add drag and snap functions
    this.addDragGesture(panel);
    this.restorePosition();
    
    return panel;
}

// Button animation effect
buttonTouchDown: function(button) {
    UIView.animateWithDuration(0.1, () => {
        button.transform = CGAffineTransformMakeScale(0.95, 0.95);
    }, () => {
        UIView.animateWithDuration(0.1, () => {
            button.transform = CGAffineTransformIdentity;
        });
    });
}
```

### 6.4 Summary of this chapter

#### What did you learn?

🎯 **Core Skills**:
- ✅ Create floating panels and set skins
- ✅ Implement drag gestures and response processing
- ✅ Boundary check and smart adsorption algorithm
- ✅ Animation effects and user experience optimization
- ✅ Location memory and status saving

🛠️ **Technical Points**:
-Usage of UIPanGestureRecognizer
- UIView animation system
- Coordinate system transformation and boundary calculation
- User preference storage

#### Frequently Asked Questions and Solutions

**Q: What should I do if it freezes while dragging? **
A: Reduce the amount of calculation during dragging and avoid complicated operations in gesture processing.

**Q: Panel disappears in some cases? **
A: Check the bounds change of the parent view to ensure that the panel is within the visible range

**Q: The adsorption effect is unnatural? **
A: Adjust the adsorption distance threshold and animation duration, and test different parameters

**Next Chapter Preview**: We will learn the use of WebView and embed web pages into plug-ins to achieve more complex interface effects!

---

## Chapter 7: Embedding Web Pages - WebView Development

> **Difficulty**: ⭐⭐⭐⭐ | **Estimated Time**: 60 minutes | **Based on**: MN WebDAV Plugin Analysis
>
> Sometimes, native UI controls cannot meet our needs, such as displaying rich text, making complex forms, or integrating third-party web services. This is where WebView is needed - it's like opening a small browser window inside the plug-in.

### 7.1 Why do we need WebView?

#### Native UI vs Web UI

Let’s compare:

**Advantages of native UI**:
- ✅ Good performance and fast response
- ✅ High system integration
- ✅ Small memory usage
- ✅ Improved gesture support

**Advantages of Web UI**:
- ✅ High development efficiency (HTML/CSS/JS)
- ✅ Strong style expression
- ✅ Good cross-platform compatibility
- ✅ Rich third-party libraries

#### Applicable scenario analysis

**When to use WebView? **
- 📊 **Complex data display**: tables, charts, reports
- 🎨 **Rich Text Editor**: Supports formatted text input
- 📋 **Complex Form**: multi-step, conditionally displayed form
- 🌐 **Integrated Web Services**: OAuth login, online API documentation
- 📱 **Cross-platform UI**: One set of code can be used on multiple platforms

**Usage scenarios of MN WebDAV plug-in**:
- File management interface (similar to Finder)
- Configuration settings form
- Progress display and log viewing
- Server connection status monitoring

#### Prepare HTML resources

Before we start, we need to prepare some HTML files:

```html
<!-- index.html - main interface -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My WebView interface</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
            margin: 0;
            padding: 20px;
            background: #f5f5f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .btn {
            background: #007AFF;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
        }
        .btn:hover {
            background: #0056CC;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌐 WebView Example</h1>
        <p>This is a web page embedded in the MarginNote plug-in! </p>
        
        <button class="btn" onclick="callNative('showHUD', 'Greetings from the web!')">
            Click to call native method
        </button>
        
        <div id="content">
            <!-- Dynamic content will be displayed here -->
        </div>
    </div>
    
    <script src="app.js"></script>
</body>
</html>
```

### 7.2 Create and configure WebView

#### Basic settings of WebView

Real implementation based on MN WebDAV plug-in:

```javascript
//Create WebView controller
createWebViewController: function() {
    // Create WebView
    const webView = UIWebView.new();
    
    //Set size and position
    webView.frame = MNUtil.studyView.bounds;
    webView.autoresizingMask = (1 << 1) | (1 << 4); // Automatic resizing
    
    //Configure WebView properties
    webView.backgroundColor = UIColor.clearColor();
    webView.opaque = false;
    webView.scrollView.backgroundColor = UIColor.clearColor();
    webView.scrollView.showsHorizontalScrollIndicator = false;
    webView.scrollView.showsVerticalScrollIndicator = true;
    
    //Set the proxy (important! Used to handle navigation events)
    webView.delegate = this;
    
    //Add to interface
    const containerView = UIView.new();
    containerView.frame = {x: 100, y: 100, width: 600, height: 400};
    containerView.backgroundColor = UIColor.whiteColor();
    containerView.layer.cornerRadius = 12;
    containerView.layer.shadowOpacity = 0.2;
    containerView.layer.shadowRadius = 8;
    
    containerView.addSubview(webView);
    MNUtil.studyView.addSubview(containerView);
    
    this.webView = webView;
    this.webViewContainer = containerView;
    
    return webView;
}
```

#### Load local HTML

There are several ways to load HTML content:

```javascript
// Method 1: Load local HTML file
loadLocalHTML: function() {
    const htmlPath = this.addonPath + "/index.html";
    const htmlURL = NSURL.fileURLWithPath(htmlPath);
    const request = NSURLRequest.requestWithURL(htmlURL);
    this.webView.loadRequest(request);
}

// Method 2: Load HTML string directly
loadHTMLString: function() {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Embedded page</title>
        <style>
            body { font-family: -apple-system; padding: 20px; }
            .card { background: white; border-radius: 8px; padding: 16px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>📱 Dynamically generated page</h2>
            <p>Current time: ${new Date().toLocaleString()}</p>
            <button onclick="native_showMessage('Hello from HTML!')">
                Call native method
            </button>
        </div>
    </body>
    </html>`;
    
    this.webView.loadHTMLStringBaseURL(htmlContent, null);
}

// Method 3: Load network URL (requires network permission)
loadWebURL: function(url) {
    const request = NSURLRequest.requestWithURL(NSURL.URLWithString(url));
    this.webView.loadRequest(request);
}
```

#### Style and script management

Make HTML pages better looking and more useful:

```javascript
// Dynamically inject CSS styles
injectCSS: function(cssRules) {
    const cssString = cssRules.join(' ');
    const jsCode = `
        const style = document.createElement('style');
        style.textContent = \`${cssString}\`;
        document.head.appendChild(style);
    `;
    this.webView.evaluateJavaScript(jsCode);
}

// Dynamically inject JavaScript
injectJS: function(jsCode) {
    this.webView.evaluateJavaScript(jsCode);
}

// Predefine some useful styles
setupWebViewStyles: function() {
    const styles = [
        'body { margin: 0; font-family: -apple-system, sans-serif; }',
        '.native-bridge { display: none; }', // Hide the bridge element
        '.loading { text-align: center; padding: 40px; color: #666; }',
        '.error { background: #ffebee; color: #c62828; padding: 16px; border-radius: 8px; margin: 16px; }'
    ];
    this.injectCSS(styles);
}

//Add JavaScript tool function
setupWebViewJS: function() {
    const jsUtils = `
        // Tool function: call native method
        function callNative(method, ...args) {
            const params = args.map(arg => encodeURIComponent(JSON.stringify(arg))).join('&');
            window.location.href = 'mnwebview://' + method + '?' + params;
        }
        
        // Tool function: display loading status
        function showLoading(message = 'Loading...') {
            document.body.innerHTML = '<div class="loading">' + message + '</div>';
        }
        
        // Utility function: display errors
        function showError(message) {
            const errorDiv = '<div class="error">❌ ' + message + '</div>';
            document.body.innerHTML = errorDiv + document.body.innerHTML;
        }
        
        console.log('WebView tool function has been loaded');
    `;
    this.injectJS(jsUtils);
}
```

#### Common pitfalls

Problems easily encountered when developing WebView:

```javascript
// Trap 1: Resource path problem
// ❌ Error: Relative paths may not be valid in WebView
// <img src="./images/logo.png">

// ✅ Correct: use absolute path or base URL
setupResourcePaths: function() {
    const baseURL = "file://" + this.addonPath + "/";
    const htmlContent = this.loadHTMLTemplate();
    this.webView.loadHTMLStringBaseURL(htmlContent, NSURL.URLWithString(baseURL));
}

// Trap 2: Memory leak
// ❌ Error: Forgot to set delegate to nil
// ✅ Correct: clean up resources
cleanupWebView: function() {
    if (this.webView) {
        this.webView.delegate = null;
        this.webView.removeFromSuperview();
        this.webView = null;
    }
}

// Trap 3: JavaScript error handling
// ❌ Error: Ignore JS errors
// ✅ Correct: catch and handle errors
webViewDidFailLoadWithError: function(webView, error) {
    MNUtil.log("WebView failed to load: " + error.localizedDescription);
    const errorHTML = `
        <div style="text-align:center; padding:40px; color:#666;">
            <h3>⚠️ Page loading failed</h3>
            <p>${error.localizedDescription}</p>
            <button onclick="window.location.reload()">Reload</button>
        </div>
    `;
    webView.loadHTMLStringBaseURL(errorHTML, null);
}
```

### 7.3 Native and JS communication

#### Native calls JS

Send data and commands from the plugin to the web page:

```javascript
//Basic JS calls
callJavaScript: function(jsCode) {
    if (this.webView) {
        this.webView.evaluateJavaScript(jsCode);
    }
}

// Call the function in the web page
callWebFunction: function(functionName, ...args) {
    const argsString = args.map(arg => JSON.stringify(arg)).join(', ');
    const jsCode = `${functionName}(${argsString})`;
    this.callJavaScript(jsCode);
}

//Update web page content
updateWebContent: function(elementId, content) {
    const jsCode = `
        const element = document.getElementById('${elementId}');
        if (element) {
            element.innerHTML = ${JSON.stringify(content)};
        }
    `;
    this.callJavaScript(jsCode);
}

//Actual usage example
showFileList: function(files) {
    const fileListHTML = files.map(file => `
        <div class="file-item" onclick="selectFile('${file.name}')">
            <span class="file-icon">${this.getFileIcon(file.type)}</span>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${this.formatFileSize(file.size)}</span>
        </div>
    `).join('');
    
    this.updateWebContent('fileList', fileListHTML);
}

//Show loading progress
updateProgress: function(percent, message) {
    this.callWebFunction('updateProgress', percent, message);
}
```

#### JS calls Native

Send a message to the plugin from the web page:

```javascript
// WebView proxy method: intercept URL requests
webViewShouldStartLoadWithRequest: function(webView, request, navigationType) {
    const url = request.URL.absoluteString;
    
    // Check if it is a custom protocol
    if (url.startsWith('mnwebview://')) {
        this.handleWebViewRequest(url);
        return false; // Prevent default navigation
    }
    
    return true; // Allow normal navigation
}

// Handle requests from web pages
handleWebViewRequest: function(url) {
    try {
        // Parse URL: mnwebview://method?param1=value1¶m2=value2
        const urlParts = url.replace('mnwebview://', '').split('?');
        const method = urlParts[0];
        const params = {};
        
        if (urlParts[1]) {
            urlParts[1].split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                params[key] = decodeURIComponent(value);
            });
        }
        
        // Call the corresponding processing function according to the method name
        this.handleWebViewMethod(method, params);
        
    } catch (error) {
        MNUtil.log("Failed to process WebView request: " + error.message);
    }
}

// Handle specific method calls
handleWebViewMethod: function(method, params) {
    switch(method) {
        case 'showHUD':
            MNUtil.showHUD(params.message || 'Message from web page');
            break;
            
        case 'selectFile':
            this.selectFile(params.filename);
            break;
            
        case 'uploadFile':
            this.uploadFile(params.filepath, params.destination);
            break;
            
        case 'showSettings':
            this.showSettingsPanel();
            break;
            
        case 'log':
            MNUtil.log("WebView: " + (params.message || ''));
            break;
            
        default:
            MNUtil.log("Unknown WebView method: " + method);
    }
}
```

#### Data delivery strategy

Efficiently transfer complex data between native and JS:

```javascript
//Optimization solution for passing large amounts of data
sendDataToWebView: function(data) {
    //Method 1: Direct transfer (suitable for small data)
    if (JSON.stringify(data).length < 1000) {
        this.callWebFunction('receiveData', data);
        return;
    }
    
    //Method 2: Delivery in batches (suitable for big data)
    const chunks = this.chunkArray(data, 50); // 50 items per batch
    this.callWebFunction('prepareDataReceive', chunks.length);
    
    chunks.forEach((chunk, index) => {
        setTimeout(() => {
            this.callWebFunction('receiveDataChunk', chunk, index);
        }, index * 10); // Send a batch every 10ms
    });
}

// Build more complex communication protocols
setupAdvancedCommunication: function() {
    //Create a message queue in the web page
    const setupJS = `
        window.nativeMessageQueue = [];
        window.sendToNative = function(action, data, callback) {
            const messageId = Date.now() + '_' + Math.random();
            
            //If there is a callback, store it
            if (callback) {
                window.nativeCallbacks = window.nativeCallbacks || {};
                window.nativeCallbacks[messageId] = callback;
            }
            
            // send message
            const message = {
                id: messageId,
                action: action,
                data: data,
                timestamp: Date.now()
            };
            
            window.location.href = 'mnwebview://message?data=' +
                encodeURIComponent(JSON.stringify(message));
        };
        
        // Handle callbacks from native
        window.handleNativeCallback = function(messageId, result) {
            if (window.nativeCallbacks && window.nativeCallbacks[messageId]) {
                window.nativeCallbacks[messageId](result);
                delete window.nativeCallbacks[messageId];
            }
        };
    `;
    
    this.injectJS(setupJS);
}
```

#### 实践：富文本编辑器

把学到的知识组合起来，实现一个简单的富文本编辑器：

```javascript
// 富文本编辑器插件
createRichTextEditor: function() {
    // 创建WebView
    const webView = this.createWebViewController();
    
    // 准备HTML内容
    const editorHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>富文本编辑器</title>
        <style>
            body { margin: 0; font-family: -apple-system; background: #f5f5f5; }
            .toolbar { 
                background: white; 
                padding: 10px; 
                border-bottom: 1px solid #ddd;
                display: flex;
                gap: 10px;
            }
            .btn { 
                padding: 8px 12px; 
                border: 1px solid #ddd; 
                background: white;
                border-radius: 4px; 
                cursor: pointer; 
            }
            .btn:hover { background: #f0f0f0; }
            .btn.active { background: #007AFF; color: white; }
            #editor { 
                min-height: 300px; 
                padding: 20px; 
                background: white; 
                margin: 10px;
                border-radius: 8px;
                outline: none;
            }
        </style>
    </head>
    <body>
        <div class="toolbar">
            <button class="btn" onclick="formatText('bold')"><b>B</b></button>
            <button class="btn" onclick="formatText('italic')"><i>I</i></button>
            <button class="btn" onclick="formatText('underline')"><u>U</u></button>
            <button class="btn" onclick="insertLink()">🔗</button>
            <button class="btn" onclick="insertImage()">🖼️</button>
            <button class="btn" onclick="saveContent()">💾</button>
        </div>
        
        <div id="editor" contenteditable="true" placeholder="开始写作...">
        </div>
        
        <script>
            function formatText(command) {
                document.execCommand(command, false, null);
                updateToolbar();
            }
            
            function insertLink() {
                const url = prompt('请输入链接地址:');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
            }
            
            function insertImage() {
                callNative('selectImage');
            }
            
            function saveContent() {
                const content = document.getElementById('editor').innerHTML;
                callNative('saveContent', content);
            }
            
            function updateToolbar() {
                // 更新工具栏按钮状态
                document.querySelectorAll('.btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                if (document.queryCommandState('bold')) {
                    document.querySelector('[onclick*="bold"]').classList.add('active');
                }
                // ... 其他按钮状态
            }
            
            function callNative(method, data) {
                window.location.href = 'mnwebview://' + method + 
                    (data ? '?data=' + encodeURIComponent(JSON.stringify(data)) : '');
            }
            
            // 定期保存草稿
            setInterval(function() {
                const content = document.getElementById('editor').innerHTML;
                callNative('saveDraft', content);
            }, 30000); // 30秒保存一次
        </script>
    </body>
    </html>`;
    
    // 加载编辑器
    webView.loadHTMLStringBaseURL(editorHTML, null);
    
    return webView;
}

// 处理编辑器的原生调用
handleEditorMethod: function(method, params) {
    switch(method) {
        case 'saveContent':
            this.saveToNote(JSON.parse(params.data));
            MNUtil.showHUD("内容已保存");
            break;
            
        case 'saveDraft':
            this.saveDraft(JSON.parse(params.data));
            break;
            
        case 'selectImage':
            this.showImagePicker();
            break;
    }
}

// 保存内容到MarginNote
saveToNote: function(htmlContent) {
    const note = MNNote.getFocusNote();
    if (note) {
        // 转换HTML为Markdown（可选）
        const markdownContent = this.htmlToMarkdown(htmlContent);
        note.appendMarkdownComment(markdownContent);
    }
}
```

### 7.4 本章小结

#### 你学到了什么

🎯 **核心技能**：
- ✅ 创建和配置UIWebView
- ✅ 加载本地HTML文件和字符串
- ✅ 实现原生与JS双向通信
- ✅ 处理WebView生命周期事件
- ✅ 优化WebView性能和用户体验

🛠️ **技术要点**：
- UIWebView的delegate模式
- URL拦截和自定义协议
- JavaScript注入和执行
- 数据序列化和传递
- 错误处理和资源管理

#### 常见问题和解决方案

**Q: WebView显示空白页面？ **
A: 检查HTML路径、资源引用和控制台错误

**Q: JS调用原生方法没反应？ **
A: 确认delegate设置正确，URL格式符合预期

**Q: 性能问题怎么办？ **
A: 减少DOM操作，使用CSS硬件加速，避免内存泄漏

**Q: 在不同设备上显示不一致？ **
A: 使用viewport标签，测试不同屏幕尺寸

#### 最佳实践总结

1. **资源管理**：及时清理WebView，避免内存泄漏
2. **错误处理**：捕获JS错误，提供友好的错误界面  
3. **性能优化**：避免频繁的JS-Native通信
4. **用户体验**：显示加载状态，处理网络异常

**下一章预告**：我们将学习多控制器架构，了解如何组织复杂的插件界面！

---

## 第8章：复杂界面 - 多控制器架构

> **难度**：⭐⭐⭐⭐ | **预计时间**：60分钟 | **基于**：MNToolbar插件分析
>
> 当插件功能越来越复杂时，把所有代码都写在一个控制器里就会变得难以维护。就像管理一个大公司需要不同的部门一样，复杂的插件界面也需要多个控制器来分工协作。

### 8.1 什么时候需要多控制器？

#### 单一职责原则

想象一下这个场景：
- 你的插件有主界面、设置界面、帮助界面
- 每个界面都有自己的逻辑和数据
- 如果全部写在一起，代码会超过几千行

这时候就需要**分而治之**！

#### 实际案例分析

让我们看看MNToolbar插件是如何组织的：

```
MNToolbar 插件架构：
├── 主控制器 (main.js)
│   ├── 生命周期管理
│   ├── 事件协调
│   └── 数据共享
├── 工具栏控制器 (webviewController.js)
│   ├── 固定工具栏UI
│   ├── 动态工具栏UI
│   └── 按钮交互
└── 设置控制器 (settingController.js)
    ├── 配置界面
    ├── 选项管理
    └── 数据同步
```

每个控制器都有明确的职责，相互配合又相对独立。

#### 架构设计思路

设计多控制器架构时要考虑：

1. **职责划分**：每个控制器负责什么？
2. **数据流动**：控制器间如何传递数据？
3. **生命周期**：何时创建、显示、销毁控制器？
4. **错误隔离**：一个控制器出错不影响其他

### 8.2 控制器的创建和管理

#### 主控制器设计

主控制器是整个插件的"大脑"：

```javascript
// 基于MNToolbar的主控制器架构
JSB.newAddon = function(mainPath) {
    JSB.require('utils');
    JSB.require('webviewController');
    JSB.require('settingController');
    
    return JSB.defineClass('MNToolbar : JSExtension', {
        // === 初始化 ===
        init: function() {
            // 初始化控制器管理器
            self.controllerManager = {
                toolbar: null,      // 工具栏控制器
                setting: null,      // 设置控制器
                dynamic: null,      // 动态工具栏控制器
                active: [],         // 当前活跃的控制器
                history: []         // 控制器历史栈
            };
            
            // 初始化共享数据
            self.sharedData = {
                config: {},         // 配置数据
                state: {},          // 状态数据
                cache: {}           // 缓存数据
            };
            
            // 注册观察者（15个事件）
            this.registerObservers();
        },
        
        // === 生命周期管理 ===
        sceneWillConnect: function() {
            self.init();
        },
        
        notebookWillOpen: function(notebookid) {
            // 确保核心控制器存在
            this.ensureControllers();
            
            //Load configuration
            this.loadConfiguration();
            
            // 显示主要UI
            this.showMainInterface();
        },
        
        notebookWillClose: function(notebookid) {
            // 保存状态
            this.saveCurrentState();
            
            // 清理控制器
            this.cleanupControllers();
        },
        
        // === 控制器管理核心方法 ===
        ensureControllers: function() {
            const manager = self.controllerManager;
            
            // 创建工具栏控制器（如果不存在）
            if (!manager.toolbar) {
                manager.toolbar = toolbarController.new();
                manager.toolbar.mainController = self;
                manager.active.push('toolbar');
            }
            
            // 延迟创建设置控制器（按需创建）
            this.setupLazyControllers();
        },
        
        setupLazyControllers: function() {
            // 设置控制器的延迟创建
            Object.defineProperty(self.controllerManager, 'setting', {
                get: function() {
                    if (!this._setting) {
                        this._setting = settingController.new();
                        this._setting.mainController = self;
                    }
                    return this._setting;
                },
                set: function(value) {
                    this._setting = value;
                }
            });
        }
    });
};
```

#### 子控制器创建

每个子控制器都有标准的结构：

```javascript
// 工具栏控制器 (webviewController.js)
var toolbarController = JSB.defineClass(
    'toolbarController : UIViewController',
    {
        // === 控制器属性 ===
        mainController: null,    // 主控制器引用
        toolbarView: null,       // 工具栏视图
        buttons: [],             // 按钮数组
        isVisible: false,        // 可见状态
        
        // === 生命周期方法 ===
        viewDidLoad: function() {
            // 创建基础视图
            this.setupToolbarView();
            
            // 创建按钮
            this.createButtons();
            
            // 设置手势
            this.setupGestures();
        },
        
        viewWillAppear: function() {
            this.isVisible = true;
            this.refreshButtons();
        },
        
        viewWillDisappear: function() {
            this.isVisible = false;
            this.saveState();
        },
        
        // === 主要功能方法 ===
        setupToolbarView: function() {
            // 创建工具栏容器
            const toolbar = UIView.new();
            toolbar.frame = this.calculateToolbarFrame();
            toolbar.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.95);
            toolbar.layer.cornerRadius = 8;
            toolbar.layer.shadowOpacity = 0.2;
            
            // 添加到主视图
            MNUtil.studyView.addSubview(toolbar);
            this.toolbarView = toolbar;
        },
        
        createButtons: function() {
            // 从配置创建按钮
            const config = this.mainController.sharedData.config.buttons || [];
            
            config.forEach((buttonConfig, index) => {
                const button = this.createButton(buttonConfig, index);
                this.buttons.push(button);
                this.toolbarView.addSubview(button);
            });
        },
        
        // === 与主控制器通信 ===
        notifyMainController: function(event, data) {
            if (this.mainController && this.mainController.handleSubControllerEvent) {
                this.mainController.handleSubControllerEvent(this, event, data);
            }
        },
        
        receiveFromMainController: function(command, data) {
            switch(command) {
                case 'updateConfig':
                    this.updateConfiguration(data);
                    break;
                case 'refreshUI':
                    this.refreshButtons();
                    break;
                case 'hide':
                    this.hideToolbar();
                    break;
                case 'show':
                    this.showToolbar();
                    break;
            }
        }
    }
);
```

#### 生命周期管理

控制器的生命周期需要精心管理：

```javascript
// 控制器生命周期管理器
createControllerLifecycleManager: function() {
    return {
        // 创建控制器
        createController: function(type, config) {
            let controller;
            
            switch(type) {
                case 'toolbar':
                    controller = toolbarController.new();
                    break;
                case 'setting':
                    controller = settingController.new();
                    break;
                case 'dynamic':
                    controller = dynamicToolbarController.new();
                    break;
                default:
                    throw new Error('未知的控制器类型: ' + type);
            }
            
            // 设置通用属性
            controller.mainController = self;
            controller.type = type;
            controller.config = config || {};
            
            // 调用生命周期方法
            if (controller.viewDidLoad) {
                controller.viewDidLoad();
            }
            
            return controller;
        },
        
        // 显示控制器
        presentController: function(controller, animated = true) {
            if (controller.viewWillAppear) {
                controller.viewWillAppear();
            }
            
            if (animated) {
                this.animateControllerPresentation(controller);
            } else {
                controller.view.hidden = false;
            }
            
            // 添加到活跃列表
            const manager = self.controllerManager;
            if (!manager.active.includes(controller.type)) {
                manager.active.push(controller.type);
            }
        },
        
        // 隐藏控制器
        dismissController: function(controller, animated = true) {
            if (controller.viewWillDisappear) {
                controller.viewWillDisappear();
            }
            
            if (animated) {
                this.animateControllerDismissal(controller);
            } else {
                controller.view.hidden = true;
            }
            
            // 从活跃列表移除
            const manager = self.controllerManager;
            const index = manager.active.indexOf(controller.type);
            if (index > -1) {
                manager.active.splice(index, 1);
            }
        },
        
        // 销毁控制器
        destroyController: function(controller) {
            // 调用清理方法
            if (controller.viewWillUnload) {
                controller.viewWillUnload();
            }
            
            // 移除视图
            if (controller.view) {
                controller.view.removeFromSuperview();
            }
            
            // 清理引用
            controller.mainController = null;
            
            // 从管理器中移除
            const manager = self.controllerManager;
            if (manager[controller.type] === controller) {
                manager[controller.type] = null;
            }
        }
    };
}
```

#### 内存管理

避免控制器间的循环引用：

```javascript
// 正确的引用管理
setupControllerReferences: function() {
    // ✅ 正确：使用弱引用
    Object.defineProperty(this.toolbarController, 'mainController', {
        value: self,
        writable: true,
        enumerable: false,
        configurable: true
    });
    
    // ✅ 正确：及时清理引用
    const originalDealloc = this.toolbarController.dealloc;
    this.toolbarController.dealloc = function() {
        this.mainController = null;
        if (originalDealloc) {
            originalDealloc.call(this);
        }
    };
}

// 内存监控（开发时使用）
monitorControllerMemory: function() {
    setInterval(() => {
        const manager = self.controllerManager;
        const activeCount = manager.active.length;
        const totalCreated = Object.keys(manager).length - 2; // 减去active和history
        
        MNUtil.log({
            source: "ControllerMemory",
            message: `活跃控制器: ${activeCount}, 总创建: ${totalCreated}`,
            detail: manager.active
        });
    }, 30000); // 30秒检查一次
}
```

### 8.3 控制器间的协作

#### 状态同步机制

控制器间需要同步状态和数据：

```javascript
// 状态管理中心
createStateManager: function() {
    return {
        state: {},
        observers: {},
        
        // 设置状态
        setState: function(key, value, notifyObservers = true) {
            const oldValue = this.state[key];
            this.state[key] = value;
            
            if (notifyObservers && oldValue !== value) {
                this.notifyObservers(key, value, oldValue);
            }
        },
        
        // 获取状态
        getState: function(key) {
            return this.state[key];
        },
        
        // 观察状态变化
        observe: function(key, controller, callback) {
            if (!this.observers[key]) {
                this.observers[key] = [];
            }
            
            this.observers[key].push({
                controller: controller,
                callback: callback
            });
        },
        
        // 移除观察者
        unobserve: function(key, controller) {
            if (this.observers[key]) {
                this.observers[key] = this.observers[key].filter(
                    observer => observer.controller !== controller
                );
            }
        },
        
        // 通知观察者
        notifyObservers: function(key, newValue, oldValue) {
            const observers = this.observers[key];
            if (observers) {
                observers.forEach(observer => {
                    try {
                        observer.callback.call(observer.controller, newValue, oldValue);
                    } catch (error) {
                        MNUtil.log("状态观察者回调错误: " + error.message);
                    }
                });
            }
        }
    };
}

// 使用状态管理器
setupStateManagement: function() {
    self.stateManager = this.createStateManager();
    
    // 工具栏控制器观察配置变化
    self.stateManager.observe('toolbarConfig', self.controllerManager.toolbar, function(newConfig) {
        this.updateConfiguration(newConfig);
    });
    
    // 设置控制器观察主题变化
    self.stateManager.observe('theme', self.controllerManager.setting, function(newTheme) {
        this.updateTheme(newTheme);
    });
}
```

#### 事件传递链

建立控制器间的事件通信机制：

```javascript
// 事件总线
createEventBus: function() {
    return {
        events: {},
        
        // 发布事件
        emit: function(eventName, data, source) {
            const handlers = this.events[eventName];
            if (handlers) {
                handlers.forEach(handler => {
                    try {
                        handler.callback.call(handler.context, data, source);
                    } catch (error) {
                        MNUtil.log(`事件处理器错误 [${eventName}]: ${error.message}`);
                    }
                });
            }
        },
        
        // 订阅事件
        on: function(eventName, callback, context) {
            if (!this.events[eventName]) {
                this.events[eventName] = [];
            }
            
            this.events[eventName].push({
                callback: callback,
                context: context
            });
        },
        
        // 取消订阅
        off: function(eventName, context) {
            if (this.events[eventName]) {
                this.events[eventName] = this.events[eventName].filter(
                    handler => handler.context !== context
                );
            }
        },
        
        // 一次性订阅
        once: function(eventName, callback, context) {
            const wrapper = function(data, source) {
                callback.call(context, data, source);
                this.off(eventName, context);
            }.bind(this);
            
            this.on(eventName, wrapper, context);
        }
    };
}

// 设置事件通信
setupEventCommunication: function() {
    self.eventBus = this.createEventBus();
    
    // 工具栏按钮点击事件
    self.eventBus.on('buttonClicked', function(buttonData) {
        // 根据按钮类型执行不同操作
        switch(buttonData.type) {
            case 'showSettings':
                this.showSettingsController();
                break;
            case 'toggleDynamic':
                this.toggleDynamicToolbar();
                break;
        }
    }, self);
    
    // 配置更新事件
    self.eventBus.on('configChanged', function(newConfig) {
        // 通知所有相关控制器
        this.broadcastConfigUpdate(newConfig);
    }, self);
}

// 在控制器中发布事件
// 例如在按钮控制器中：
buttonClicked: function(buttonConfig) {
    // 发布按钮点击事件
    self.mainController.eventBus.emit('buttonClicked', {
        type: buttonConfig.action,
        config: buttonConfig
    }, this);
}
```

#### 数据共享策略

控制器间安全地共享数据：

```javascript
// 数据管理器
createDataManager: function() {
    return {
        data: {},
        locks: {},
        
        // 设置数据（带锁机制）
        setData: function(key, value, controllerId) {
            // 检查是否被锁定
            if (this.locks[key] && this.locks[key] !== controllerId) {
                throw new Error(`数据 ${key} 已被控制器 ${this.locks[key]} 锁定`);
            }
            
            this.data[key] = value;
        },
        
        // 获取数据
        getData: function(key) {
            return this.data[key];
        },
        
        // 锁定数据（防止并发修改）
        lockData: function(key, controllerId) {
            this.locks[key] = controllerId;
        },
        
        // 解锁数据
        unlockData: function(key, controllerId) {
            if (this.locks[key] === controllerId) {
                delete this.locks[key];
            }
        },
        
        // 原子操作
        atomicUpdate: function(key, updateFunction, controllerId) {
            this.lockData(key, controllerId);
            try {
                const currentValue = this.getData(key);
                const newValue = updateFunction(currentValue);
                this.setData(key, newValue, controllerId);
                return newValue;
            } finally {
                this.unlockData(key, controllerId);
            }
        }
    };
}

// 共享数据访问器
createSharedDataAccessor: function(controllerId) {
    return {
        // 安全的数据访问
        get: function(key) {
            return self.dataManager.getData(key);
        },
        
        set: function(key, value) {
            return self.dataManager.setData(key, value, controllerId);
        },
        
        // 事务性更新
        update: function(key, updateFunction) {
            return self.dataManager.atomicUpdate(key, updateFunction, controllerId);
        },
        
        // 配置访问快捷方法
        getConfig: function(path) {
            const config = this.get('config') || {};
            return this.getNestedValue(config, path);
        },
        
        setConfig: function(path, value) {
            const config = this.get('config') || {};
            this.setNestedValue(config, path, value);
            this.set('config', config);
        },
        
        // 辅助方法：获取嵌套值
        getNestedValue: function(obj, path) {
            return path.split('.').reduce((current, key) => {
                return current && current[key];
            }, obj);
        },
        
        // 辅助方法：设置嵌套值
        setNestedValue: function(obj, path, value) {
            const keys = path.split('.');
            const lastKey = keys.pop();
            const target = keys.reduce((current, key) => {
                current[key] = current[key] || {};
                return current[key];
            }, obj);
            target[lastKey] = value;
        }
    };
}
```

#### 实践：设置面板系统

把所有学到的知识组合起来，实现一个完整的设置系统：

```javascript
// 设置控制器
var settingController = JSB.defineClass(
    'settingController : UIViewController',
    {
        // === 属性 ===
        mainController: null,
        settingView: null,
        webView: null,
        dataAccessor: null,
        
        // === 初始化 ===
        viewDidLoad: function() {
            // 创建数据访问器
            this.dataAccessor = self.createSharedDataAccessor('settingController');
            
            // 创建设置界面
            this.createSettingInterface();
            
            // 订阅事件
            this.setupEventHandlers();
        },
        
        createSettingInterface: function() {
            // 创建模态背景
            const modalBackground = UIView.new();
            modalBackground.frame = MNUtil.studyView.bounds;
            modalBackground.backgroundColor = UIColor.blackColor().colorWithAlphaComponent(0.5);
            modalBackground.autoresizingMask = (1 << 1) | (1 << 4);
            
            // 创建设置面板
            const settingPanel = UIView.new();
            const panelSize = {width: 500, height: 600};
            settingPanel.frame = {
                x: (modalBackground.frame.width - panelSize.width) / 2,
                y: (modalBackground.frame.height - panelSize.height) / 2,
                width: panelSize.width,
                height: panelSize.height
            };
            settingPanel.backgroundColor = UIColor.whiteColor();
            settingPanel.layer.cornerRadius = 16;
            settingPanel.layer.shadowOpacity = 0.3;
            settingPanel.layer.shadowRadius = 20;
            
            // 创建WebView显示设置界面
            const webView = UIWebView.new();
            webView.frame = {x: 0, y: 40, width: panelSize.width, height: panelSize.height - 80};
            webView.delegate = this;
            
            // 创建顶部栏
            this.createTopBar(settingPanel);
            
            // 组装界面
            settingPanel.addSubview(webView);
            modalBackground.addSubview(settingPanel);
            MNUtil.studyView.addSubview(modalBackground);
            
            this.settingView = modalBackground;
            this.webView = webView;
            
            // 加载设置页面
            this.loadSettingPage();
        },
        
        createTopBar: function(container) {
            const topBar = UIView.new();
            topBar.frame = {x: 0, y: 0, width: container.frame.width, height: 40};
            topBar.backgroundColor = UIColor.systemGrayColor().colorWithAlphaComponent(0.1);
            
            // 标题
            const titleLabel = UILabel.new();
            titleLabel.frame = {x: 20, y: 10, width: 200, height: 20};
            titleLabel.text = "⚙️ 插件设置";
            titleLabel.font = UIFont.boldSystemFontOfSize(16);
            topBar.addSubview(titleLabel);
            
            // 关闭按钮
            const closeButton = UIButton.buttonWithType(0);
            closeButton.frame = {x: container.frame.width - 40, y: 5, width: 30, height: 30};
            closeButton.setTitleForState("✕", 0);
            closeButton.setTitleColorForState(UIColor.redColor(), 0);
            closeButton.addTargetActionForControlEvents(this, "closeSetting:", 1 << 6);
            topBar.addSubview(closeButton);
            
            container.addSubview(topBar);
        },
        
        loadSettingPage: function() {
            const htmlContent = this.generateSettingHTML();
            this.webView.loadHTMLStringBaseURL(htmlContent, null);
        },
        
        generateSettingHTML: function() {
            const config = this.dataAccessor.getConfig('toolbar') || {};
            
            return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>设置</title>
                <style>
                    body { font-family: -apple-system; margin: 20px; background: #f9f9f9; }
                    .section { background: white; margin: 10px 0; padding: 20px; border-radius: 8px; }
                    .section h3 { margin-top: 0; color: #333; }
                    .setting-item { display: flex; justify-content: space-between; align-items: center; margin: 15px 0; }
                    .setting-item label { font-weight: 500; }
                    input, select, button { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
                    button { background: #007AFF; color: white; border: none; cursor: pointer; }
                    button:hover { background: #0056CC; }
                    .color-preview { width: 30px; height: 30px; border-radius: 15px; border: 2px solid #ddd; }
                </style>
            </head>
            <body>
                <div class="section">
                    <h3>🎨 外观设置</h3>
                    <div class="setting-item">
                        <label>主题颜色</label>
                        <div onclick="chooseColor('theme')" class="color-preview" style="background: ${config.themeColor || '#007AFF'}"></div>
                    </div>
                    <div class="setting-item">
                        <label>工具栏位置</label>
                        <select id="toolbarPosition" onchange="updateSetting('toolbarPosition', this.value)">
                            <option value="top" ${config.position === 'top' ? 'selected' : ''}>顶部</option>
                            <option value="bottom" ${config.position === 'bottom' ? 'selected' : ''}>底部</option>
                            <option value="left" ${config.position === 'left' ? 'selected' : ''}>左侧</option>
                            <option value="right" ${config.position === 'right' ? 'selected' : ''}>右侧</option>
                        </select>
                    </div>
                </div>
                
                <div class="section">
                    <h3>🔧 功能设置</h3>
                    <div class="setting-item">
                        <label>自动隐藏</label>
                        <input type="checkbox" ${config.autoHide ? 'checked' : ''} 
                               onchange="updateSetting('autoHide', this.checked)">
                    </div>
                    <div class="setting-item">
                        <label>动画效果</label>
                        <input type="checkbox" ${config.animation !== false ? 'checked' : ''} 
                               onchange="updateSetting('animation', this.checked)">
                    </div>
                </div>
                
                <div class="section">
                    <h3>💾 数据管理</h3>
                    <div class="setting-item">
                        <label>导出配置</label>
                        <button onclick="exportConfig()">导出</button>
                    </div>
                    <div class="setting-item">
                        <label>导入配置</label>
                        <button onclick="importConfig()">导入</button>
                    </div>
                </div>
                
                <script>
                    function updateSetting(key, value) {
                        callNative('updateSetting', {key: key, value: value});
                    }
                    
                    function chooseColor(type) {
                        callNative('chooseColor', {type: type});
                    }
                    
                    function exportConfig() {
                        callNative('exportConfig');
                    }
                    
                    function importConfig() {
                        callNative('importConfig');
                    }
                    
                    function callNative(method, data) {
                        window.location.href = 'mnsetting://' + method + 
                            '?data=' + encodeURIComponent(JSON.stringify(data));
                    }
                </script>
            </body>
            </html>`;
        },
        
        // === WebView代理方法 ===
        webViewShouldStartLoadWithRequest: function(webView, request) {
            const url = request.URL.absoluteString;
            
            if (url.startsWith('mnsetting://')) {
                this.handleSettingRequest(url);
                return false;
            }
            
            return true;
        },
        
        handleSettingRequest: function(url) {
            const urlParts = url.replace('mnsetting://', '').split('?');
            const method = urlParts[0];
            const params = urlParts[1] ? JSON.parse(decodeURIComponent(urlParts[1].split('=')[1])) : {};
            
            switch(method) {
                case 'updateSetting':
                    this.updateSettingValue(params.key, params.value);
                    break;
                case 'chooseColor':
                    this.showColorPicker(params.type);
                    break;
                case 'exportConfig':
                    this.exportConfiguration();
                    break;
                case 'importConfig':
                    this.importConfiguration();
                    break;
            }
        },
        
        updateSettingValue: function(key, value) {
            // 更新共享数据
            this.dataAccessor.setConfig(`toolbar.${key}`, value);
            
            // 发布配置变更事件
            self.eventBus.emit('configChanged', {
                key: key,
                value: value
            }, this);
            
            // 立即应用配置
            this.applyConfigurationChange(key, value);
        },
        
        applyConfigurationChange: function(key, value) {
            switch(key) {
                case 'toolbarPosition':
                    self.controllerManager.toolbar.updatePosition(value);
                    break;
                case 'themeColor':
                    self.controllerManager.toolbar.updateTheme(value);
                    break;
                case 'autoHide':
                    self.controllerManager.toolbar.setAutoHide(value);
                    break;
            }
        },
        
        // === 事件处理 ===
        setupEventHandlers: function() {
            // 订阅主控制器的事件
            self.eventBus.on('showSettings', function() {
                this.presentSelf();
            }, this);
            
            self.eventBus.on('themeChanged', function(newTheme) {
                this.updateSettingInterface(newTheme);
            }, this);
        },
        
        // === 显示和隐藏 ===
        presentSelf: function() {
            this.settingView.hidden = false;
            
            // 入场动画
            this.settingView.alpha = 0;
            UIView.animateWithDuration(0.3, () => {
                this.settingView.alpha = 1;
            });
        },
        
        closeSetting: function() {
            // 退场动画
            UIView.animateWithDuration(0.2, () => {
                this.settingView.alpha = 0;
            }, () => {
                this.settingView.hidden = true;
                this.settingView.alpha = 1;
            });
        }
    }
);
```

### 8.4 本章小结

#### 你学到了什么

🎯 **核心技能**：
- ✅ 设计多控制器架构
- ✅ 管理控制器生命周期
- ✅ 实现控制器间通信
- ✅ 共享数据和状态管理
- ✅ 事件总线和观察者模式
- ✅ 内存管理和性能优化

🛠️ **架构模式**：
- 主控制器-子控制器模式
- 状态管理中心模式
- 事件总线模式
- 数据访问器模式
- 生命周期管理器模式

#### 架构设计原则

1. **单一职责**：每个控制器只负责一块功能
2. **松耦合**：控制器间通过事件和数据接口通信
3. **可扩展**：新增控制器不影响现有结构
4. **可维护**：清晰的层次和职责划分

#### 常见问题和解决方案

**Q: 控制器间循环引用怎么办？ **
A: 使用弱引用、事件总线，避免直接相互持有

**Q: 数据同步出现冲突？ **
A: 使用数据锁机制，或者单一数据源原则

**Q: 控制器创建顺序问题？ **
A: 使用依赖注入，或者延迟创建模式

**Q: 内存占用过高？ **
A: 按需创建控制器，及时清理不用的控制器

#### 下一部分预告

恭喜完成UI开发篇！接下来我们将进入**第三部分：核心功能篇**，学习网络请求、配置管理、插件通信等核心技术。这些技术将让你的插件真正强大起来！

---
