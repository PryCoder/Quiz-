import { extendTheme } from '@chakra-ui/react';

const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fefce8',
    500: '#eab308',
    600: '#ca8a04',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'xl',
      _focus: {
        boxShadow: 'none',
      },
    },
    variants: {
      primary: {
        bg: 'primary.500',
        color: 'white',
        _hover: {
          bg: 'primary.600',
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
        transition: 'all 0.2s',
      },
      outline: {
        border: '2px solid',
        borderColor: 'primary.500',
        color: 'primary.500',
        _hover: {
          bg: 'primary.50',
          transform: 'translateY(-2px)',
        },
      },
      ghost: {
        _hover: {
          bg: 'neutral.100',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      borderRadius: '2xl',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.2s',
      _hover: {
        transform: 'translateY(-4px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  Input: {
    variants: {
      filled: {
        field: {
          bg: 'neutral.50',
          _hover: {
            bg: 'neutral.100',
          },
          _focus: {
            bg: 'white',
            borderColor: 'primary.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
          },
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
};

const styles = {
  global: {
    body: {
      bg: 'neutral.50',
      color: 'neutral.800',
    },
    '::selection': {
      bg: 'primary.200',
    },
  },
};

export const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  shadows: {
    outline: '0 0 0 3px rgba(14, 165, 233, 0.6)',
  },
});