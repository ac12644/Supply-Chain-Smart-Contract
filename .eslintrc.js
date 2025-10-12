module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "prefer-const": "error",
    "no-var": "error",
  },
  overrides: [
    {
      files: ["test/**/*.js"],
      env: {
        mocha: true,
      },
      rules: {
        "no-unused-expressions": "off",
      },
    },
    {
      files: ["scripts/**/*.js"],
      rules: {
        "no-console": "off",
      },
    },
  ],
};
