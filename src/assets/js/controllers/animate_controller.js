import { Controller } from "@hotwired/stimulus";

/**
 * Animate Controller
 *
 * Scroll-triggered animations using IntersectionObserver.
 *
 * Usage:
 *   <div data-controller="animate"
 *        data-animate-class-value="animate-fade-in"
 *        data-animate-delay-value="100">
 *     Content to animate
 *   </div>
 */
export default class extends Controller {
  static values = {
    class: { type: String, default: "animate-in" },
    delay: { type: Number, default: 0 },
    threshold: { type: Number, default: 0.1 },
  };

  connect() {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersect(entries),
      { threshold: this.thresholdValue }
    );
    this.observer.observe(this.element);
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  handleIntersect(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          this.element.classList.add(this.classValue);
        }, this.delayValue);
        this.observer.unobserve(this.element);
      }
    });
  }
}
