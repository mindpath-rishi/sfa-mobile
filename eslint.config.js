import js from "@eslint/js";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";

export default [
  js.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    plugins: {
      react,
      "react-hooks": hooks,
      prettier,
    },

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
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
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],

      /* ✅ Prettier = auto formatting via ESLint */
      "prettier/prettier": "error",
    },
  },
];
