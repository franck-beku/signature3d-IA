'use client'

import { useParams } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import ProjectForm from '@/components/dashboard/ProjectForm'

export default function EditProjetPage() {
  const params = useParams()
  const id = params.id as string
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <ProjectForm projectId={id} />
    </div>
  )
}