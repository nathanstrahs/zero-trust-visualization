// app/theme.js
import { extendTheme } from '@chakra-ui/theme';
import { createSystem, defaultConfig } from '@chakra-ui/react';

// const customtheme = extendTheme({
//   colors: {
//     brand: {
//       100: "#f7fafc",
//       900: "#1a202c",
//     },
//   },
// });

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Figtree', sans-serif` },
        body: { value: `'Figtree', sans-serif` },
      },
    },
  },
})
