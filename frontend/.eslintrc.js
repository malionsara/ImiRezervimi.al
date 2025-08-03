module.exports = {
  extends: [
    "next/core-web-vitals"
  ],
  rules: {
    // Temporarily disable strict rules for booking system files
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn", 
    "react-hooks/exhaustive-deps": "warn",
    "react/no-unescaped-entities": "warn"
  },
  overrides: [
    {
      // More lenient rules for the new booking system components
      files: [
        "pages/api/appointments/**/*",
        "pages/api/salon/**/*", 
        "pages/salon/**/*",
        "components/booking/**/*",
        "components/salon/**/*",
        "lib/appointments.ts",
        "lib/salon-dashboard.ts"
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "react-hooks/exhaustive-deps": "off"
      }
    }
  ]
}