import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "android/**",
      "ios/**",
      ".expo/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "web-build/**",
    ],
  },

  js.configs.recommended,
  {
    // TS parser + turn off core rules that TypeScript already checks (no-undef, etc.)
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.eslintRecommended],
    languageOptions: { parser: tseslint.parser },
  },

  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react,
      "react-hooks": hooks,
      prettier,
    },

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node, ...globals.jest, __DEV__: "readonly" },
    },

    settings: {
      react: { version: "detect" },
    },

    rules: {
      /* ✅ React + Hooks */
      ...react.configs.recommended.rules,
      ...hooks.configs.recommended.rules,

      "react/react-in-jsx-scope": "off", // ✅ for React 17+
      "react/prop-types": "off", // ✅ using TS

      /* ✅ Best warnings */
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],

      /* ✅ Prettier = auto formatting via ESLint */
      "prettier/prettier": "error",
    },
  },

  {
    // CommonJS config files (metro, babel, jest, etc.)
    files: ["**/*.cjs", "babel.config.js", "metro.config.js", "jest.setup.js", "jest.config.js"],
    languageOptions: { sourceType: "commonjs" },
  },
);
