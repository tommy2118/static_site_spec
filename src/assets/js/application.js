// =============================================================================
// STIMULUS APPLICATION
// Static Site Spec Documentation
// =============================================================================

import { Application } from "@hotwired/stimulus";

// Start Stimulus application
const application = Application.start();

// Configure Stimulus development experience
application.debug = false;
window.Stimulus = application;

// =============================================================================
// CONTROLLER REGISTRATION
// =============================================================================

import MobileNavController from "./controllers/mobile_nav_controller.js";
application.register("mobile-nav", MobileNavController);

import SearchController from "./controllers/search_controller.js";
application.register("search", SearchController);

import ReadingProgressController from "./controllers/reading_progress_controller.js";
application.register("reading-progress", ReadingProgressController);

import TocController from "./controllers/toc_controller.js";
application.register("toc", TocController);

import ClipboardController from "./controllers/clipboard_controller.js";
application.register("clipboard", ClipboardController);

import ToggleController from "./controllers/toggle_controller.js";
application.register("toggle", ToggleController);

import AnimateController from "./controllers/animate_controller.js";
application.register("animate", AnimateController);

export { application };
