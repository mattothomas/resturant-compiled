export default {
  turbopack: {
    // globals.css only, so *.module.css keeps CSS-module scoping
    rules: { "globals.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};
