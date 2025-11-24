/**
 * Hello World - MarginNote 4 Plugin
 *
 * A minimal example plugin demonstrating the basic structure and lifecycle
 * of a MarginNote plugin. This plugin shows a "Hello World" message when
 * the plugin button is clicked.
 *
 * @author Your Name
 * @version 1.0.0
 */

JSB.newAddon = function (mainPath) {
  // CRITICAL: self refers to the plugin instance (Objective-C object)
  // NOT JavaScript's global object. Each MarginNote window gets its own instance.

  /**
   * Main plugin class extending JSExtension
   * Class declaration format: "ClassName : ParentClass"
   */
  const HelloWorldPlugin = JSB.defineClass(
    'HelloWorld : JSExtension',
    {
      // ============================================================
      // INSTANCE METHODS (per-window lifecycle)
      // ============================================================

      /**
       * Window Lifecycle: Called when a new MarginNote window opens
       * This is the FIRST lifecycle method called for each window
       *
       * Use this to:
       * - Initialize plugin instance data (attached to self)
       * - Get references to Application and StudyController
       * - Setup window-specific state
       */
      sceneWillConnect: function () {
        // Store Application singleton reference
        self.app = Application.sharedInstance();

        // Get the study controller for this specific window
        self.studyController = self.app.studyController(self.window);

        // Initialize window-specific data
        self.clickCount = 0;
        self.isActive = false;

        // Log for debugging (appears in Console.app)
        JSB.log('HelloWorld plugin: sceneWillConnect called');
      },

      /**
       * Window Lifecycle: Called when window becomes active (gains focus)
       *
       * Use this to:
       * - Resume operations
       * - Refresh UI
       * - Update state based on current context
       */
      sceneDidBecomeActive: function () {
        JSB.log('HelloWorld plugin: window became active');
      },

      /**
       * Window Lifecycle: Called when window loses focus
       *
       * Use this to:
       * - Pause operations
       * - Save state
       */
      sceneWillResignActive: function () {
        JSB.log('HelloWorld plugin: window will resign active');
      },

      /**
       * Notebook Lifecycle: Called when a notebook opens
       *
       * @param {string} topicid - The UUID of the opened notebook
       *
       * Use this to:
       * - Setup notebook-specific features
       * - Register event listeners (IMPORTANT: remove in notebookWillClose!)
       * - Initialize notebook data
       */
      notebookWillOpen: function (topicid) {
        JSB.log('HelloWorld plugin: notebook opened - ' + topicid);

        // Get current notebook object
        const notebook = Database.sharedInstance().getNotebookById(topicid);
        self.currentNotebook = notebook;

        // Example: Register event listener for new excerpts
        // CRITICAL: Must remove in notebookWillClose to prevent memory leaks
        NSNotificationCenter.defaultCenter().addObserverSelectorName(
          self,
          'onProcessNewExcerpt:',  // Method name (with colon!)
          'ProcessNewExcerpt'      // Event name
        );
      },

      /**
       * Notebook Lifecycle: Called when a notebook closes
       *
       * @param {string} topicid - The UUID of the closing notebook
       *
       * CRITICAL: Always remove event listeners here to prevent memory leaks
       */
      notebookWillClose: function (topicid) {
        JSB.log('HelloWorld plugin: notebook closing - ' + topicid);

        // CRITICAL: Remove event listeners
        NSNotificationCenter.defaultCenter().removeObserverName(
          self,
          'ProcessNewExcerpt'
        );

        // Clean up notebook-specific data
        self.currentNotebook = null;
      },

      /**
       * Event Handler: Called when a new excerpt is created
       *
       * @param {object} sender - Event sender with userInfo
       *
       * NOTE: Method name MUST match the selector in addObserverSelectorName
       * (but WITHOUT the colon in the method definition)
       */
      onProcessNewExcerpt: function (sender) {
        const noteid = sender.userInfo.noteid;
        JSB.log('HelloWorld plugin: new excerpt created - ' + noteid);

        // Get the note object
        const note = Database.sharedInstance().getNoteById(noteid);
        if (note) {
          // Example: Add a comment to the new excerpt
          note.appendTextComment('📝 Excerpt created with Hello World plugin!');
        }
      },

      /**
       * Plugin Button Configuration
       *
       * This method defines the plugin's toolbar button appearance and behavior
       *
       * @returns {object} Button configuration object
       */
      queryAddonCommandStatus: function () {
        return {
          image: 'logo.png',      // Button icon (44x44px recommended)
          object: self,            // Target object (the plugin instance)
          selector: 'onButtonClick:',  // Method to call on click (with colon!)
          checked: self.isActive   // Button checked state (boolean)
        };
      },

      /**
       * Button Click Handler
       *
       * @param {object} sender - The button object that was clicked
       *
       * NOTE: Method name matches selector in queryAddonCommandStatus
       * (but WITHOUT the colon in the method definition)
       */
      onButtonClick: function (sender) {
        // Toggle active state
        self.isActive = !self.isActive;

        // Increment click counter
        self.clickCount++;

        // Show different messages based on click count
        let message;
        if (self.clickCount === 1) {
          message = '👋 Hello World from MarginNote!';
        } else if (self.clickCount === 5) {
          message = '🎉 You clicked 5 times!';
        } else if (self.clickCount === 10) {
          message = '🚀 10 clicks! You\'re getting the hang of it!';
        } else {
          message = `Hello World! (Click #${self.clickCount})`;
        }

        // Show HUD notification
        // Parameters: message, view, duration (seconds)
        self.app.showHUD(message, self.window, 2);

        // Refresh button state to update checked status
        self.studyController.refreshAddonCommands();

        // Log to console
        JSB.log(`HelloWorld: Button clicked ${self.clickCount} times`);
      },

      /**
       * Window Lifecycle: Called when MarginNote window closes
       * This is the LAST lifecycle method called for each window
       *
       * Use this to:
       * - Clean up resources
       * - Save final state
       * - Release references
       */
      sceneDidDisconnect: function () {
        JSB.log('HelloWorld plugin: sceneDidDisconnect called');

        // Clean up references
        self.app = null;
        self.studyController = null;
        self.currentNotebook = null;

        // Log final statistics
        JSB.log(`HelloWorld plugin: Total clicks in this window: ${self.clickCount}`);
      }
    },
    {
      // ============================================================
      // STATIC METHODS (class-level, not per-window)
      // ============================================================

      /**
       * Plugin Installation/Activation Lifecycle
       * Called once when the plugin is first installed or activated
       *
       * Use this to:
       * - Perform one-time setup
       * - Initialize global configuration
       * - Show welcome message
       */
      addonDidConnect: function () {
        JSB.log('HelloWorld plugin: addonDidConnect (plugin activated)');
      },

      /**
       * Plugin Removal/Deactivation Lifecycle
       * Called once when the plugin is removed or deactivated
       *
       * Use this to:
       * - Clean up global state
       * - Remove configuration
       * - Show goodbye message
       */
      addonWillDisconnect: function () {
        JSB.log('HelloWorld plugin: addonWillDisconnect (plugin deactivated)');
      }
    }
  );

  // Return the plugin class
  return HelloWorldPlugin;
};
