export interface NavLink {
  label: string
  href: string
}

export const navLinks: NavLink[] = [
  {
    label: 'Services',
    href: '/#services',
  },
  {
    label: 'Réalisations',
    href: '/realisations',
  },
  {
    label: 'Comment ça marche',
    href: '/#comment',
  },
]