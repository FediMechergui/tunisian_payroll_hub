// ============================================================================
// PayrollHub — Notifications Page
// Full notifications list with filters and bulk actions
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notificationsApi } from "@/lib/api";
import { toast } from "sonner";
import type { Notification } from "@shared/types";
import { NotificationType, NotificationPriority } from "@shared/types";
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  Filter,
  CalendarDays,
  FileText,
  Wallet,
  UserPlus,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  [NotificationType.CONGE_DEMANDE]: <CalendarDays size={18} className="text-blue-500" />,
  [NotificationType.CONGE_APPROUVE]: <CalendarDays size={18} className="text-green-500" />,
  [NotificationType.CONGE_REJETE]: <CalendarDays size={18} className="text-red-500" />,
  [NotificationType.PAIE_CALCULEE]: <Wallet size={18} className="text-indigo-500" />,
  [NotificationType.PAIE_VALIDEE]: <Wallet size={18} className="text-green-500" />,
  [NotificationType.PAIE_FINALISEE]: <Wallet size={18} className="text-emerald-600" />,
  [NotificationType.DOCUMENT_GENERE]: <FileText size={18} className="text-sky-500" />,
  [NotificationType.DECLARATION_GENEREE]: <FileText size={18} className="text-orange-500" />,
  [NotificationType.EMPLOYE_CREE]: <UserPlus size={18} className="text-violet-500" />,
  [NotificationType.CONTRAT_EXPIRATION]: <AlertTriangle size={18} className="text-amber-500" />,
  [NotificationType.ALERTE_SYSTEME]: <AlertTriangle size={18} className="text-red-500" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  [NotificationPriority.LOW]: "bg-slate-100 text-slate-600",
  [NotificationPriority.MEDIUM]: "bg-blue-100 text-blue-700",
  [NotificationPriority.HIGH]: "bg-orange-100 text-orange-700",
  [NotificationPriority.URGENT]: "bg-red-100 text-red-700",
};

const PRIORITY_LABELS: Record<string, string> = {
  [NotificationPriority.LOW]: "Basse",
  [NotificationPriority.MEDIUM]: "Moyenne",
  [NotificationPriority.HIGH]: "Haute",
  [NotificationPriority.URGENT]: "Urgente",
};

type FilterType = "all" | "unread" | "high";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [, navigate] = useLocation();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await notificationsApi.list();
      if (data.success && data.data) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch {
      toast.error("Erreur lors du chargement des notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, lu: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      toast.error("Erreur");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setUnreadCount(0);
      toast.success("Toutes les notifications marquées comme lues");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification supprimée");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleClick = (n: Notification) => {
    if (!n.lu) handleMarkRead(n.id);
    if (n.lien) navigate(n.lien);
  };

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.lu;
    if (filter === "high")
      return n.priorite === NotificationPriority.HIGH || n.priorite === NotificationPriority.URGENT;
    return true;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return "À l'instant";
    if (diff < 3600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
    if (diff < 86400_000) return `Il y a ${Math.floor(diff / 3600_000)}h`;
    return d.toLocaleDateString("fr-TN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Toutes les notifications sont lues"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchNotifications}>
            <RefreshCw size={16} className="mr-1" /> Rafraîchir
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck size={16} className="mr-1" /> Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-slate-400" />
        {(["all", "unread", "high"] as FilterType[]).map(f => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Toutes" : f === "unread" ? "Non lues" : "Priorité haute"}
          </Button>
        ))}
      </div>

      {/* List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <BellOff size={40} className="mb-3" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                    !n.lu ? "bg-blue-50/40" : ""
                  }`}
                >
                  {/* Icon */}
                  <div className="mt-0.5 flex-shrink-0">
                    {TYPE_ICONS[n.type] || <Bell size={18} className="text-slate-400" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-medium ${!n.lu ? "text-slate-900" : "text-slate-600"}`}>
                        {n.titre}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[n.priorite] || ""}`}
                      >
                        {PRIORITY_LABELS[n.priorite] || n.priorite}
                      </Badge>
                      {!n.lu && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(n.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.lu && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={e => { e.stopPropagation(); handleMarkRead(n.id); }}
                        title="Marquer comme lu"
                      >
                        <CheckCheck size={14} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                      onClick={e => { e.stopPropagation(); handleDelete(n.id); }}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
