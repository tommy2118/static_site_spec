import { Controller } from "@hotwired/stimulus";

/**
 * Reading Progress Controller
 *
 * Shows a progress bar at the top of the page indicating scroll position.
 *
 * Usage:
 *   <div data-controller="reading-progress" class="reading-progress"></div>
 */
export default class extends Controller {
  connect() {
    this.boundUpdateProgress = this.updateProgress.bind(this);
    window.addEventListener("scroll", this.boundUpdateProgress, { passive: true });
    this.updateProgress();
  }

  disconnect() {
    window.removeEventListener("scroll", this.boundUpdateProgress);
  }

  updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.element.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }
}
