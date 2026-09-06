/**
 * ProjectReportPDF — Template du rapport de performance client (PDF)
 * Rendu vectoriel via @react-pdf/renderer — généré côté client, au clic.
 */

'use client'

import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import type { ProjectDto, VisitStatsDto, ProjectButtonClicksDto, LeadStatsDto, ProjectQuestionStatsDto } from '@/lib/api'

const COLORS = {
  charcoal: '#0B0B0B',
  gold: '#C8A45D',
  white: '#FFFFFF',
  gray: '#6B6B6B',
  cardBg: '#F7F5F0',
  border: '#E5E0D5',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
    padding: 40,
    fontFamily: 'Helvetica',
  },
  logo: {
    width: 130,
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.gold,
    letterSpacing: 2,
    marginBottom: 10,
  },
  projectName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.charcoal,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 11,
    color: COLORS.gray,
    marginBottom: 6,
  },
  meta: {
    fontSize: 9,
    color: COLORS.gray,
    marginBottom: 18,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold,
    marginBottom: 26,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.charcoal,
    marginBottom: 5,
  },
  kpiLabel: {
    fontSize: 8,
    color: COLORS.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  columnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  column: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  barLabel: {
    fontSize: 9,
    color: COLORS.charcoal,
    width: 82,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.cardBg,
    borderRadius: 3,
    marginHorizontal: 8,
  },
  barFill: {
    height: 6,
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  barCount: {
    fontSize: 9,
    color: COLORS.gray,
    width: 18,
    textAlign: 'right',
  },
  emptyNote: {
    fontSize: 9,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  conclusionBox: {
    backgroundColor: COLORS.cardBg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
    padding: 16,
    marginBottom: 40,
  },
  conclusionText: {
    fontSize: 11,
    color: COLORS.charcoal,
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.gold,
    paddingTop: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: COLORS.gray,
  },
})

interface Props {
  project: Pick<ProjectDto, 'name' | 'clientName'>
  visitStats: VisitStatsDto
  buttonStats: ProjectButtonClicksDto
  leadStats: LeadStatsDto
  questionStats: ProjectQuestionStatsDto
}

export default function ReportDocument({ project, visitStats, buttonStats, leadStats, questionStats }: Props) {
  // Date du jour de génération — calculée à l'appel, jamais figée.
  const generatedAt = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })

  const convertedCount = leadStats.byStatus.find((s) => s.status === 'Converti')?.count ?? 0
  const activeCategories = questionStats.categories.filter((c) => c.count > 0)
  const maxCategoryCount = activeCategories.length ? Math.max(...activeCategories.map((c) => c.count)) : 1
  const maxButtonCount = buttonStats.buttons.length ? Math.max(...buttonStats.buttons.map((b) => b.clickCount)) : 1

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <Image src="/Newlogo.png" style={styles.logo} />
        <Text style={styles.title}>RAPPORT DE PERFORMANCE</Text>
        <Text style={styles.projectName}>{project.name}</Text>
        <Text style={styles.clientName}>{project.clientName}</Text>
        <Text style={styles.meta}>Généré le {generatedAt} · Données depuis le lancement du projet</Text>
        <View style={styles.hr} />

        {/* Chiffres clés */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{visitStats.total}</Text>
            <Text style={styles.kpiLabel}>Visites</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{buttonStats.totalClicks}</Text>
            <Text style={styles.kpiLabel}>Clics</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{leadStats.total}</Text>
            <Text style={styles.kpiLabel}>Leads</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{questionStats.totalQuestions}</Text>
            <Text style={styles.kpiLabel}>Questions à Luxedia</Text>
          </View>
        </View>

        {/* Questions fréquentes + Boutons les plus cliqués */}
        <View style={styles.columnsRow}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Questions fréquentes à Luxedia</Text>
            {activeCategories.length === 0 ? (
              <Text style={styles.emptyNote}>Aucune question enregistrée pour l&apos;instant.</Text>
            ) : (
              activeCategories.map((c) => (
                <View key={c.category} style={styles.barRow}>
                  <Text style={styles.barLabel}>{c.category}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(c.count / maxCategoryCount) * 100}%` }]} />
                  </View>
                  <Text style={styles.barCount}>{c.count}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Boutons les plus cliqués</Text>
            {buttonStats.buttons.length === 0 ? (
              <Text style={styles.emptyNote}>Aucun clic enregistré pour l&apos;instant.</Text>
            ) : (
              buttonStats.buttons.map((b) => (
                <View key={b.buttonLabel} style={styles.barRow}>
                  <Text style={styles.barLabel}>{b.buttonLabel}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(b.clickCount / maxButtonCount) * 100}%` }]} />
                  </View>
                  <Text style={styles.barCount}>{b.clickCount}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Conclusion */}
        <View style={styles.conclusionBox}>
          <Text style={styles.conclusionText}>
            Cette vitrine immersive et son assistant Luxedia génèrent un engagement mesurable pour {project.clientName}
            {convertedCount > 0 ? `, avec déjà ${convertedCount} lead${convertedCount > 1 ? 's' : ''} converti${convertedCount > 1 ? 's' : ''}.` : '.'}
          </Text>
        </View>

        {/* Pied de page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Signature Immersion — Expériences virtuelles</Text>
          <Text style={styles.footerText}>3D · 360° · IA</Text>
        </View>
      </Page>
    </Document>
  )
}
