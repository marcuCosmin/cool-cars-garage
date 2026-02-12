import tseslint from "typescript-eslint"

import defaultConfig from "../../eslint.config.js"

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [...defaultConfig],
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json"
        }
      }
    }
  }
)
