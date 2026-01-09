import { Controller } from "@hotwired/stimulus";

/**
 * Mobile Nav Controller
 *
 * Handles mobile navigation drawer toggle with backdrop.
 *
 * Usage:
 *   <div data-controller="mobile-nav">
 *     <button data-action="click->mobile-nav#open" data-mobile-nav-target="toggle">Menu</button>
 *     <div data-mobile-nav-target="backdrop" class="mobile-nav-backdrop"></div>
 *     <div data-mobile-nav-target="drawer" class="mobile-nav-drawer">...</div>
 *   </div>
 */
export default class extends Controller {
  static targets = ["drawer", "backdrop", "toggle"];

  connect() {
    this.isOpen = false;
    this.boundHandleKeydown = this.handleKeydown.bind(this);
    document.addEventListener("keydown", this.boundHandleKeydown);
  }

  disconnect() {
    document.removeEventListener("keydown", this.boundHandleKeydown);
    this.restoreBodyScroll();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.sync();
  }

  close() {
    this.isOpen = false;
    this.sync();
  }

  sync() {
    if (this.hasDrawerTarget) {
      this.drawerTarget.classList.toggle("open", this.isOpen);
    }
    if (this.hasBackdropTarget) {
      this.backdropTarget.classList.toggle("open", this.isOpen);
    }
    if (this.hasToggleTarget) {
      this.toggleTarget.setAttribute("aria-expanded", this.isOpen);
    }

    if (this.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      this.restoreBodyScroll();
    }
  }

  restoreBodyScroll() {
    document.body.style.overflow = "";
  }

  handleKeydown(event) {
    if (event.key === "Escape" && this.isOpen) {
      this.close();
    }
  }

  closeOnBackdrop(event) {
    if (event.target === this.backdropTarget) {
      this.close();
    }
  }
}
