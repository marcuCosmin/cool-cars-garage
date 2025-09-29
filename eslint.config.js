import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import importPlugin from "eslint-plugin-import"

export default tseslint.config({
  extends: [
    ...tseslint.configs.recommended,
    js.configs.recommended,
    importPlugin.flatConfigs.recommended
  ],
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    ecmaVersion: 2020,
    globals: {
      ...globals.browser,
      ...globals.node
    }
  },
  rules: {
    "no-useless-assignment": "error",
    "require-await": "error",
    "prefer-destructuring": "error",
    "prefer-arrow-callback": "error",
    "no-useless-return": "error",
    "no-unneeded-ternary": "error",
    "no-nested-ternary": "error",
    "no-empty-function": "error",
    "no-unused-vars": "off",
    "no-else-return": "error",
    "func-style": ["error", "expression"],
    "curly": ["error", "all"],
    "eqeqeq": "error",
    "camelcase": "off",
    "import/no-default-export": "error",
    "import/default": "off",
    "no-case-declarations": "off"
  }
})
