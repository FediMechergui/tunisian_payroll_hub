// ============================================================================
// PayrollHub — User Management Page
// Super Admin only
// ============================================================================

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usersApi } from "@/lib/api";
import type { Utilisateur } from "@shared/types";
import { UserRole } from "@shared/types";
import { Plus, Shield, UserCog, Trash2, Loader2 } from "lucide-react";

const roleLabels: Record<UserRole, { label: string; color: string }> = {
  [UserRole.SUPER_ADMIN]: { label: "Super Admin", color: "bg-red-50 text-red-700 border-red-200" },
  [UserRole.ADMIN_RH]: { label: "Admin RH", color: "bg-blue-50 text-blue-700 border-blue-200" },
  [UserRole.ADMIN_PAIE]: { label: "Admin Paie", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  [UserRole.COMPTABLE]: { label: "Comptable", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  [UserRole.MANAGER]: { label: "Manager", color: "bg-amber-50 text-amber-700 border-amber-200" },
  [UserRole.EMPLOYE]: { label: "Employé", color: "bg-slate-50 text-slate-700 border-slate-200" },
};

export default function UsersPage() {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // New user form
  const [newUser, setNewUser] = useState({
    email: "",
    motDePasse: "",
    nom: "",
    prenom: "",
    role: UserRole.EMPLOYE as string,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await usersApi.list();
      if (res.data.success && res.data.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await usersApi.create(newUser);
      if (res.data.success) {
        loadUsers();
        setDialogOpen(false);
        setNewUser({ email: "", motDePasse: "", nom: "", prenom: "", role: UserRole.EMPLOYE });
      }
    } catch (err: any) {
      console.error("Create user error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver cet utilisateur ?")) return;
    try {
      await usersApi.delete(id);
      loadUsers();
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("fr-TN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return dateStr; }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gérez les comptes utilisateurs et les rôles d'accès
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20">
              <Plus size={18} className="mr-2" />
              Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un Utilisateur</DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel utilisateur avec un rôle spécifique
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prénom</Label>
                  <Input
                    value={newUser.prenom}
                    onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                    className="mt-1"
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={newUser.nom}
                    onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                    className="mt-1"
                    placeholder="Nom"
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1"
                  placeholder="email@entreprise.tn"
                />
              </div>
              <div>
                <Label>Mot de Passe</Label>
                <Input
                  type="password"
                  value={newUser.motDePasse}
                  onChange={(e) => setNewUser({ ...newUser, motDePasse: e.target.value })}
                  className="mt-1"
                  placeholder="Minimum 8 caractères"
                />
              </div>
              <div>
                <Label>Rôle</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(v) => setNewUser({ ...newUser, role: v })}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !newUser.email || !newUser.motDePasse || !newUser.nom || !newUser.prenom}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {creating ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus size={16} className="mr-2" />}
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Legend */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-slate-500">
            <Shield size={16} />
            Hiérarchie des Rôles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(roleLabels).map(([, { label, color }]) => (
              <Badge key={label} variant="outline" className={`${color} text-xs`}>
                {label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Créé le</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-10 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : (
                users.map((u) => {
                  const role = roleLabels[u.role] || { label: u.role, color: "" };
                  return (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-700 font-semibold text-xs">{u.prenom[0]}{u.nom[0]}</span>
                          </div>
                          <p className="font-medium text-slate-900 text-sm">{u.prenom} {u.nom}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className={`text-xs ${role.color}`}>{role.label}</Badge>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <Badge variant="outline" className={u.actif ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
                          {u.actif ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 hidden lg:table-cell">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(u.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
