module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // do not error for long body and footer lines (like those seen in dependabot commits)
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};
