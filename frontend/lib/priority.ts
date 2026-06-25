export type PriorityLevel = {
  level: number;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

const PRIORITIES: Record<number, PriorityLevel> = {
  1: {
    level: 1,
    label: 'Haute',
    color: '#B0413E',
    bgColor: 'rgba(176,65,62,0.10)',
    borderColor: 'rgba(176,65,62,0.35)',
  },
  2: {
    level: 2,
    label: 'Moyenne',
    color: '#A0622A',
    bgColor: 'rgba(160,98,42,0.10)',
    borderColor: 'rgba(160,98,42,0.35)',
  },
  3: {
    level: 3,
    label: 'Normale',
    color: '#3A7D5A',
    bgColor: 'rgba(58,125,90,0.10)',
    borderColor: 'rgba(58,125,90,0.30)',
  },
};

export function getPriority(priority: number): PriorityLevel {
  return PRIORITIES[priority] ?? PRIORITIES[3];
}
