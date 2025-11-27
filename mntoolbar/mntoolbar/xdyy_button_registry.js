/**
 * Xia Dayu Yang custom button registration form
 * Used to decouple button configuration and avoid modifying utils.js
 *
 * Usage overview (customX):
 *
 * Judgment basis:
 * - Registered: Explicitly registered via global.registerButton("customX", {...}) in registerAllButtons().
 * - is used by:
 * 1) The default splicing list of toolbarConfig.action/dynamicAction is added to webviewController.js; or
 * 2) There are direct references elsewhere in the warehouse (such as direct use in toolbarConfig.getAction / actions configuration).
 * - Unused: registered but does not appear in the above usage scenarios; or only exists in the default actions of the old version of utils.js, but is overridden by the current extension logic (no longer effective).
 *
 * Registered and used (directly/indirectly added to the toolbar, or referenced):
 * - custom1 excerpt
 * - custom2 learning
 * - custom3 add template
 * - custom4 documentation
 * - custom5 card
 * - custom6 text
 * - custom7 hide the plug-in bar
 * - custom8 proof
 * - custom9 thoughts
 * - custom10 manage comments
 * - custom11 search
 * - custom13 finishing
 * - custom15 card making
 * - custom16 [Hand tool pop-up replacement] text
 * - custom17 Pin
 * - custom20 htmlMarkdown comments
 *
 * Appears only in the old version of default actions (utils.js), is not maintained in this registry, and will be replaced by the current override logic (deemed unused):
 * - custom12, custom14, custom18, custom19
 *
 *Maintenance recommendations:
 * - To enable custom12/14/18/19, register it explicitly in registerAllButtons() in this file;
 * - If you want to take a customX offline, remove it from registerAllButtons() and annotate the update status here.
 */

//Debug: check loading status
if (typeof MNUtil !== "undefined" && MNUtil.log) {
  MNUtil.log("🔧 Start loading xdyy_button_registry.js");
  MNUtil.log(`🔍 toolbarConfig exists: ${typeof toolbarConfig !== 'undefined'}`);
}

//Create global registry
if (typeof global === 'undefined') {
  var global = {};
}

//Initialize button registry
global.customButtons = {};

/**
 * Register custom button
 * @param {string} key - button key name
 * @param {Object} config - button configuration object
 */
global.registerButton = function(key, config) {
  global.customButtons[key] = config;
  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log(`📦 Registered button: ${key}`);
  }
};

/**
 * Get button configuration
 * @param {string} key - button key name
 * @returns {Object|null} button configuration object
 */
global.getButton = function(key) {
  return global.customButtons[key] || null;
};

/**
 * Register all custom buttons
 * Strictly follow the contents of the original getActions()
 */
function registerAllButtons() {
  //Card related buttons
  global.registerButton("custom15", {
    name: "Card Making",
    image: "makeCards",
    templateName: "menu_makeCards" // Delayed acquisition of template
  });

  global.registerButton("custom3", {
    name: "Add template",
    image: "addTemplate",
    templateName: "menu_addTemplate"
  });

  global.registerButton("custom11", {
    name: "Search",
    image: "search",
    templateName: "menu_search"
  });

  global.registerButton("custom13", {
    name: "Organization",
    image: "classification",
    templateName: "menu_classification"
  });

  global.registerButton("custom8", {
    name: "proof",
    image: "proof",
    templateName: "menu_proof"
  });

  global.registerButton("custom10", {
    name: "Manage Comments",
    image: "comment",
    templateName: "menu_comment"
  });

  // Comment related buttons
  global.registerButton("custom20", {
    name: "htmlMarkdown comment",
    image: "htmlmdcomment",
    templateName: "menu_htmlmdcomment"
  });

    // Card operations
  global.registerButton("custom5", {
    name: "card",
    image: "card",
    templateName: "menu_card"
  });


  global.registerButton("custom9", {
    name: "thinking",
    image: "think",
    templateName: "menu_think"
  });


  global.registerButton("custom1", {
    name: "Excerpt",
    image: "excerpt",
    templateName: "menu_excerpt"
  });

  global.registerButton("custom17", {
    name: "Pin",
    image: "pin",
    templateName: "menu_pin"
  });

  // learning and templates
  global.registerButton("custom2", {
    name: "Learning",
    image: "study",
    templateName: "menu_study"
  });

  global.registerButton("custom4", {
    name: "Documentation",
    image: "reference",
    templateName: "menu_reference"
  });

  // Code learning button
  global.registerButton("custom_code", {
    name: "Code Learning",
    image: "code",
    templateName: "menu_codeLearning"
  });

  global.registerButton("custom7", {
    name: "Hide plugin bar",
    image: "hideAddonBar",
    templateName: "hideAddonBar"
  });

  global.registerButton("custom6", {
    name: "text",
    image: "text",
    templateName: "menu_text"
  });

  //Other functions
  global.registerButton("snipaste", {
    name: "Snipaste",
    image: "snipaste",
    description: "Snipaste"
  });


  global.registerButton("edit", {
    name: "edit",
    image: "edit",
    description: JSON.stringify({showOnNoteEdit:false})
  });

  global.registerButton("copyAsMarkdownLink", {
    name: "Copy md link",
    image: "copyAsMarkdownLink",
    description: "Copy md link"
  });


  // Specifically used to replace the original button
  global.registerButton("custom16", {
    name: "[Hand Tool Popup Replacement] Text",
    image: "text_white",
    templateName: "menu_handtool_text"
  });

  global.registerButton("custom14", {
    name: "Disassembly Proof",
    image: "proof",
    templateName: "menu_proofparse"
  });

  // "custom15":{name:"[Card Pop-up Replacement]SOP",image:"sop_white",description: this.template("menu_sop")},

  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log(`🚀 ${Object.keys(global.customButtons).length} custom buttons have been registered`);
  }
}

// Function that extends toolbarConfig
function extendToolbarConfig() {
  if (typeof toolbarConfig === 'undefined') {
    if (typeof MNUtil !== "undefined" && MNUtil.log) {
      MNUtil.log("⚠️ toolbarConfig has not been defined yet, waiting for initialization");
    }
    return false;
  }

  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log("🚀 Start extending toolbarConfig.getActions method");
  }

  //Save the original getActions method (if it hasn't been saved yet)
  if (!toolbarConfig._originalGetActions) {
    toolbarConfig._originalGetActions = toolbarConfig.getActions;
  }

  // Override getActions method
  toolbarConfig.getActions = function() {
    // Get the default button
    const defaultActions = toolbarConfig._originalGetActions ? toolbarConfig._originalGetActions.call(this) : {};

    //If the custom button is empty, return to the default button
    if (Object.keys(global.customButtons).length === 0) {
      return defaultActions;
    }

    //Create a new object that completely replaces the custom button
    const allActions = {};

    //Add all custom buttons
    for (const key in global.customButtons) {
      const button = Object.assign({}, global.customButtons[key]);

      // If there is templateName, dynamically obtain the description
      if (button.templateName && !button.description && toolbarConfig.template) {
        button.description = toolbarConfig.template(button.templateName);
      }

      // Delete templateName attribute
      delete button.templateName;

      allActions[key] = button;
    }

    //Add non-custom default button
    for (const key in defaultActions) {
      if (!key.startsWith('custom') && !(key in allActions)) {
        allActions[key] = defaultActions[key];
      }
    }

    return allActions;
  };

  // Extend the getAction method to ensure that custom configuration is returned
  if (!toolbarConfig._originalGetAction) {
    toolbarConfig._originalGetAction = toolbarConfig.getAction;
  }

  toolbarConfig.getAction = function(actionKey) {
    //Check the custom button first
    if (global.customButtons[actionKey]) {
      const button = Object.assign({}, global.customButtons[actionKey]);

      // If there is templateName, dynamically obtain the description
      if (button.templateName && !button.description && toolbarConfig.template) {
        button.description = toolbarConfig.template(button.templateName);
      }

      delete button.templateName;
      return button;
    }

    // If it is not a custom button, call the original method
    if (toolbarConfig._originalGetAction) {
      const result = toolbarConfig._originalGetAction.call(this, actionKey);
      if (result) {
        return result;
      }
    }

    // If neither is found, try to get it from getActions()
    const allActions = this.getActions();
    if (allActions && allActions[actionKey]) {
      return allActions[actionKey];
    }

    //Finally return a default empty button configuration to avoid undefined errors
    if (typeof MNUtil !== "undefined" && MNUtil.log) {
      MNUtil.log(`⚠️ Cannot find button configuration: ${actionKey}, return to default configuration`);
    }
    return {
      name: actionKey,
      image: "default",
      description: "{}"
    };
  };

  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log("✅ toolbarConfig.getActions and getAction methods have been extended to support custom buttons");
  }

  return true;
}

// Function to force refresh button configuration
function forceRefreshButtons() {
  if (typeof toolbarConfig === 'undefined') {
    return false;
  }

  // Get new button configuration
  const newActions = toolbarConfig.getActions();
  toolbarConfig.actions = newActions;

  //Force update the configuration of each custom button
  for (const key in global.customButtons) {
    if (toolbarConfig.actions[key]) {
      const button = Object.assign({}, global.customButtons[key]);

      // If there is templateName, dynamically obtain the description
      if (button.templateName && !button.description && toolbarConfig.template) {
        button.description = toolbarConfig.template(button.templateName);
      }

      delete button.templateName;
      toolbarConfig.actions[key] = button;
    }
  }

  //Create an array of key names for custom buttons
  const customKeys = Object.keys(global.customButtons);

  //Save the user's current button order (non-custom buttons)
  const nonCustomButtons = [];
  if (toolbarConfig.action && Array.isArray(toolbarConfig.action)) {
    for (let key of toolbarConfig.action) {
      if (!key.startsWith('custom') && !customKeys.includes(key)) {
        nonCustomButtons.push(key);
      }
    }
  }

  // Rebuild the action array: add custom buttons first, then add other buttons
  if (toolbarConfig.action && Array.isArray(toolbarConfig.action)) {
    toolbarConfig.action = customKeys.concat(nonCustomButtons);
  }

  // Also process the dynamicAction array
  const nonCustomDynamicButtons = [];
  if (toolbarConfig.dynamicAction && Array.isArray(toolbarConfig.dynamicAction)) {
    for (let key of toolbarConfig.dynamicAction) {
      if (!key.startsWith('custom') && !customKeys.includes(key)) {
        nonCustomDynamicButtons.push(key);
      }
    }
    toolbarConfig.dynamicAction = customKeys.concat(nonCustomDynamicButtons);
  }

  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log(`🔄 Forced refresh button configuration completed, total ${Object.keys(newActions).length} buttons`);
    MNUtil.log(`📍 action array: ${toolbarConfig.action.slice(0, 10).join(', ')}...`);
    MNUtil.log(`📍 dynamicAction array: ${toolbarConfig.dynamicAction.slice(0, 10).join(', ')}...`);
    MNUtil.log(`📍 Custom button: ${customKeys.join(', ')}`);
  }

  //Send refresh notification
  if (typeof MNUtil !== "undefined" && MNUtil.postNotification) {
    MNUtil.postNotification("refreshToolbarButton", {});
  }

  //Save configuration
  if (toolbarConfig.save) {
    toolbarConfig.save();
  }

  return true;
}

//Try expansion now (while file is loading)
extendToolbarConfig();

// Register all buttons immediately (no delay required since we use templateName)
try {
  registerAllButtons();
} catch (error) {
  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log(`❌ Error while registering button: ${error.message}`);
  }
}

//Export global function
global.forceRefreshButtons = forceRefreshButtons;
global.extendToolbarConfig = extendToolbarConfig;

//Export registered functions for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    registerButton: global.registerButton,
    getButton: global.getButton,
    registerAllButtons: registerAllButtons,
    forceRefreshButtons: forceRefreshButtons,
    extendToolbarConfig: extendToolbarConfig
  };
}

//Add an observer to force refresh after toolbarConfig is initialized
if (typeof MNUtil !== 'undefined' && MNUtil.addObserver) {
  // Create a temporary object to receive notifications
  const observer = {
    onToolbarConfigInit: function() {
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log("📢 Received toolbarConfig initialization notification");
      }

      // Delay a little to ensure initialization is completed
      setTimeout(function() {
        if (extendToolbarConfig()) {
          forceRefreshButtons();
        }
      }, 50);
    }
  };

  // Listen for initialization notification
  MNUtil.addObserver(observer, 'onToolbarConfigInit:', 'ToolbarConfigInit');
}

// Delay execution in case the notification mechanism fails
if (typeof setTimeout !== 'undefined') {
  //Try to force refresh after 500ms
  setTimeout(function() {
    if (extendToolbarConfig()) {
      forceRefreshButtons();
    }
  }, 500);

  //Try again after 2 seconds to ensure it takes effect
  setTimeout(function() {
    if (extendToolbarConfig()) {
      forceRefreshButtons();
    }
  }, 2000);
}
