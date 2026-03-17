export const MODULE_COLORS = {
  crm:         { primary: '#00D4FF', glow: 'rgba(0,212,255,0.3)',   label: 'CRM' },
  marketing:   { primary: '#FF6B35', glow: 'rgba(255,107,53,0.3)',  label: 'Marketing' },
  automations: { primary: '#A855F7', glow: 'rgba(168,85,247,0.3)',  label: 'Automations' },
  analytics:   { primary: '#10B981', glow: 'rgba(16,185,129,0.3)',  label: 'Analytics' },
  aiCore:      { primary: '#FACC15', glow: 'rgba(250,204,21,0.4)',  label: 'AI Core' },
} as const;

export type ModuleKey = keyof typeof MODULE_COLORS;

export function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}
