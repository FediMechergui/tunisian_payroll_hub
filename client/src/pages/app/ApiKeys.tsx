// ============================================================================
// PayrollHub — API Keys Management Page
// Create, view, toggle, delete API keys for external integrations
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiKeysApi } from "@/lib/api";
import { toast } from "sonner";
import { ApiPermission } from "@shared/types";
import type { ApiKey } from "@shared/types";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Shield,
  Zap,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

const ALL_PERMISSIONS: { value: ApiPermission; label: string; description: string }[] = [
  { value: ApiPermission.EMPLOYES_READ, label: "Employés (lecture)", description: "Lire la liste et les détails des employés" },
  { value: ApiPermission.EMPLOYES_WRITE, label: "Employés (écriture)", description: "Créer et modifier des employés" },
  { value: ApiPermission.PAIE_READ, label: "Paie (lecture)", description: "Lire les périodes de paie et bulletins" },
  { value: ApiPermission.CONGES_READ, label: "Congés (lecture)", description: "Lire les demandes de congés" },
  { value: ApiPermission.CONGES_WRITE, label: "Congés (écriture)", description: "Créer des demandes de congés" },
  { value: ApiPermission.DASHBOARD_READ, label: "Dashboard (lecture)", description: "Accéder aux statistiques du tableau de bord" },
  { value: ApiPermission.DOCUMENTS_READ, label: "Documents (lecture)", description: "Lire les documents générés" },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<Omit<ApiKey, "cle">[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Form state
  const [nom, setNom] = useState("");
  const [permissions, setPermissions] = useState<ApiPermission[]>([]);
  const [limiteRequetes, setLimiteRequetes] = useState(1000);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiKeysApi.list();
      if (data.success && data.data) setKeys(data.data);
    } catch {
      toast.error("Erreur lors du chargement des clés API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!nom.trim() || permissions.length === 0) {
      toast.error("Nom et au moins une permission requis");
      return;
    }
    try {
      setCreating(true);
      const { data } = await apiKeysApi.create({ nom, permissions, limiteRequetes });
      if (data.success && data.data) {
        setShowNewKey((data.data as any).rawKey);
        setShowCreate(false);
        setNom("");
        setPermissions([]);
        setLimiteRequetes(1000);
        fetchKeys();
        toast.success("Clé API créée");
      }
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await apiKeysApi.toggle(id);
      fetchKeys();
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette clé API ? Les intégrations utilisant cette clé cesseront de fonctionner.")) return;
    try {
      await apiKeysApi.delete(id);
      setKeys(prev => prev.filter(k => k.id !== id));
      toast.success("Clé API supprimée");
    } catch {
      toast.error("Erreur");
    }
  };

  const togglePermission = (perm: ApiPermission) => {
    setPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clés API</h1>
          <p className="text-sm text-slate-500">
            Gérez les clés d'accès pour les intégrations tierces
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} className="mr-1" /> Nouvelle clé
        </Button>
      </div>

      {/* Info card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">API REST externe</p>
              <p className="text-sm text-blue-700 mt-1">
                Les clés API permettent l'accès à <code className="bg-blue-100 px-1 rounded">/api/v1/*</code> via
                un header <code className="bg-blue-100 px-1 rounded">Authorization: Bearer &lt;clé&gt;</code>.
                Chaque clé a des permissions granulaires et une limite de requêtes par heure.
              </p>
              <p className="text-xs text-blue-500 mt-2">
                Documentation disponible via GET /api/v1/ (avec une clé valide)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keys list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key size={18} /> Clés API ({keys.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Key size={40} className="mx-auto mb-3 opacity-30" />
              <p>Aucune clé API créée</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
                <Plus size={14} className="mr-1" /> Créer une clé
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Préfixe</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Limite/h</TableHead>
                  <TableHead>Dernière utilisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map(k => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.nom}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{k.prefixe}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {k.permissions.map(p => (
                          <Badge key={p} variant="outline" className="text-[10px]">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Zap size={12} className="text-amber-500" />
                        {k.limiteRequetes}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {k.derniereUtilisation
                        ? new Date(k.derniereUtilisation).toLocaleDateString("fr-TN", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={k.actif ? "default" : "secondary"}>
                        {k.actif ? "Actif" : "Désactivé"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleToggle(k.id)}
                          title={k.actif ? "Désactiver" : "Activer"}
                        >
                          {k.actif ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} className="text-slate-400" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                          onClick={() => handleDelete(k.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle clé API</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nom de la clé</Label>
              <Input
                placeholder="Ex: Intégration comptabilité"
                value={nom}
                onChange={e => setNom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Limite de requêtes par heure</Label>
              <Input
                type="number"
                min={10}
                max={10000}
                value={limiteRequetes}
                onChange={e => setLimiteRequetes(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="mb-2 block">Permissions</Label>
              <div className="space-y-2">
                {ALL_PERMISSIONS.map(p => (
                  <label
                    key={p.value}
                    className="flex items-start gap-2 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={permissions.includes(p.value)}
                      onCheckedChange={() => togglePermission(p.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium">{p.label}</span>
                      <p className="text-xs text-slate-400">{p.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 size={14} className="mr-1 animate-spin" />}
              Créer la clé
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Key Reveal Dialog */}
      <Dialog open={!!showNewKey} onOpenChange={() => setShowNewKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Clé API créée
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-600">
              Copiez cette clé maintenant. Elle ne sera <strong>plus jamais affichée</strong>.
            </p>
            <div className="flex items-center gap-2 bg-slate-900 text-green-400 p-3 rounded-lg font-mono text-sm">
              <code className="flex-1 break-all">{showNewKey}</code>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-400 hover:text-green-300 flex-shrink-0"
                onClick={() => copyToClipboard(showNewKey || "")}
              >
                <Copy size={14} />
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              Utilisez cette clé dans le header: <code>Authorization: Bearer {showNewKey?.substring(0, 12)}...</code>
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowNewKey(null)}>J'ai copié ma clé</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
