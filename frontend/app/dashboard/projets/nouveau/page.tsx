'use client'

import Sidebar from '@/components/dashboard/Sidebar'
import ProjectForm from '@/components/dashboard/ProjectForm'

export default function NouveauProjetPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <ProjectForm />
    </div>
  )
}