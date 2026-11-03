/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Bodies are written as unwrapped paragraphs.
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};
