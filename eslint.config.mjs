import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Aturan React Compiler yang terlalu ketat terhadap pola yang sah
      // (mis. `setMounted(true)` di useEffect sebagai penjaga hydration) — dimatikan.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/preserve-manual-memoization": "off",
      // Aturan React Compiler lain + kualitas kode: diturunkan jadi peringatan (kuning).
      // Tetap terlihat sebagai catatan, tapi tidak memblokir (bukan "error" merah).
      "react-hooks/refs": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@next/next/no-img-element": "warn",
      "import/no-anonymous-default-export": "warn",
    },
  },
];

export default eslintConfig;
