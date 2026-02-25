// ============================================================================
// PayrollHub — Dashboard Page
// KPI cards + charts + recent activity
// ============================================================================

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi } from "@/lib/api";
import type { DashboardStats } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  FileCheck,
  CalendarClock,
  Banknote,
  TrendingUp,
  Building2,
  ArrowUpRight,
  Wallet,
  Shield,
  Receipt,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";

const PIE_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7"];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await dashboardApi.getStats();
      if (res.data.success && res.data.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-TN", {
      style: "decimal",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(value) + " TND";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-32 bg-white rounded-xl border animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bonjour, {user?.prenom} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Voici un aperçu de votre activité RH
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total Employés
                </p>
                <p className="text-3xl font-bold mt-1">
                  {stats?.totalEmployes || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-blue-100 text-xs">
              <ArrowUpRight size={14} />
              <span>Effectif actuel</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">
                  Contrats Actifs
                </p>
                <p className="text-3xl font-bold mt-1">
                  {stats?.contratsActifs || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileCheck size={24} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-emerald-100 text-xs">
              <ArrowUpRight size={14} />
              <span>CDI, CDD, SIVP, Karama</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">
                  Congés en Attente
                </p>
                <p className="text-3xl font-bold mt-1">
                  {stats?.congesEnAttente || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CalendarClock size={24} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-amber-100 text-xs">
              <span>Demandes à traiter</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Masse Salariale
                </p>
                <p className="text-2xl font-bold mt-1">
                  {stats ? formatCurrency(stats.masseSalariale) : "0 TND"}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Banknote size={24} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-purple-100 text-xs">
              <TrendingUp size={14} />
              <span>Total mensuel brut</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mass salariale evolution */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-700">
              Évolution de la Masse Salariale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.evolutionMasseSalariale || []}>
                  <defs>
                    <linearGradient
                      id="colorMontant"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="mois"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "13px",
                    }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Montant",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="montant"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#colorMontant)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Contract type distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-700">
              Types de Contrats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.employesParContrat || []}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="type"
                  >
                    {(stats?.employesParContrat || []).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "13px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department distribution */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-700">
            Employés par Département
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.employesParDepartement || []}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="departement"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "13px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[0, 6, 6, 0]}
                  barSize={24}
                  name="Employés"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Phase 2 — Payroll Analytics */}
      {stats?.payroll && (
        <>
          <div>
            <h2 className="text-lg font-bold text-slate-900 mt-2">
              Analyse de la Paie — {stats.payroll.dernierePeriode}
            </h2>
            <p className="text-sm text-slate-500">
              Résumé de la dernière période calculée
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">
                      Brut Total
                    </p>
                    <p className="text-2xl font-bold mt-1 text-slate-900">
                      {formatCurrency(stats.payroll.totalBrut)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Banknote size={20} className="text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">
                      Net Total
                    </p>
                    <p className="text-2xl font-bold mt-1 text-blue-600">
                      {formatCurrency(stats.payroll.totalNet)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Wallet size={20} className="text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">
                      CNSS + IRPP
                    </p>
                    <p className="text-2xl font-bold mt-1 text-red-600">
                      {formatCurrency(
                        stats.payroll.totalCnss + stats.payroll.totalIrpp
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Shield size={20} className="text-red-600" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  CNSS: {formatCurrency(stats.payroll.totalCnss)} | IRPP:{" "}
                  {formatCurrency(stats.payroll.totalIrpp)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">
                      Coût Employeur
                    </p>
                    <p className="text-2xl font-bold mt-1 text-amber-600">
                      {formatCurrency(stats.payroll.coutEmployeur)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Receipt size={20} className="text-amber-600" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {stats.payroll.periodesCalculees} période(s) calculée(s) ·{" "}
                  {stats.payroll.periodesFinalisees} finalisée(s)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payroll evolution chart */}
          {stats.payroll.evolutionPayroll.length > 1 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-700">
                  Évolution de la Paie (Brut / Net / Coût Employeur)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.payroll.evolutionPayroll}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="mois"
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          fontSize: "13px",
                        }}
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name === "brut"
                            ? "Brut"
                            : name === "net"
                              ? "Net"
                              : "Coût Employeur",
                        ]}
                      />
                      <Legend
                        formatter={(value: string) =>
                          value === "brut"
                            ? "Brut"
                            : value === "net"
                              ? "Net"
                              : "Coût Employeur"
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="brut"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="net"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="coutEmployeur"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
