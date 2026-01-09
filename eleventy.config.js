import fs from "fs";
import path from "path";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import cssnano from "cssnano";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

export default function (eleventyConfig) {
  // ---------------------------------------------------------------------------
  // IGNORES
  // ---------------------------------------------------------------------------
  eleventyConfig.ignores.add("CLAUDE.md");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("STATIC_SITE_SPEC.md");
  eleventyConfig.ignores.add("node_modules/**");
  eleventyConfig.ignores.add("dist/**");

  // ---------------------------------------------------------------------------
  // PASSTHROUGH COPIES
  // ---------------------------------------------------------------------------
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/images": "assets/images" });
  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });

  // ---------------------------------------------------------------------------
  // CSS PROCESSING (Tailwind 4 via PostCSS)
  // ---------------------------------------------------------------------------
  const cssProcessor = postcss([
    tailwindcss(),
    ...(process.env.NODE_ENV === "production" ? [cssnano({ preset: "default" })] : []),
  ]);

  eleventyConfig.on("eleventy.before", async () => {
    const inputPath = path.resolve("./src/assets/css/main.css");
    const outputPath = "./dist/assets/css/main.css";
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const cssContent = fs.readFileSync(inputPath, "utf8");
    const result = await cssProcessor.process(cssContent, {
      from: inputPath,
      to: outputPath,
    });

    fs.writeFileSync(outputPath, result.css);

    if (result.map) {
      fs.writeFileSync(`${outputPath}.map`, result.map.toString());
    }
  });

  // ---------------------------------------------------------------------------
  // WATCH TARGETS
  // ---------------------------------------------------------------------------
  eleventyConfig.addWatchTarget("./src/assets/css/");
  eleventyConfig.addWatchTarget("./src/assets/js/");

  // ---------------------------------------------------------------------------
  // MARKDOWN CONFIGURATION
  // ---------------------------------------------------------------------------
  const md = markdownIt({ html: true }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink(),
    slugify: (s) => s.toLowerCase().replace(/[^\w]+/g, "-"),
  });
  eleventyConfig.setLibrary("md", md);

  // ---------------------------------------------------------------------------
  // COLLECTIONS
  // ---------------------------------------------------------------------------

  // Documentation pages collection (sorted by section order)
  eleventyConfig.addCollection("docs", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/docs/**/*.njk")
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  // Controller demo pages
  eleventyConfig.addCollection("controllers", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/controllers/**/*.njk")
      .filter((item) => item.data.title)
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  // ---------------------------------------------------------------------------
  // FILTERS
  // ---------------------------------------------------------------------------

  // Extract table of contents from rendered content
  eleventyConfig.addFilter("toc", function (content) {
    const headings = [];
    const regex = /<h([2-3])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      let text = match[3];
      const anchorMatch = text.match(/<a[^>]*>([^<]*)<\/a>/);
      if (anchorMatch) {
        text = anchorMatch[1];
      } else {
        text = text.replace(/<[^>]*>/g, "");
      }
      text = text.trim();
      if (text) {
        headings.push({ level: match[1], id: match[2], text });
      }
    }
    return headings;
  });

  // Format dates for display
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // ISO date for datetime attributes
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return new Date(dateObj).toISOString();
  });

  // ---------------------------------------------------------------------------
  // SHORTCODES
  // ---------------------------------------------------------------------------

  // Current year (for copyright)
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // ---------------------------------------------------------------------------
  // CONFIGURATION
  // ---------------------------------------------------------------------------

  return {
    pathPrefix: "/",
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
