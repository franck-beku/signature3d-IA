/**
 * Fiche Client — Dashboard
 * Version: 9.1 — Thème clair (variables --dash-*)
 */

'use client'
import QRCodeLogo from '@/components/dashboard/QRCodeLogo'
import DocumentUpload from '@/components/dashboard/DocumentUpload'
import React from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import ContractModal from '@/components/dashboard/ContractModal'
import ProjectLinkModal from '@/components/dashboard/ProjectLinkModal'
import ClientTimelineSection from '@/components/dashboard/ClientTimelineSection'
import ClientInfoCard from '@/components/dashboard/ClientInfoCard'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, ExternalLink, QrCode, Plus, Trash2, AlertTriangle, Pencil, X, Check, FileText, UserRound, BarChart3 } from 'lucide-react'
import { clientsApi, projectsApi, contactsApi, timelineApi, type ClientDto, type ProjectDto, type ContactDto, type CreateContactDto, type TimelineItemDto } from '@/lib/api'
import { getPriority } from '@/lib/priority'

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://signature3dia.com'

const TYPES_ACTION = [
  { value: 'link',  label: 'Lien URL'   },
  { value: 'call',  label: 'Téléphone'  },
  { value: 'form',  label: 'Formulaire' },
]

const statusStyle = (s: string) => {
  if (s === 'Active' || s === 'actif')  return { bg: 'var(--dash-success-bg)',  color: 'var(--dash-success)' }
  if (s === 'Draft')                    return { bg: 'var(--dash-gold-muted)',   color: 'var(--dash-gold)' }
  return                                       { bg: 'var(--dash-border)',       color: 'var(--dash-text-subtle)' }
}

function isDeliveryUrgent(date: string) {
  const diff = new Date(date).getTime() - Date.now()
  return diff > 0 && diff < 14 * 24 * 60 * 60 * 1000
}

const thStyle = {
  textAlign: 'left' as const, padding: '12px 16px',
  borderBottom: '1px solid var(--dash-border)',
  whiteSpace: 'nowrap' as const,
}

const inputStyle = {
  width: '100%', backgroundColor: 'var(--dash-input)',
  border: '1px solid var(--dash-border-input)', borderRadius: '8px',
  padding: '10px 14px', fontSize: '13px', color: 'var(--dash-text)' as const,
  outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: 'inherit', transition: 'border-color 0.2s ease',
}

interface EditProject {
  id: string; name: string; matterportId: string; status: string
  buttons: { id: string; label: string; url: string; action: string; order: number }[]
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
    } catch (err: any) { setError(err.message) }
  }

  const handleSaveProject = async () => {
    if (!editProject) return
    setSaving(true)
    try {
      const updated = await projectsApi.update(editProject.id, {
        name: editProject.name, matterportId: editProject.matterportId,
        ambassadorName: 'Luxedia', status: editProject.status,
        buttons: editProject.buttons.map((b, i) => ({ label: b.label, url: b.url, action: b.action, order: i })),
        details: editProject.details,
        suggestions: editProject.suggestions,
      })
      setProjects((prev) => prev.map((p) => p.id === editProject.id ? updated as ProjectDto : p))
      setEditProject(null)
    } catch (err: any) { setError(err.message) }
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
    } catch (err: any) { setError(err.message) }
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
    } catch (err: any) { setError(err.message) }
    finally { setContactSaving(false) }
  }

  const handleDeleteContact = async (id: string) => {
    try {
      await contactsApi.delete(id)
      setContacts((prev) => prev.filter((c) => c.id !== id))
      setDeleteContactConfirm(null)
    } catch (err: any) { setError(err.message) }
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
              <p style={{ color: 'var(--dash-error)', fontSize: '13px', margin: 0 }}>Date de livraison proche — {new Date(client.deliveryDate).toLocaleDateString('fr-CA')}</p>
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '14px', margin: 0 }}>Contacts — {contacts.length}</h2>
              <button onClick={() => { resetContactForm(); setShowContactForm(true) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--dash-gold)', color: 'var(--dash-gold)', background: 'none', cursor: 'pointer' }} className="add-contact-btn">
                <Plus size={12} /> Ajouter un contact
              </button>
            </div>

            {contacts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 32px', border: '1px dashed var(--dash-border-input)', borderRadius: '14px' }}>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>Aucun contact pour ce client</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {contacts.map((contact) => (
                  <div key={contact.id} style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: 'var(--dash-gold-muted)', border: '1px solid var(--dash-gold-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <UserRound size={15} style={{ color: 'var(--dash-gold)' }} />
                        </div>
                        <div>
                          <p style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', margin: 0 }}>{contact.name}</p>
                          {contact.position && <p style={{ color: 'var(--dash-text-subtle)', fontSize: '11px', margin: '2px 0 0' }}>{contact.position}</p>}
                        </div>
                      </div>
                      {contact.isPrimary && (
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', backgroundColor: 'var(--dash-gold-muted)', color: 'var(--dash-gold)', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>Principal</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      {contact.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={11} style={{ color: 'var(--dash-text-muted)', flexShrink: 0 }} />
                          <a href={`mailto:${contact.email}`} style={{ color: 'var(--dash-text-subtle)', fontSize: '12px', textDecoration: 'none' }} className="contact-link">{contact.email}</a>
                        </div>
                      )}
                      {contact.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={11} style={{ color: 'var(--dash-text-muted)', flexShrink: 0 }} />
                          <span style={{ color: 'var(--dash-text-subtle)', fontSize: '12px' }}>{contact.phone}{contact.phoneExtension ? ` p. ${contact.phoneExtension}` : ''}</span>
                        </div>
                      )}
                    </div>

                    {deleteContactConfirm === contact.id ? (
                      <div style={{ padding: '10px 12px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '8px' }}>
                        <p style={{ color: 'var(--dash-error)', fontSize: '12px', margin: '0 0 10px' }}>Supprimer ce contact ?</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setDeleteContactConfirm(null)} style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }}>Annuler</button>
                          <button onClick={() => handleDeleteContact(contact.id)} style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '6px', backgroundColor: 'var(--dash-error)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Confirmer</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setEditContact({ ...contact })} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-gold-ring)', color: 'var(--dash-gold)', background: 'none', cursor: 'pointer' }} className="edit-btn">
                          <Pencil size={10} /> Modifier
                        </button>
                        <button onClick={() => setDeleteContactConfirm(contact.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', color: 'var(--dash-error)', background: 'none', cursor: 'pointer' }} className="delete-btn">
                          <Trash2 size={10} /> Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projets */}
          <div>
            <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '14px', marginBottom: '16px' }}>Projets — {projects.length}</h2>
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 32px', border: '1px dashed var(--dash-border-input)', borderRadius: '14px' }}>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', marginBottom: '16px' }}>Aucun projet pour ce client</p>
                <Link href={`/dashboard/clients/${slug}/nouveau-projet`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', textDecoration: 'none' }}>
                  <Plus size={13} /> Créer le premier projet
                </Link>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '14px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle} className="dash-label">Projet</th>
                      <th style={thStyle} className="dash-label">Statut</th>
                      <th style={thStyle} className="dash-label">Date</th>
                      <th style={thStyle} className="dash-label">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, i) => {
                      const st = statusStyle(project.status)
                      return (
                        <React.Fragment key={project.id}>
                          <tr style={{ borderBottom: deleteConfirm === project.id ? 'none' : (i < projects.length - 1 ? '1px solid var(--dash-border)' : 'none') }} className="proj-row">
                            <td style={{ padding: '14px 16px' }}>
                              <p style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', margin: 0 }}>{project.name}</p>
                              <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', margin: '2px 0 0' }}>{project.matterportId || 'IA seule'}</p>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: st.bg, color: st.color }}>{project.status}</span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{new Date(project.createdAt).toLocaleDateString('fr-CA')}</span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <Link href={`/dashboard/clients/${slug}/projets/${project.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', textDecoration: 'none' }} className="action-btn"><BarChart3 size={11} /> Voir</Link>
                                <button onClick={() => setLinkProject(project)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }} className="action-btn"><ExternalLink size={11} /> Lien</button>
                                <button onClick={() => setQrProject({ slug: project.slug, name: project.name })} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }} className="action-btn"><QrCode size={11} /> QR</button>
                                <button onClick={() => setDocProject({ id: project.id, name: project.name })} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }} className="action-btn"><FileText size={11} /> PDF</button>
                                <button onClick={() => setEditProject({
                                  id: project.id, name: project.name, matterportId: project.matterportId ?? '', status: project.status,
                                  buttons: project.buttons.length > 0 ? project.buttons.map(b => ({ ...b })) : [newButton()],
                                  details: project.details.map(d => ({ label: d.label, value: d.value, displayOrder: d.displayOrder, isVisible: d.isVisible })),
                                  suggestions: project.suggestions.map(s => ({ label: s.label, labelEn: s.labelEn, answer: s.answer, answerEn: s.answerEn, order: s.order })),
                                })} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-gold-ring)', color: 'var(--dash-gold)', background: 'none', cursor: 'pointer' }} className="edit-btn"><Pencil size={11} /> Modifier</button>
                                <button onClick={() => setDeleteConfirm(deleteConfirm === project.id ? null : project.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', color: 'var(--dash-error)', background: 'none', cursor: 'pointer' }} className="delete-btn"><Trash2 size={11} /> Supprimer</button>
                              </div>
                            </td>
                          </tr>
                          {deleteConfirm === project.id && (
                            <tr>
                              <td colSpan={4} style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', borderBottom: i < projects.length - 1 ? '1px solid var(--dash-border)' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <AlertTriangle size={14} style={{ color: 'var(--dash-error)', flexShrink: 0 }} />
                                  <p style={{ color: 'var(--dash-error)', fontSize: '13px', margin: 0 }}>Supprimer <strong>{project.name}</strong> ? Cette action est irréversible.</p>
                                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                    <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }}>Annuler</button>
                                    <button onClick={() => handleDeleteProject(project.id)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', backgroundColor: 'var(--dash-error)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Confirmer</button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Modifier Projet */}
      {editProject && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '16px', margin: 0 }}>Modifier le projet</h2>
              <button onClick={() => setEditProject(null)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-subtle)' }} className="close-btn"><X size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Nom du projet</label>
                <input type="text" value={editProject.name} onChange={(e) => setEditProject({ ...editProject, name: e.target.value })} style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>ID Matterport <span style={{ color: 'var(--dash-text-muted)', textTransform: 'none', letterSpacing: 0 }}>(vide = IA seule)</span></label>
                <input type="text" value={editProject.matterportId} onChange={(e) => setEditProject({ ...editProject, matterportId: e.target.value })} placeholder="Ex: WJzvgHF44zq" style={inputStyle} className="dash-input" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label className="dash-label">Boutons ({editProject.buttons.length}/4)</label>
                  {editProject.buttons.length < 4 && (
                    <button onClick={addButton} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-gold)', color: 'var(--dash-gold)', background: 'none', cursor: 'pointer' }} className="add-btn">
                      <Plus size={11} /> Ajouter
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {editProject.buttons.map((btn, i) => (
                    <div key={btn.id} style={{ backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="dash-micro-label">Bouton {i + 1}</span>
                        {editProject.buttons.length > 1 && (
                          <button onClick={() => removeButton(btn.id)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--dash-error)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }} className="del-btn">
                            <Trash2 size={10} /> Supprimer
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.4fr', gap: '8px' }} className="btn-row">
                        <input type="text" value={btn.label} onChange={(e) => updateButton(btn.id, 'label', e.target.value)} placeholder="Nom du bouton" style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }} className="dash-input" />
                        <select value={btn.action} onChange={(e) => updateButton(btn.id, 'action', e.target.value)} style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }} className="dash-input">
                          {TYPES_ACTION.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <input type="text" value={btn.url} onChange={(e) => updateButton(btn.id, 'url', e.target.value)} placeholder={btn.action === 'call' ? 'tel:+1...' : 'https://'} style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }} className="dash-input" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSaveProject} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }} className="save-btn">
                  <Check size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button onClick={() => setEditProject(null)} style={{ fontSize: '13px', color: 'var(--dash-text-muted)', background: 'none', border: '1px solid var(--dash-border-input)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Contact */}
      {(showContactForm || editContact) && (() => {
        const isEdit  = !!editContact
        const form    = isEdit ? editContact! : contactForm
        const setForm = isEdit
          ? (patch: Partial<ContactDto>) => setEditContact((prev) => prev ? { ...prev, ...patch } : prev)
          : (patch: Partial<CreateContactDto>) => setContactForm((prev) => ({ ...prev, ...patch }))
        return (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '16px', margin: 0 }}>{isEdit ? 'Modifier le contact' : 'Nouveau contact'}</h2>
                <button onClick={() => isEdit ? setEditContact(null) : setShowContactForm(false)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-subtle)' }} className="close-btn"><X size={14} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { key: 'name', label: 'Nom *', type: 'text', placeholder: 'Prénom Nom' },
                  { key: 'position', label: 'Fonction', type: 'text', placeholder: 'Ex: Directeur marketing' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>{label}</label>
                    <input type={type} value={(form as any)[key] ?? ''} onChange={(e) => setForm({ [key]: e.target.value } as any)} placeholder={placeholder} style={inputStyle} className="dash-input" />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Email</label>
                    <input type="email" value={form.email ?? ''} onChange={(e) => setForm({ email: e.target.value })} placeholder="prenom@client.ca" style={inputStyle} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Téléphone</label>
                    <input type="tel" value={form.phone ?? ''} onChange={(e) => setForm({ phone: e.target.value })} placeholder="+1 (418) 000-0000" style={inputStyle} className="dash-input" />
                  </div>
                </div>
                <div>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Poste / Extension</label>
                  <input type="text" value={form.phoneExtension ?? ''} onChange={(e) => setForm({ phoneExtension: e.target.value })} placeholder="Ex: 224" style={inputStyle} className="dash-input" />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 14px', borderRadius: '8px', border: `1px solid ${form.isPrimary ? 'var(--dash-gold-ring)' : 'var(--dash-border)'}`, backgroundColor: form.isPrimary ? 'var(--dash-gold-muted)' : 'transparent', transition: 'all 0.2s ease' }}>
                  <input type="checkbox" checked={!!form.isPrimary} onChange={(e) => setForm({ isPrimary: e.target.checked })} style={{ width: '15px', height: '15px', accentColor: 'var(--dash-gold)', cursor: 'pointer' }} />
                  <span style={{ color: form.isPrimary ? 'var(--dash-gold)' : 'var(--dash-text-subtle)', fontSize: '13px' }}>Contact principal</span>
                </label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    onClick={isEdit ? handleUpdateContact : handleCreateContact}
                    disabled={contactSaving || !form.name.trim()}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: form.name.trim() ? 'var(--dash-gold)' : 'var(--dash-border)', color: form.name.trim() ? '#000' : 'var(--dash-text-muted)', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: form.name.trim() && !contactSaving ? 'pointer' : 'not-allowed', opacity: contactSaving ? 0.7 : 1 }}
                    className="save-btn"
                  >
                    <Check size={14} /> {contactSaving ? 'Sauvegarde...' : (isEdit ? 'Sauvegarder' : 'Créer')}
                  </button>
                  <button onClick={() => isEdit ? setEditContact(null) : setShowContactForm(false)} style={{ fontSize: '13px', color: 'var(--dash-text-muted)', background: 'none', border: '1px solid var(--dash-border-input)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {docProject && <DocumentUpload projectId={docProject.id} projectName={docProject.name} onClose={() => setDocProject(null)} />}
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
