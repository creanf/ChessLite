import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js, eslintPluginPrettier }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
]);
