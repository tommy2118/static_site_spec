import { Controller } from "@hotwired/stimulus";

/**
 * TOC Controller
 *
 * Highlights the current section in a table of contents based on scroll position.
 *
 * Usage:
 *   <nav data-controller="toc">
 *     <a href="#section-1" data-toc-target="link" data-id="section-1">Section 1</a>
 *     <a href="#section-2" data-toc-target="link" data-id="section-2">Section 2</a>
 *   </nav>
 */
export default class extends Controller {
  static targets = ["link"];
  static values = {
    offset: { type: Number, default: 100 },
  };

  connect() {
    this.headings = [];
    this.collectHeadings();

    if (this.headings.length > 0) {
      this.ticking = false;
      this.boundScrollHandler = this.onScroll.bind(this);
      window.addEventListener("scroll", this.boundScrollHandler, { passive: true });
      this.highlightCurrentSection();
    }
  }

  disconnect() {
    if (this.boundScrollHandler) {
      window.removeEventListener("scroll", this.boundScrollHandler);
    }
  }

  collectHeadings() {
    this.linkTargets.forEach((link) => {
      const id = link.dataset.id || link.getAttribute("href")?.replace("#", "");
      if (id) {
        const heading = document.getElementById(id);
        if (heading) {
          this.headings.push({ id, element: heading, link });
        }
      }
    });
  }

  onScroll() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.highlightCurrentSection();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  highlightCurrentSection() {
    const scrollPos = window.scrollY + this.offsetValue;
    let currentHeading = null;

    for (let i = this.headings.length - 1; i >= 0; i--) {
      const heading = this.headings[i];
      // Use getBoundingClientRect for reliable positioning
      const rect = heading.element.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      if (absoluteTop <= scrollPos) {
        currentHeading = heading;
        break;
      }
    }

    if (!currentHeading && this.headings.length > 0) {
      currentHeading = this.headings[0];
    }

    this.linkTargets.forEach((link) => {
      link.classList.remove("active");
    });

    if (currentHeading) {
      currentHeading.link.classList.add("active");

      if (this.element.scrollHeight > this.element.clientHeight) {
        currentHeading.link.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }
}
