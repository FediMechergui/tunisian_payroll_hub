// ============================================================================
// PayrollHub — Employees List Page
// Searchable, sortable table of employees
// ============================================================================

import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { employeesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Employe, PaginatedResponse } from "@shared/types";
import { ContractType, UserRole } from "@shared/types";
import { ROLE_HIERARCHY } from "@shared/const";
import {
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
} from "lucide-react";

const contractBadge: Record<ContractType, { label: string; className: string }> = {
  [ContractType.CDI]: { label: "CDI", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  [ContractType.CDD]: { label: "CDD", className: "bg-blue-50 text-blue-700 border-blue-200" },
  [ContractType.SIVP]: { label: "SIVP", className: "bg-amber-50 text-amber-700 border-amber-200" },
  [ContractType.KARAMA]: { label: "Karama", className: "bg-purple-50 text-purple-700 border-purple-200" },
};

export default function Employees() {
  const [data, setData] = useState<PaginatedResponse<Employe> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const userLevel = ROLE_HIERARCHY[user?.role as keyof typeof ROLE_HIERARCHY] || 0;
  const canCreate = userLevel >= ROLE_HIERARCHY[UserRole.ADMIN_RH];

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeesApi.list({ search, page, pageSize: 10 });
      if (res.data.success && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const debounce = setTimeout(loadEmployees, 300);
    return () => clearTimeout(debounce);
  }, [loadEmployees]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value) + " TND";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employés</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gérez les profils et contrats de vos employés
          </p>
        </div>
        {canCreate && (
          <Link href="/app/employes/nouveau">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20">
              <Plus size={18} className="mr-2" />
              Nouvel Employé
            </Button>
          </Link>
        )}
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Rechercher par nom, CIN, poste, département..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 h-10 bg-slate-50/50 border-slate-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Employé
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  CIN
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Département
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                  Poste
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                  Contrat
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">
                  Salaire Base
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-10 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Aucun employé trouvé</p>
                    <p className="text-sm mt-1">
                      {search ? "Essayez avec d'autres critères de recherche" : "Commencez par ajouter un employé"}
                    </p>
                  </td>
                </tr>
              ) : (
                data?.items.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 font-semibold text-xs">
                            {emp.prenom[0]}{emp.nom[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {emp.prenom} {emp.nom}
                          </p>
                          <p className="text-xs text-slate-400">{emp.matriculeCnss}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 hidden md:table-cell font-mono">
                      {emp.cin}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 hidden sm:table-cell">
                      {emp.departement}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 hidden lg:table-cell">
                      {emp.poste}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${contractBadge[emp.typeContrat]?.className || ""}`}
                      >
                        {contractBadge[emp.typeContrat]?.label || emp.typeContrat}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-700 hidden xl:table-cell">
                      {formatCurrency(emp.salaireBase)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/app/employes/${emp.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye size={16} className="mr-1" />
                          <span className="hidden sm:inline">Voir</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {data.total} employé{data.total > 1 ? "s" : ""} au total
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8"
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm text-slate-600 px-2">
                Page {page} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
