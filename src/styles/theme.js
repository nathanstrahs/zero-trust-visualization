import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';


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


const customConfig = defineConfig({
      // Defining CSS variables in the `globalCss` for `:root`
    globalCss: {
    ":root": {
      "--max-width": "1100px",
      "--border-radius": "12px",
      "--font-mono": "ui-monospace, Menlo, Monaco, 'Cascadia Mono', 'Segoe UI Mono', 'Roboto Mono', 'Oxygen Mono', 'Ubuntu Monospace', 'Source Code Pro', 'Fira Mono', 'Droid Sans Mono', 'Courier New', monospace",
    },
    // Applying the global box-sizing, padding, and margin reset
    "*": {
      boxSizing: "border-box",
      padding: 0,
      margin: 0,
    },
    // Setting max-width and overflow on html and body
    "html, body": {
      maxWidth: "100vw",
      overflowX: "hidden",
    },
  },
  theme: {
    tokens: {
      colors: {
        green: {
          50: '#ebfaf0',
          100: '#ccefdc',
          200: '#aee5c7',
          300: '#8ddab3',
          400: '#6dcf9e',
          500: '#4cc48a',
          600: '#3d9d6e',
          700: '#2e7653',
          800: '#1e4e37',
          900: '#0f271c',
        },
        red: {
          50: '#ffe5e9',
          100: '#ffb3bf',
          200: '#ff8094',
          300: '#ff4d6a',
          400: '#ff1a40',
          500: '#ff002b',
          600: '#cc0022',
          700: '#99001a',
          800: '#660011',
          900: '#330009',
        },
        orange: {
          50: '#fff2e5',
          100: '#ffd9b3',
          200: '#ffc080',
          300: '#ffa64d',
          400: '#ff8c1a',
          500: '#ff7300',
          600: '#cc5c00',
          700: '#994500',
          800: '#662f00',
          900: '#331700',
        },
        yellow: {
          50: '#fffde5',
          100: '#fffab3',
          200: '#fff680',
          300: '#fff24d',
          400: '#ffed1a',
          500: '#ffe900',
          600: '#ccba00',
          700: '#998b00',
          800: '#665d00',
          900: '#332e00',
        },
        blue: {
          50: '#e5f2ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0073e6',
          600: '#005cb3',
          700: '#004580',
          800: '#002e4d',
          900: '#00171a',
        },
        purple: {
          50: '#f3e5ff',
          100: '#d9b3ff',
          200: '#bf80ff',
          300: '#a64dff',
          400: '#8c1aff',
          500: '#7300e6',
          600: '#5c00b3',
          700: '#450080',
          800: '#2e004d',
          900: '#170026',
        },
        teal: {
          50: '#e5fafa',
          100: '#b3f0f0',
          200: '#80e5e5',
          300: '#4ddada',
          400: '#1acece',
          500: '#00bdbd',
          600: '#009797',
          700: '#007070',
          800: '#004a4a',
          900: '#002525',
        },
        cyan: {
          50: '#e5feff',
          100: '#b3faff',
          200: '#80f7ff',
          300: '#4df3ff',
          400: '#1af0ff',
          500: '#00dbe6',
          600: '#00afb3',
          700: '#008380',
          800: '#00564d',
          900: '#002b26',
        },
        
        // --- Neutral Color ---
        gray: {
          50: '#f7fafc',
          100: '#edf2f7',
          200: '#e2e8f0',
          300: '#cbd5e0',
          400: '#a0aec0',
          500: '#718096',
          600: '#4a5568',
          700: '#2d3748',
          800: '#1a202c',
          900: '#171923',
        },
        
      }
    }
  }
})

const themeConfig = defineConfig({
  cssVarsPrefix: 'chakra',
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  semanticTokens: {
    colors: {
      'bg-default': {
        default: 'gray.50',
        _dark: 'gray.900',
      },
      'fg-default': {
        default: 'gray.800',
        _dark: 'gray.100',
      },
      'card-bg': {
        default: 'white',
        _dark: 'gray.800',
      },
      'border-color': {
        default: 'gray.200',
        _dark: 'gray.700',
      },
    },
  },

  styles: {
    global: {
      body: {
        bg: 'bg-default',
        color: 'fg-default',
        transitionProperty: 'background-color',
        transitionDuration: 'normal',
      },
    },
  },

  tokens: {
    colors: {
      green: {
        50: '#ebfaf0',
        100: '#ccefdc',
        200: '#aee5c7',
        300: '#8ddab3',
        400: '#6dcf9e',
        500: '#4cc48a',
        600: '#3d9d6e',
        700: '#2e7653',
        800: '#1e4e37',
        900: '#0f271c',
        },
      red: {
          50: '#ffe5e9',
          100: '#ffb3bf',
          200: '#ff8094',
          300: '#ff4d6a',
          400: '#ff1a40',
          500: '#ff002b',
          600: '#cc0022',
          700: '#99001a',
          800: '#660011',
          900: '#330009',
        },
      orange: {
        50: '#fff2e5',
        100: '#ffd9b3',
        200: '#ffc080',
        300: '#ffa64d',
        400: '#ff8c1a',
        500: '#ff7300',
        600: '#cc5c00',
        700: '#994500',
        800: '#662f00',
        900: '#331700',
      },
      yellow: {
        50: '#fffde5',
        100: '#fffab3',
        200: '#fff680',
        300: '#fff24d',
        400: '#ffed1a',
        500: '#ffe900',
        600: '#ccba00',
        700: '#998b00',
        800: '#665d00',
        900: '#332e00',
      },
      blue: {
        50: '#e5f2ff',
        100: '#b3d9ff',
        200: '#80bfff',
        300: '#4da6ff',
        400: '#1a8cff',
        500: '#0073e6',
        600: '#005cb3',
        700: '#004580',
        800: '#002e4d',
        900: '#00171a',
      },
      purple: {
        50: '#f3e5ff',
        100: '#d9b3ff',
        200: '#bf80ff',
        300: '#a64dff',
        400: '#8c1aff',
        500: '#7300e6',
        600: '#5c00b3',
        700: '#450080',
        800: '#2e004d',
        900: '#170026',
      },
      teal: {
        50: '#e5fafa',
        100: '#b3f0f0',
        200: '#80e5e5',
        300: '#4ddada',
        400: '#1acece',
        500: '#00bdbd',
        600: '#009797',
        700: '#007070',
        800: '#004a4a',
        900: '#002525',
      },
      cyan: {
        50: '#e5feff',
        100: '#b3faff',
        200: '#80f7ff',
        300: '#4df3ff',
        400: '#1af0ff',
        500: '#00dbe6',
        600: '#00afb3',
        700: '#008380',
        800: '#00564d',
        900: '#002b26',
      },
      
      // --- Neutral Color ---
      gray: {
        50: '#f7fafc',
        100: '#edf2f7',
        200: '#e2e8f0',
        300: '#cbd5e0',
        400: '#a0aec0',
        500: '#718096',
        600: '#4a5568',
        700: '#2d3748',
        800: '#1a202c',
        900: '#171923',
      },
        
    },
    fonts: {
      heading: { value: `'Figtree', sans-serif` },
      body: { value: `'Figtree', sans-serif` },
    },
  },
})

export const theme = createSystem(defaultConfig, themeConfig)

export const sys = createSystem(defaultConfig, customConfig)