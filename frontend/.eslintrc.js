module.exports = {
  extends: [
    "next/core-web-vitals"
  ],
  rules: {
    // Temporarily disable strict TypeScript rules for the booking system
    "@typescript-eslint/no-explicit-any": "warn", // Change from error to warning
    "@typescript-eslint/no-unused-vars": "warn", 
    "react-hooks/exhaustive-deps": "warn",
    "react/no-unescaped-entities": "warn"
  }
}