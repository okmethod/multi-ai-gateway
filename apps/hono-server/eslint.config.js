import tseslint from 'typescript-eslint'

export default tseslint.config(...tseslint.configs.recommended, {
  languageOptions: {
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
  },
  ignores: ['node_modules', '.wrangler'],
})
