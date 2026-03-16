/**
 * Professional Blue & Black Color Palette
 * Optimized for readability and professional appearance
 */

export const colorPalette = {
  // Primary Blue Shades
  primary: {
    darkest: '#0f172a', // Almost black with blue tint
    dark: '#1c45ca',    // Deep blue
    base: '#2563eb',    // Professional blue
    medium: '#3b82f6',  // Medium blue
    light: '#60a5fa',   // Light blue
    lighter: '#93c5fd', // Very light blue
  },

  // Neutral Blacks
  neutral: {
    darkest: '#000000',
    dark: '#111827',
    darker: '#1f2937',
    base: '#374151',
    light: '#6b7280',
    lighter: '#9ca3af',
    lightest: '#f3f4f6',
  },

  // Status Colors (Income/Expense)
  status: {
    success: '#10b981',    // Income - Green
    successLight: '#d1fae5',
    error: '#ef4444',      // Expense - Red
    errorLight: '#fee2e2',
    warning: '#f59e0b',    // Pending - Amber
    warningLight: '#fef3c7',
    info: '#06b6d4',       // Info - Cyan
    infoLight: '#cffafe',
  },

  // Background Colors
  bg: {
    light: '#ffffff',
    lightGray: '#f9fafb',
    mediumGray: '#f3f4f6',
    darkGray: '#e5e7eb',
  },

  // Text Colors
  text: {
    primary: '#0f172a',      // Dark blue - Primary text
    secondary: '#374151',    // Dark gray - Secondary text
    muted: '#6b7280',        // Light gray - Muted text
    light: '#9ca3af',        // Lighter gray - Very light text
  },

  // Dark Mode
  dark: {
    bg: '#0f172a',           // Almost black
    surface: '#1e293b',      // Dark blue-gray surface
    surfaceLight: '#334155', // Light dark surface
    border: '#475569',       // Dark border
    text: '#f1f5f9',         // Light text
    textSecondary: '#cbd5e1',// Less bright text
    muted: '#94a3b8',        // Muted in dark mode
  },
};

/**
 * Get theme colors based on isDark flag
 */
export const getThemeColors = (isDark) => {
  if (isDark) {
    return {
      cardBg: colorPalette.dark.surface,
      cardBgHover: colorPalette.dark.surfaceLight,
      textColor: colorPalette.dark.text,
      textSecondary: colorPalette.dark.textSecondary,
      mutedColor: colorPalette.dark.muted,
      borderColor: colorPalette.dark.border,
      inputBg: colorPalette.dark.bg,
      inputBorder: colorPalette.dark.border,
    };
  } else {
    return {
      cardBg: colorPalette.bg.light,
      cardBgHover: colorPalette.bg.mediumGray,
      textColor: colorPalette.text.primary,
      textSecondary: colorPalette.text.secondary,
      mutedColor: colorPalette.text.muted,
      borderColor: colorPalette.bg.darkGray,
      inputBg: colorPalette.bg.mediumGray,
      inputBorder: colorPalette.bg.darkGray,
    };
  }
};

/**
 * Predefined button styles
 */
export const buttonStyles = {
  primary: (isDark) => ({
    background: `linear-gradient(135deg, ${colorPalette.primary.base}, ${colorPalette.primary.dark})`,
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  }),

  secondary: (isDark) => ({
    background: isDark ? colorPalette.dark.surfaceLight : colorPalette.bg.mediumGray,
    color: isDark ? colorPalette.dark.text : colorPalette.text.primary,
    border: `2px solid ${isDark ? colorPalette.dark.border : colorPalette.bg.darkGray}`,
    borderRadius: '10px',
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  }),

  danger: () => ({
    background: colorPalette.status.error,
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  }),

  success: () => ({
    background: colorPalette.status.success,
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  }),
};

export default colorPalette;
