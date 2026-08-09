export const theme = {
  colors: {
    bg: '#05070C', // Near-black with faint blue-violet undertone
    surfaceFill: 'rgba(255, 255, 255, 0.04)',
    surfaceBorder: 'rgba(255, 255, 255, 0.08)',
    surfaceHover: 'rgba(255, 255, 255, 0.07)',
    cardBg: '#0b0f19',
    glassBg: 'rgba(15, 23, 42, 0.75)',
    
    // Telemetry Accents
    signal: '#5B8CFF',    // Primary actions, trajectory
    healthy: '#34D399',   // Success, healthy environments
    warning: '#FBBF24',   // Degraded, warning
    error: '#FB7185',     // Failed, down
    
    // Typography
    textPrimary: '#F5F6FA',
    textSecondary: 'rgba(245, 246, 250, 0.6)',
    textMuted: 'rgba(245, 246, 250, 0.35)',
    
    border: 'rgba(255, 255, 255, 0.1)',
  },
  fonts: {
    display: 'SpaceGrotesk-Bold',
    body: 'Inter-Regular',
    mono: 'JetBrainsMono-Regular',
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
  },
};
