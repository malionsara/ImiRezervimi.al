module.exports = {
  extends: [
    "next/core-web-vitals"
  ],
  rules: {
    // Disable strict rules globally for now
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "warn", 
    "react-hooks/exhaustive-deps": "warn",
    "react/no-unescaped-entities": "warn"
  }
}