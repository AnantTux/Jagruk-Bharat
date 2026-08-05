import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
    ...nextVitals,
    {
        rules: {
            "no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
        },
    },
    {
        files: ["components/ui/**/*.js"],
        rules: {
            "react-hooks/refs": "off",
            "react-hooks/purity": "off",
            "react-hooks/set-state-in-effect": "off",
        },
    },
    {
        files: ["components/LeafletMap.js", "hooks/use-hazards.js"],
        rules: {
            "react-hooks/refs": "off",
            "react-hooks/set-state-in-effect": "off",
        },
    },
    globalIgnores([
        ".next/**",
        "out/**",
        "build/**",
        "node_modules/**",
        "coverage/**",
        "playwright-report/**",
        "test-results/**",
        "public/uploads/**",
    ]),
]);
