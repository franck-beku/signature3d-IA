/**
 * Sidebar — Dashboard Signature Immersion
 * Version: 4.0 — Modules contenu V2 (Projets, Secteurs, Offres, FAQ)
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Box, Inbox, Layers, Sparkles, HelpCircle, Quote, BarChart2, Calendar, Bell, Settings, LogOut } from 'lucide-react'
import { clientsApi } from '@/lib/api'
import { getContractState } from '@/lib/contractStatus'

const navItems = [
  { label: 'Vue globale',   href: '/dashboard',               icon: LayoutDashboard },
  // CRM
  { label: 'Clients',       href: '/dashboard/clients',       icon: Users },
  { label: 'Projets',       href: '/dashboard/projets',       icon: Box },
  { label: 'Leads',         href: '/dashboard/leads',         icon: Inbox },
  // Contenu
  { label: 'Secteurs',      href: '/dashboard/secteurs',      icon: Layers },
  { label: 'Offres',        href: '/dashboard/offres',        icon: Sparkles },
  { label: 'FAQ',           href: '/dashboard/faq',           icon: HelpCircle },
  { label: 'Témoignages',   href: '/dashboard/temoignages',   icon: Quote },
  // Analyse
  { label: 'Analytics',     href: '/dashboard/analytics',     icon: BarChart2 },
  // Organisation
  { label: 'Agenda',        href: '/dashboard/agenda',        icon: Calendar },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  // Système
  { label: 'Paramètres',    href: '/dashboard/parametres',    icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const [contractsToWatch, setContractsToWatch] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    /* Dérivé de getContractState — aucune nouvelle logique d'échéance, aucun endpoint dédié. */
    clientsApi.getAll(1, 100)
      .then((result) => {
        const count = result.items.filter((c) => {
          const info = getContractState(c.contractEndDate)
          return info !== null && info.state !== 'active'
        }).length
        setContractsToWatch(count)
      })
      .catch(console.error)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/dashboard/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : '?'

  return (
    <aside style={{ width: '220px', flexShrink: 0, backgroundColor: '#080808', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Logo */}
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/dashboard" style={{ display: 'block' }}>
          <Image src="/Newlogo.png" alt="Signature Immersion" width={120} height={40} style={{ height: '32px', width: 'auto' }} />
        </Link>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '8px' }}>
          {user?.role === 'admin' ? 'Admin' : 'Développeur'}
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px',
                fontSize: '13px', textDecoration: 'none', transition: 'all 0.2s ease',
                backgroundColor: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: isActive ? '#d4af37' : 'rgba(255,255,255,0.4)',
                borderLeft: isActive ? '2px solid #d4af37' : '2px solid transparent',
              }}
              className="sidebar-link"
            >
              <item.icon size={15} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.href === '/dashboard/clients' && contractsToWatch > 0 && (
                <span
                  title="Contrats à surveiller"
                  style={{
                    fontSize: '10px', fontWeight: 600, lineHeight: 1,
                    padding: '3px 6px', borderRadius: '999px',
                    backgroundColor: 'rgba(176,65,62,0.15)', color: '#d97a77',
                    flexShrink: 0,
                  }}
                >
                  {contractsToWatch}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '4px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#d4af37', fontSize: '11px', fontWeight: 500 }}>{initials}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name ?? '...'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email ?? '...'}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }} className="logout-btn">
          <LogOut size={13} />
          Déconnexion
        </button>
      </div>

      <style>{`
        .sidebar-link:hover { background-color: rgba(255,255,255,0.04) !important; color: rgba(255,255,255,0.8) !important; }
        .logout-btn:hover { color: rgba(255,255,255,0.6) !important; background-color: rgba(255,255,255,0.04) !important; }
      `}</style>
    </aside>
  )
}