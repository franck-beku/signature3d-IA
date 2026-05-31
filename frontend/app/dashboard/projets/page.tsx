'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Plus, Search, ExternalLink, QrCode, MoreVertical } from 'lucide-react'
import Link from 'next/link'

const projets = [
  {
    id: '1',
    name: 'Mercedes Québec',
    client: 'Mercedes Québec',
    sector: 'Automobile',
    status: 'actif',
    leads: 23,
    visitors: 342,
    experiences: 3,
    slug: 'mercedes-quebec',
    createdAt: '2025-05-01',
  },
  {
    id: '2',
    name: 'Restaurant Bella',
    client: 'Restaurant Bella',
    sector: 'Restaurant',
    status: 'actif',
    leads: 14,
    visitors: 218,
    experiences: 1,
    slug: 'restaurant-bella',
    createdAt: '2025-05-15',
  },
  {
    id: '3',
    name: 'Immo Prestige',
    client: 'Immo Prestige',
    sector: 'Immobilier',
    status: 'draft',
    leads: 0,
    visitors: 0,
    experiences: 0,
    slug: 'immo-prestige',
    createdAt: '2025-05-20',
  },
]

export default function ProjetsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Tous')

  const filtered = projets.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Tous' || p.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 overflow-auto bg-[#0d0d0d]">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div>
            <h1 className="font-display text-2xl font-light text-white">
              Projets
            </h1>
            <p className="text-white/30 text-xs tracking-widest uppercase mt-1">
              {projets.length} projets au total
            </p>
          </div>
          <button className="flex items-center gap-2 bg-gold text-void text-xs font-medium px-4 py-2.5 rounded-lg hover:bg-gold-light transition-colors">
            <Plus size={14} />
            Nouveau projet
          </button>
        </div>

        <div className="px-8 py-6 space-y-5">

          {/* Filtres + Recherche */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-dark-1 border border-white/8 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-gold/40 transition-colors"
              />
            </div>
            {['Tous', 'actif', 'draft', 'archived'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-4 py-2.5 rounded-lg border transition-colors capitalize ${
                  filter === f
                    ? 'bg-gold text-void border-gold font-medium'
                    : 'border-white/8 text-white/40 hover:text-white hover:border-white/20'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-dark-1 border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-widest text-white/30 font-normal">Projet</th>
                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-widest text-white/30 font-normal">Secteur</th>
                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-widest text-white/30 font-normal">Statut</th>
                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-widest text-white/30 font-normal">Visiteurs</th>
                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-widests text-white/30 font-normal">Leads</th>
                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-widest text-white/30 font-normal">Expériences</th>
                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-widest text-white/30 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-dark-2 border border-white/5 flex items-center justify-center flex-shrink-0">
                          <span className="text-gold text-xs font-medium">
                            {p.sector[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{p.name}</p>
                          <p className="text-white/30 text-xs">{p.client}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white/50 text-sm">{p.sector}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        p.status === 'actif'
                          ? 'bg-green-400/10 text-green-400'
                          : p.status === 'draft'
                          ? 'bg-gold/10 text-gold'
                          : 'bg-white/5 text-white/30'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white/70 text-sm">{p.visitors}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white/70 text-sm">{p.leads}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white/70 text-sm">{p.experiences}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/realisations/${p.slug}`}
                          target="_blank"
                          className="w-7 h-7 rounded-lg border border-white/8 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/30 transition-colors"
                          title="Voir les expériences"
                        >
                          <ExternalLink size={12} />
                        </Link>
                        <button
                          className="w-7 h-7 rounded-lg border border-white/8 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/30 transition-colors"
                          title="QR Code"
                        >
                          <QrCode size={12} />
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg border border-white/8 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/30 transition-colors"
                          title="Plus d'options"
                        >
                          <MoreVertical size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-white/20 text-sm">
                Aucun projet trouvé
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}