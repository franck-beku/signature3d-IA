/**
 * Fiche Client — Dashboard
 * Version: 9.1 — Thème clair (variables --dash-*)
 */

'use client'
import QRCodeLogo from '@/components/dashboard/QRCodeLogo'
import ProjectDocumentsManager from '@/components/dashboard/ProjectDocumentsManager'
import StickerPDF, { generateStickerQrDataUrl } from '@/components/dashboard/StickerPDF'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import ContractModal from '@/components/dashboard/ContractModal'
import ProjectLinkModal from '@/components/dashboard/ProjectLinkModal'
import ClientTimelineSection from '@/components/dashboard/ClientTimelineSection'
import ClientInfoCard from '@/components/dashboard/ClientInfoCard'
import ClientContactsSection from '@/components/dashboard/ClientContactsSection'
import ContactFormModal from '@/components/dashboard/ContactFormModal'
import ClientProjectsTable from '@/components/dashboard/ClientProjectsTable'
import EditProjectModal from '@/components/dashboard/EditProjectModal'
import Link from 'next/link'
import { ArrowLeft, Plus, AlertTriangle } from 'lucide-react'
import { clientsApi, projectsApi, contactsApi, timelineApi, type ClientDto, type ProjectDto, type ContactDto, type CreateContactDto, type TimelineItemDto } from '@/lib/api'
import { getPriority } from '@/lib/priority'
import { formatContractDate } from '@/lib/contractStatus'

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://signature3dia.com'

// Null désormais possible (Prospect sans date de livraison) — aucune urgence à signaler
// dans ce cas. Comparaison au niveau du jour calendaire (composantes UTC, la date vient
// d'un <input type="date"> stocké à minuit UTC) pour éviter un décalage d'un jour pour
// un navigateur à l'ouest de l'UTC.
function isDeliveryUrgent(date?: string | null) {
  if (!date) return false
  const d = new Date(date)
  const dateOnly = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  const today = new Date()
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffDays = Math.round((dateOnly.getTime() - todayOnly.getTime()) / 86_400_000)
  return diffDays >= 0 && diffDays < 14
}

interface EditProject {
  id: string; name: string; matterportId: string; status: string
  buttons: { id: string; label: string; labelEn?: string; url?: string; action: string; order: number }[]
  details: { label: string; value: string; displayOrder: number; isVisible: boolean }[]
  suggestions: { label: string; labelEn?: string; answer?: string; answerEn?: string; order: number }[]
}

function newButton() {
  return { id: Date.now().toString(), label: '', url: '', action: 'link', order: 0 }
}

export default function ClientDetailPage() {
  const params = useParams()
  const slug   = (Array.isArray(params?.slug) ? params.slug[0] : params?.slug) as string

  const [client, setClient]                   = useState<ClientDto | null>(null)
  const [projects, setProjects]               = useState<ProjectDto[]>([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm]     = useState<string | null>(null)
  const [editProject, setEditProject]         = useState<EditProject | null>(null)
  const [qrProject, setQrProject]             = useState<{ slug: string; name: string } | null>(null)
  const [generatingStickerId, setGeneratingStickerId] = useState<string | null>(null)
  const [linkProject, setLinkProject]         = useState<ProjectDto | null>(null)
  const [docProject, setDocProject]           = useState<{ id: string; name: string } | null>(null)
  const [showContractModal, setShowContractModal] = useState(false)
  const [saving, setSaving]                   = useState(false)
  const [contacts, setContacts]               = useState<ContactDto[]>([])
  const [contactSaving, setContactSaving]     = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [editContact, setEditContact]         = useState<ContactDto | null>(null)
  const [deleteContactConfirm, setDeleteContactConfirm] = useState<string | null>(null)
  const [timeline, setTimeline]               = useState<TimelineItemDto[]>([])
  const [contactForm, setContactForm]         = useState<CreateContactDto>({
    name: '', position: '', email: '', phone: '', phoneExtension: '', isPrimary: false,
  })

  useEffect(() => {
    clientsApi.getBySlug(slug)
      .then(async (c) => {
        setClient(c as ClientDto)
        const [projs, ctcts, tl] = await Promise.all([
          projectsApi.getByClient(c.id),
          contactsApi.getByClient(c.id),
          timelineApi.getByClient(c.id),
        ])
        setProjects(projs as ProjectDto[])
        setContacts(ctcts as ContactDto[])
        setTimeline(tl as TimelineItemDto[])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--dash-bg)' }}>
          <p style={{ color: 'var(--dash-text-muted)' }}>Chargement...</p>
        </main>
      </div>
    )
  }

  if (!client || error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--dash-bg)' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--dash-text-subtle)', marginBottom: '16px' }}>{error ?? 'Client introuvable'}</p>
            <Link href="/dashboard/clients" style={{ color: 'var(--dash-gold)', fontSize: '14px', textDecoration: 'none' }}>← Retour aux clients</Link>
          </div>
        </main>
      </div>
    )
  }

  const priority = getPriority(client.priority)
  const urgent   = isDeliveryUrgent(client.deliveryDate)

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectsApi.delete(projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      setDeleteConfirm(null)
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Une erreur est survenue.') }
  }

  const handleDownloadSticker = async (project: ProjectDto) => {
    setGeneratingStickerId(project.id)
    try {
      const qrDataUrl = await generateStickerQrDataUrl(project.embedUrl)
      const blob = await pdf(<StickerPDF qrDataUrl={qrDataUrl} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `autocollant-${project.slug}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setGeneratingStickerId(null)
    }
  }

  const handleSaveProject = async () => {
    if (!editProject) return

    // Source de vérité pour tout champ non éditable dans cette modale — jamais
    // editProject, qui ne porte que name/matterportId/buttons réellement modifiés.
    const original = projects.find((p) => p.id === editProject.id)
    if (!original) {
      setError('Projet introuvable — sauvegarde annulée.')
      return
    }

    setSaving(true)
    try {
      const updated = await projectsApi.update(editProject.id, {
        // Champs réellement éditables dans cette modale.
        name: editProject.name,
        matterportId: editProject.matterportId,
        buttons: editProject.buttons.map((b, i) => ({
          label: b.label,
          // Aucun contrôle de traduction dans cette modale : on préserve la valeur
          // existante par correspondance d'id, jamais d'invention pour un bouton
          // déjà connu, et rien pour un bouton nouvellement ajouté.
          labelEn: original.buttons.find((ob) => ob.id === b.id)?.labelEn,
          url: b.url,
          action: b.action,
          order: i,
        })),

        // Tout le reste : préservé tel quel depuis le projet original, jamais
        // depuis editProject, pour ne jamais écraser une donnée non affichée ici.
        ambassadorName: original.ambassadorName,
        experienceType: original.experienceType,
        experienceUrl: original.experienceUrl,
        welcomeMessage: original.welcomeMessage,
        welcomeMessageEn: original.welcomeMessageEn,
        notes: original.notes,
        contactPhone: original.contactPhone,
        contactUrl: original.contactUrl,
        status: original.status,
        shortDescription: original.shortDescription,
        shortDescriptionEn: original.shortDescriptionEn,
        coverImage: original.coverImage,
        isPublished: original.isPublished,
        isFeatured: original.isFeatured,
        displayOrder: original.displayOrder,
        sectorId: original.sectorId,
        offeringId: original.offeringId,
        luxediaEnabled: original.luxediaEnabled,
        luxediaAvatarUrl: original.luxediaAvatarUrl,
        luxediaClientLogoUrl: original.luxediaClientLogoUrl,
        luxediaPrimaryColor: original.luxediaPrimaryColor,
        luxediaWidgetBgColor: original.luxediaWidgetBgColor,
        luxediaBotMessageColor: original.luxediaBotMessageColor,
        luxediaUserMessageColor: original.luxediaUserMessageColor,
        luxediaWidgetPosition: original.luxediaWidgetPosition,
        luxediaButtonIcon: original.luxediaButtonIcon,
        luxediaLanguage: original.luxediaLanguage,
        luxediaTone: original.luxediaTone,
        luxediaPersonalityInstructions: original.luxediaPersonalityInstructions,
        suggestions: original.suggestions,
        details: original.details,
      })
      setProjects((prev) => prev.map((p) => p.id === editProject.id ? updated as ProjectDto : p))
      setEditProject(null)
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Une erreur est survenue.') }
    finally { setSaving(false) }
  }

  const resetContactForm = () =>
    setContactForm({ name: '', position: '', email: '', phone: '', phoneExtension: '', isPrimary: false })

  const handleCreateContact = async () => {
    if (!client || !contactForm.name.trim()) return
    setContactSaving(true)
    try {
      if (contactForm.isPrimary) {
        await Promise.all(contacts.filter((c) => c.isPrimary).map((c) => contactsApi.update(c.id, { isPrimary: false })))
        setContacts((prev) => prev.map((c) => ({ ...c, isPrimary: false })))
      }
      const created = await contactsApi.create(client.id, contactForm)
      setContacts((prev) => [...prev, created as ContactDto])
      setShowContactForm(false)
      resetContactForm()
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Une erreur est survenue.') }
    finally { setContactSaving(false) }
  }

  const handleUpdateContact = async () => {
    if (!editContact || !editContact.name.trim()) return
    setContactSaving(true)
    try {
      if (editContact.isPrimary) {
        await Promise.all(
          contacts.filter((c) => c.isPrimary && c.id !== editContact.id).map((c) => contactsApi.update(c.id, { isPrimary: false }))
        )
        setContacts((prev) => prev.map((c) => c.id === editContact.id ? c : { ...c, isPrimary: false }))
      }
      const updated = await contactsApi.update(editContact.id, {
        name: editContact.name, position: editContact.position, email: editContact.email,
        phone: editContact.phone, phoneExtension: editContact.phoneExtension, isPrimary: editContact.isPrimary,
      })
      setContacts((prev) => prev.map((c) => c.id === editContact.id ? updated as ContactDto : c))
      setEditContact(null)
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Une erreur est survenue.') }
    finally { setContactSaving(false) }
  }

  const handleDeleteContact = async (id: string) => {
    try {
      await contactsApi.delete(id)
      setContacts((prev) => prev.filter((c) => c.id !== id))
      setDeleteContactConfirm(null)
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Une erreur est survenue.') }
  }

  const updateButton = (id: string, key: string, value: string) => {
    if (!editProject) return
    setEditProject({ ...editProject, buttons: editProject.buttons.map((b) => b.id === id ? { ...b, [key]: value } : b) })
  }
  const addButton = () => {
    if (!editProject || editProject.buttons.length >= 4) return
    setEditProject({ ...editProject, buttons: [...editProject.buttons, newButton()] })
  }
  const removeButton = (id: string) => {
    if (!editProject || editProject.buttons.length <= 1) return
    setEditProject({ ...editProject, buttons: editProject.buttons.filter((b) => b.id !== id) })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/dashboard/clients" style={{ color: 'var(--dash-text-muted)', display: 'flex', alignItems: 'center', textDecoration: 'none' }} className="back-arrow">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--dash-text)', margin: 0 }}>{client.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <p className="dash-page-eyebrow" style={{ margin: 0 }}>{client.sectorName}</p>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: priority.bgColor, color: priority.color, fontWeight: 500 }}>{priority.label}</span>
              </div>
            </div>
          </div>
          <Link href={`/dashboard/clients/${slug}/nouveau-projet`} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', textDecoration: 'none' }} className="new-btn">
            <Plus size={13} /> Nouveau projet
          </Link>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '10px', color: 'var(--dash-error)', fontSize: '13px' }}>{error}</div>
          )}

          {urgent && (
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={15} style={{ color: 'var(--dash-error)', flexShrink: 0 }} />
              <p style={{ color: 'var(--dash-error)', fontSize: '13px', margin: 0 }}>Date de livraison proche — {formatContractDate(client.deliveryDate)}</p>
            </div>
          )}

          {/* Infos client */}
          <ClientInfoCard
            client={client}
            priority={priority}
            urgent={urgent}
            onOpenContractModal={() => setShowContractModal(true)}
          />

          {/* Parcours du client */}
          <ClientTimelineSection timeline={timeline} />

          {/* Contacts */}
          <ClientContactsSection
            contacts={contacts}
            deleteContactConfirm={deleteContactConfirm}
            onAddContact={() => { resetContactForm(); setShowContactForm(true) }}
            onEditContact={(contact) => setEditContact({ ...contact })}
            onDeleteConfirm={(id) => setDeleteContactConfirm(id)}
            onCancelDelete={() => setDeleteContactConfirm(null)}
            onDelete={handleDeleteContact}
          />

          {/* Projets */}
          <ClientProjectsTable
            projects={projects}
            slug={slug}
            deleteConfirm={deleteConfirm}
            onToggleDeleteConfirm={(id) => setDeleteConfirm((prev) => prev === id ? null : id)}
            onDeleteProject={handleDeleteProject}
            onLinkProject={(project) => setLinkProject(project)}
            onQrProject={(project) => setQrProject({ slug: project.slug, name: project.name })}
            onStickerProject={handleDownloadSticker}
            generatingStickerId={generatingStickerId}
            onDocProject={(project) => setDocProject({ id: project.id, name: project.name })}
            onEditProject={(project) => setEditProject({
              id: project.id, name: project.name, matterportId: project.matterportId ?? '', status: project.status,
              buttons: project.buttons.length > 0 ? project.buttons.map(b => ({ ...b })) : [newButton()],
              details: project.details.map(d => ({ label: d.label, value: d.value, displayOrder: d.displayOrder, isVisible: d.isVisible })),
              suggestions: project.suggestions.map(s => ({ label: s.label, labelEn: s.labelEn, answer: s.answer, answerEn: s.answerEn, order: s.order })),
            })}
          />
        </div>
      </main>

      {/* Modal Modifier Projet */}
      {editProject && (
        <EditProjectModal
          editProject={editProject}
          saving={saving}
          onChange={(patch) => setEditProject((prev) => prev ? { ...prev, ...patch } : prev)}
          onUpdateButton={updateButton}
          onAddButton={addButton}
          onRemoveButton={removeButton}
          onSave={handleSaveProject}
          onClose={() => setEditProject(null)}
        />
      )}

      {/* Modal Add / Edit Contact */}
      {(showContactForm || editContact) && (
        <ContactFormModal
          editContact={editContact}
          contactForm={contactForm}
          contactSaving={contactSaving}
          onChangeEditContact={(patch) => setEditContact((prev) => prev ? { ...prev, ...patch } : prev)}
          onChangeContactForm={(patch) => setContactForm((prev) => ({ ...prev, ...patch }))}
          onCreate={handleCreateContact}
          onUpdate={handleUpdateContact}
          onCloseCreate={() => setShowContactForm(false)}
          onCloseEdit={() => setEditContact(null)}
        />
      )}

      {docProject && <ProjectDocumentsManager projectId={docProject.id} projectName={docProject.name} variant="modal" onClose={() => setDocProject(null)} />}
      {showContractModal && client && (
        <ContractModal clientId={client.id} clientName={client.name} existingUrl={client.contractFileUrl}
          onClose={() => setShowContractModal(false)}
          onUploaded={(url) => { setClient({ ...client, contractFileUrl: url }); setShowContractModal(false) }}
        />
      )}
      {linkProject && <ProjectLinkModal project={linkProject} onClose={() => setLinkProject(null)} />}
      {qrProject && <QRCodeLogo url={`${BASE_URL}/embed/${qrProject.slug}`} projectName={qrProject.name} onClose={() => setQrProject(null)} />}

      <style>{`
        .back-arrow:hover  { color: var(--dash-gold) !important; }
        .new-btn:hover     { background-color: #b8943d !important; }
        .proj-row:hover    { background-color: var(--dash-hover) !important; }
        .action-btn:hover  { color: var(--dash-gold) !important; border-color: var(--dash-gold-ring) !important; }
        .edit-btn:hover    { background-color: var(--dash-gold-muted) !important; }
        .delete-btn:hover  { background-color: var(--dash-error-bg) !important; }
        .upload-btn:hover  { color: var(--dash-gold) !important; border-color: var(--dash-gold-ring) !important; }
        .close-btn:hover   { color: var(--dash-text) !important; }
        .save-btn:hover    { background-color: #b8943d !important; }
        .add-btn:hover     { background-color: var(--dash-gold-muted) !important; }
        .del-btn:hover     { background-color: var(--dash-error-bg) !important; }
        .copy-btn:hover    { color: var(--dash-gold) !important; border-color: var(--dash-gold-ring) !important; }
        .add-contact-btn:hover { background-color: var(--dash-gold-muted) !important; }
        .contact-link:hover    { color: var(--dash-gold) !important; }
        @media (max-width: 900px) { .info-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 540px) { .btn-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
