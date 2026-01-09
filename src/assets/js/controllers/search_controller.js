import { Controller } from "@hotwired/stimulus";

/**
 * Search Controller
 *
 * Handles search modal toggle with Pagefind integration.
 *
 * Usage:
 *   <div data-controller="search">
 *     <button data-action="click->search#open">Search</button>
 *     <div data-search-target="modal" class="hidden">
 *       <div data-search-target="container"></div>
 *     </div>
 *   </div>
 */
export default class extends Controller {
  static targets = ["modal", "container"];

  connect() {
    this.isOpen = false;
    this.boundHandleKeydown = this.handleKeydown.bind(this);
    document.addEventListener("keydown", this.boundHandleKeydown);
    this.initializePagefind();
  }

  disconnect() {
    document.removeEventListener("keydown", this.boundHandleKeydown);
  }

  initializePagefind() {
    if (typeof PagefindUI !== "undefined" && this.hasContainerTarget) {
      new PagefindUI({
        element: this.containerTarget,
        showSubResults: true,
        showImages: false,
      });
    }
  }

  open() {
    if (!this.hasModalTarget) return;

    this.isOpen = true;
    this.modalTarget.classList.remove("hidden");

    setTimeout(() => {
      const input = this.modalTarget.querySelector("input");
      if (input) input.focus();
    }, 100);
  }

  close() {
    if (!this.hasModalTarget) return;

    this.isOpen = false;
    this.modalTarget.classList.add("hidden");
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  handleKeydown(event) {
    // Cmd+K or Ctrl+K to open search
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      this.open();
      return;
    }

    // Escape to close
    if (event.key === "Escape" && this.isOpen) {
      this.close();
    }
  }

  closeOnBackdrop(event) {
    if (event.target === this.modalTarget) {
      this.close();
    }
  }
}
