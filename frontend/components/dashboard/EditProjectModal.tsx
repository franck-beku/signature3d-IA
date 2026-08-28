'use client'

import { X, Plus, Trash2, Check } from 'lucide-react'

const TYPES_ACTION = [
  { value: 'link',  label: 'Lien URL'   },
  { value: 'call',  label: 'Téléphone'  },
  { value: 'form',  label: 'Formulaire' },
]

const inputStyle = {
  width: '100%', backgroundColor: 'var(--dash-input)',
  border: '1px solid var(--dash-border-input)', borderRadius: '8px',
  padding: '10px 14px', fontSize: '13px', color: 'var(--dash-text)' as const,
  outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: 'inherit', transition: 'border-color 0.2s ease',
}

interface EditProject {
  id: string; name: string; matterportId: string; status: string
  buttons: { id: string; label: string; labelEn?: string; url?: string; action: string; order: number }[]
  details: { label: string; value: string; displayOrder: number; isVisible: boolean }[]
  suggestions: { label: string; labelEn?: string; answer?: string; answerEn?: string; order: number }[]
}

/* ── Modal Modifier Projet ── */
export default function EditProjectModal({
  editProject, saving, onChange, onUpdateButton, onAddButton, onRemoveButton, onSave, onClose,
}: {
  editProject: EditProject
  saving: boolean
  onChange: (patch: Partial<EditProject>) => void
  onUpdateButton: (id: string, key: string, value: string) => void
  onAddButton: () => void
  onRemoveButton: (id: string) => void
  onSave: () => void
  onClose: () => void
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '16px', margin: 0 }}>Modifier le projet</h2>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-subtle)' }} className="close-btn"><X size={14} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Nom du projet</label>
            <input type="text" value={editProject.name} onChange={(e) => onChange({ name: e.target.value })} style={inputStyle} className="dash-input" />
          </div>
          <div>
            <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>ID Matterport <span style={{ color: 'var(--dash-text-muted)', textTransform: 'none', letterSpacing: 0 }}>(vide = IA seule)</span></label>
            <input type="text" value={editProject.matterportId} onChange={(e) => onChange({ matterportId: e.target.value })} placeholder="Ex: WJzvgHF44zq" style={inputStyle} className="dash-input" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label className="dash-label">Boutons ({editProject.buttons.length}/4)</label>
              {editProject.buttons.length < 4 && (
                <button onClick={onAddButton} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-gold)', color: 'var(--dash-gold)', background: 'none', cursor: 'pointer' }} className="add-btn">
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
                      <button onClick={() => onRemoveButton(btn.id)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--dash-error)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }} className="del-btn">
                        <Trash2 size={10} /> Supprimer
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.4fr', gap: '8px' }} className="btn-row">
                    <input type="text" value={btn.label} onChange={(e) => onUpdateButton(btn.id, 'label', e.target.value)} placeholder="Nom du bouton" style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }} className="dash-input" />
                    <select value={btn.action} onChange={(e) => onUpdateButton(btn.id, 'action', e.target.value)} style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }} className="dash-input">
                      {TYPES_ACTION.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <input type="text" value={btn.url} onChange={(e) => onUpdateButton(btn.id, 'url', e.target.value)} placeholder={btn.action === 'call' ? 'tel:+1...' : 'https://'} style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }} className="dash-input" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }} className="save-btn">
              <Check size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button onClick={onClose} style={{ fontSize: '13px', color: 'var(--dash-text-muted)', background: 'none', border: '1px solid var(--dash-border-input)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      </div>
    </div>
  )
}
