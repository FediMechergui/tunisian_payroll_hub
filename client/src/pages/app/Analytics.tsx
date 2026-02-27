// ============================================================================
// PayrollHub — Advanced Analytics Dashboard
// Turnover, absenteism, salary distribution, seniority, dept costs
// ============================================================================

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import type { DashboardStats } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart3,
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  CalendarDays,
  FileText,
  Clock,
  Building2,
  Wallet,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

// ── Simple Bar (CSS-only) ────────────────────────────────────────────

function SimpleBar({
  items,
  maxValue,
  color = "bg-primary",
}: {
  items: { label: string; value: number; subLabel?: string }[];
  maxValue?: number;
  color?: string;
}) {
  const max = maxValue ?? Math.max(...items.map(i => i.value), 1);
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-28 text-right truncate">{item.label}</span>
          <div className="flex-1 h-6 bg-muted rounded-sm overflow-hidden relative">
            <div
              className={`h-full ${color} rounded-sm transition-all`}
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
            <span className="absolute inset-0 flex items-center px-2 text-xs font-medium">
              {item.subLabel || String(item.value)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════

export default function Analytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardApi.getStats();
        setStats(res.data.data || null);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-center text-muted-foreground py-8">Données indisponibles.</p>;
  }

  const analytics = stats.analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytique avancée</h1>
        <p className="text-muted-foreground">
          Indicateurs clés RH : turnover, absentéisme, coûts et répartitions
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Effectif total</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalEmployes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs">Masse salariale</span>
            </div>
            <p className="text-2xl font-bold">{fmt(stats.masseSalariale)} <span className="text-sm font-normal">TND</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-xs">Documents générés</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.documentsGeneres ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Déclarations en attente</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.declarationsEnAttente ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Turnover */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Turnover mensuel
            </CardTitle>
            <CardDescription className="text-xs">Embauches et départs sur les 12 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.turnover && analytics.turnover.length > 0 ? (
              <div className="space-y-1">
                {analytics.turnover.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-right text-muted-foreground">
                      {t.mois}
                    </span>
                    <div className="flex-1 flex gap-1">
                      <div
                        className="h-4 bg-green-500 rounded-sm"
                        style={{ width: `${Math.max(4, t.entrees * 20)}px` }}
                        title={`${t.entrees} entrée(s)`}
                      />
                      <div
                        className="h-4 bg-red-400 rounded-sm"
                        style={{ width: `${Math.max(4, t.sorties * 20)}px` }}
                        title={`${t.sorties} départ(s)`}
                      />
                    </div>
                    <span className="text-green-600">+{t.entrees}</span>
                    <span className="text-red-500">-{t.sorties}</span>
                  </div>
                ))}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm" /> Embauches</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-sm" /> Départs</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Pas de données de turnover disponibles.</p>
            )}
          </CardContent>
        </Card>

        {/* Absentéisme */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Taux d'absentéisme par département
            </CardTitle>
            <CardDescription className="text-xs">Basé sur les congés approuvés (jours / effectif)</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.absenteisme && analytics.absenteisme.length > 0 ? (
              <SimpleBar
                items={analytics.absenteisme.map(a => ({
                  label: a.departement,
                  value: a.taux,
                  subLabel: `${a.taux.toFixed(1)} j/emp`,
                }))}
                color="bg-orange-500"
              />
            ) : (
              <p className="text-sm text-muted-foreground">Pas de données d'absentéisme.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Coût par département */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Coût salarial par département
            </CardTitle>
            <CardDescription className="text-xs">Salaire brut moyen + charges patronales (28.07%)</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.coutParDepartement && analytics.coutParDepartement.length > 0 ? (
              <SimpleBar
                items={analytics.coutParDepartement.map(c => ({
                  label: c.departement,
                  value: c.total,
                  subLabel: `${fmt(c.total)} TND`,
                }))}
                color="bg-blue-500"
              />
            ) : (
              <p className="text-sm text-muted-foreground">Pas de données de coût.</p>
            )}
          </CardContent>
        </Card>

        {/* Répartition salaires */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Répartition des salaires
            </CardTitle>
            <CardDescription className="text-xs">Distribution par tranche salariale</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.repartitionSalaires && analytics.repartitionSalaires.length > 0 ? (
              <SimpleBar
                items={analytics.repartitionSalaires.map(r => ({
                  label: r.tranche,
                  value: r.count,
                  subLabel: `${r.count} employé(s)`,
                }))}
                color="bg-purple-500"
              />
            ) : (
              <p className="text-sm text-muted-foreground">Pas de données salariales.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3 – Ancienneté */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Distribution de l'ancienneté
          </CardTitle>
          <CardDescription className="text-xs">Nombre d'employés par tranche d'ancienneté</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.ancienneteDistribution && analytics.ancienneteDistribution.length > 0 ? (
            <div className="flex items-end gap-3 h-40">
              {analytics.ancienneteDistribution.map((a, idx) => {
                const max = Math.max(...analytics.ancienneteDistribution!.map(x => x.count), 1);
                const heightPct = (a.count / max) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-xs font-medium mb-1">{a.count}</span>
                    <div
                      className="w-full bg-primary rounded-t-sm transition-all"
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                    />
                    <span className="text-xs text-muted-foreground mt-1 text-center leading-tight">{a.tranche}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Pas de données d'ancienneté.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
