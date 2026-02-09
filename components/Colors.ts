// colors.ts - Theme Colors Configuration
//components/colors.ts

export const Colors = {
  // Primary Colors
  primary: {
    main: '#8B7FA8',
    light: '#9D8FB8',
    lighter: '#A89DC4',
    dark: '#7B68A6',
    pale: '#F5F0FA',
    ultraLight: '#E8DEFF',
  },
  
  // Accent Colors
  accent: {
    gold: '#D4A574',
    goldMedium: '#C99761',
    goldDark: '#B88C5E',
  },
  
  // Background Colors
  background: {
    white: '#FFFFFF',
    light: '#FAFBFC',
    lighter: '#F8F9FA',
    subtle: '#F5F0FA',
  },
  
  // Border Colors
  border: {
    light: '#E8EAED',
    medium: '#E8DEFF',
  },
  
  // Text Colors
  text: {
    primary: '#1A1A1A',
    secondary: '#2C2C2C',
    tertiary: '#666',
    quaternary: '#777',
    light: '#999',
    placeholder: '#AAA',
  },
  
  // Status Colors
  status: {
    error: '#E74C3C',
    errorLight: '#FFE8E5',
    success: '#27AE60',
    warning: '#F39C12',
    info: '#3498DB',
  },
  
  // Gradient Colors
  gradients: {
    primary: ['#8B7FA8', '#7B68A6'],
    background: ['#7B68A6', '#8B7FA8', '#9D8FB8'],
    accent: ['#D4A574', '#C99761', '#B88C5E'],
  },
  
  // Opacity Colors (for animations)
  opacity: {
    white08: 'rgba(255,255,255,0.08)',
    white12: 'rgba(255,255,255,0.12)',
    white15: 'rgba(255,255,255,0.15)',
    white40: 'rgba(255,255,255,0.4)',
    white50: 'rgba(255,255,255,0.5)',
    white95: 'rgba(255,255,255,0.95)',
    white97: 'rgba(255,255,255,0.97)',
    black: 'rgba(0,0,0,0.2)',
  },
};

export default Colors;