import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import importPlugin from "eslint-plugin-import"

export default tseslint.config(
  { ignores: ["dist", "packages/react/vite.config.ts"] },
  {
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
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    settings: {
      "import/resolver": {
        alias: {
          map: [["", "./public"]],
          extensions: [".js", ".jsx", ".ts", ".tsx"]
        }
      }
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
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
      "no-console": "error",
      "func-style": ["error", "expression"],
      "curly": ["error", "all"],
      "eqeqeq": "error",
      "camelcase": "error",
      "import/no-default-export": "error",
      "import/default": "off",
      "no-case-declarations": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true }
      ]
    }
  }
)
