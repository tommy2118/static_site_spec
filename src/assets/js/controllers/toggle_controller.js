import { Controller } from "@hotwired/stimulus";

/**
 * Toggle Controller
 *
 * Generic show/hide functionality for accordions, dropdowns, FAQs.
 *
 * Usage:
 *   <div data-controller="toggle">
 *     <button data-action="click->toggle#toggle">Toggle</button>
 *     <div data-toggle-target="content" class="hidden">Content</div>
 *   </div>
 */
export default class extends Controller {
  static targets = ["content"];
  static values = {
    hiddenClass: { type: String, default: "hidden" },
  };

  toggle() {
    this.contentTarget.classList.toggle(this.hiddenClassValue);
  }

  show() {
    this.contentTarget.classList.remove(this.hiddenClassValue);
  }

  hide() {
    this.contentTarget.classList.add(this.hiddenClassValue);
  }
}
