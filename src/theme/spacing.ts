/**
 * Layout constants from the design's 390×844 phone frame (372×826 inside the
 * 9px bezel). Where a value doubles as a system safe area (status bar, home
 * indicator) it is treated as a minimum, so devices with larger insets still
 * keep their system UI clear.
 */
export const layout = {
  /** Height of the design's status bar row. */
  statusBar: 48,
  /** Tab bar height including the home-indicator zone. */
  tabBar: 84,
  /** Part of the tab bar that sits in the home-indicator zone. */
  tabBarSafeZone: 34,
  /** Bottom padding of the CTA well. */
  ctaWellPadding: 14,
  /** Bottom padding of bottom sheets. */
  sheetPadding: 30,
  /** Horizontal page gutter used by most screens. */
  gutter: 20,
  /** Gutter used by form-style screens. */
  gutterWide: 22,
} as const;
