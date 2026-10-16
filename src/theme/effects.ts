/**
 * Gradients and shadows from the design, kept as CSS strings. React Native
 * 0.86 parses these natively (`experimental_backgroundImage`, `boxShadow`),
 * so the values are carried across exactly as authored.
 */
export const gradients = {
  gold: 'linear-gradient(135deg,#f7dd8e,#c8962f)',
  goldBar: 'linear-gradient(90deg,#f7dd8e,#c8962f)',
  navyCard: 'linear-gradient(135deg,#1e2a5a,#141d40)',
  navyAvatar: 'linear-gradient(135deg,#2c3c6b,#1a2450)',
  navyButton: 'linear-gradient(180deg,#243258,#1a2450)',
  navySelfie: 'linear-gradient(160deg,#1e2a5a,#0e1430)',
  navyPlayer: 'linear-gradient(135deg,#1e2a5a,#0e1430)',
  blueBar: 'linear-gradient(90deg,#1e2a5a,#3b6fd4)',
  blueRule: 'linear-gradient(90deg,#4c8bf5,#1d4fd7)',
  navyRule: 'linear-gradient(90deg,#2c3c6b,#1a2450)',
  green: 'linear-gradient(135deg,#22c55e,#15803d)',
  blue: 'linear-gradient(135deg,#4c8bf5,#1d4fd7)',
  danger: 'linear-gradient(180deg,#e04141,#c0392b)',
  splash:
    'radial-gradient(120% 80% at 50% 18%,#1e2a5a 0%,#141d40 45%,#0b1029 100%)',
} as const;

export const shadows = {
  hairline: '0 1px 2px rgba(16,24,40,0.04)',
  xs: '0 1px 2px rgba(16,24,40,0.05)',
  card: '0 1px 2px rgba(16,24,40,0.05), 0 2px 8px rgba(16,24,40,0.04)',
  cardRaised: '0 1px 2px rgba(16,24,40,0.05), 0 3px 10px rgba(16,24,40,0.05)',
  input: '0 1px 2px rgba(16,24,40,0.06), 0 3px 10px rgba(16,24,40,0.06)',
  chrome: '0 1px 2px rgba(16,24,40,0.06)',
  hero: '0 1px 3px rgba(16,24,40,0.12), 0 10px 22px rgba(16,24,40,0.14)',
  heroStrong: '0 1px 3px rgba(16,24,40,0.12), 0 10px 22px rgba(16,24,40,0.16)',
  media: '0 1px 3px rgba(16,24,40,0.09), 0 8px 18px rgba(16,24,40,0.10)',
  navyButton: '0 1px 2px rgba(16,24,40,0.10), 0 6px 16px rgba(16,24,40,0.14)',
  goldButton: '0 1px 2px rgba(16,24,40,0.14), 0 8px 20px rgba(200,150,47,0.30)',
  selected: '0 1px 2px rgba(16,24,40,0.06), 0 8px 20px rgba(30,42,90,0.14)',
  sheet: '0 -1px 0 rgba(16,24,40,0.08), 0 -10px 30px rgba(16,24,40,0.16)',
  toast: '0 1px 3px rgba(16,24,40,0.14), 0 8px 18px rgba(16,24,40,0.16)',
  banner: '0 1px 3px rgba(16,24,40,0.16), 0 10px 24px rgba(16,24,40,0.20)',
  keypadKey: '0 1px 2px rgba(30,42,90,0.22)',
} as const;
