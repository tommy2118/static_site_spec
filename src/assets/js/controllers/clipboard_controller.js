import { Controller } from "@hotwired/stimulus";

/**
 * Clipboard Controller
 *
 * Copies text to clipboard with visual feedback.
 *
 * Usage:
 *   <div data-controller="clipboard" data-clipboard-text-value="Text to copy">
 *     <button data-action="click->clipboard#copy" data-clipboard-target="button">
 *       <span data-clipboard-target="label">Copy</span>
 *     </button>
 *   </div>
 */
export default class extends Controller {
  static targets = ["button", "label"];
  static values = {
    text: String,
    successText: { type: String, default: "Copied!" },
    duration: { type: Number, default: 2000 },
  };

  async copy() {
    const text = this.textValue || this.element.textContent;

    try {
      await navigator.clipboard.writeText(text);
      this.showSuccess();
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  showSuccess() {
    if (this.hasLabelTarget) {
      const originalText = this.labelTarget.textContent;
      this.labelTarget.textContent = this.successTextValue;

      setTimeout(() => {
        this.labelTarget.textContent = originalText;
      }, this.durationValue);
    }
  }
}
