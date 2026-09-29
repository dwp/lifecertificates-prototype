/** @type {import("prettier").Config} */
module.exports = {
  plugins: ["prettier-plugin-nunjucks"],

  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  trailingComma: "none",
  bracketSpacing: true,
  bracketSameLine: false,
  singleAttributePerLine: false,
  endOfLine: "lf",

  overrides: [
    {
      files: [
        "app/views/**/*.html",
        "app/views/**/*.njk",
        "app/components/**/*.html",
        "app/components/**/*.njk"
      ],
      options: {
        parser: "nunjucks",
        singleQuote: false,
        htmlWhitespaceSensitivity: "ignore"
      }
    }
  ]
}
