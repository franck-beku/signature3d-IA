'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user && pathname !== '/dashboard/login') {
      router.replace('/dashboard/login')
    } else {
      setChecked(true)
    }
  }, [pathname, router])

  if (!checked && pathname !== '/dashboard/login') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(212,175,55,0.2)', borderTopColor: '#d4af37', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d' }}>
      {children}
    </div>
  )
}
