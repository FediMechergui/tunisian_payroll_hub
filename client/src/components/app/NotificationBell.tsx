// ============================================================================
// PayrollHub — Notification Bell Dropdown
// Live notification bell with unread count badge and quick actions
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { notificationsApi } from "@/lib/api";
import type { Notification } from "@shared/types";
import { NotificationType, NotificationPriority } from "@shared/types";
import {
  Bell,
  BellOff,
  CheckCheck,
  CalendarDays,
  FileText,
  Wallet,
  UserPlus,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useLocation } from "wouter";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  [NotificationType.CONGE_DEMANDE]: <CalendarDays size={14} className="text-blue-500" />,
  [NotificationType.CONGE_APPROUVE]: <CalendarDays size={14} className="text-green-500" />,
  [NotificationType.CONGE_REJETE]: <CalendarDays size={14} className="text-red-500" />,
  [NotificationType.PAIE_CALCULEE]: <Wallet size={14} className="text-indigo-500" />,
  [NotificationType.PAIE_VALIDEE]: <Wallet size={14} className="text-green-500" />,
  [NotificationType.PAIE_FINALISEE]: <Wallet size={14} className="text-emerald-600" />,
  [NotificationType.DOCUMENT_GENERE]: <FileText size={14} className="text-sky-500" />,
  [NotificationType.DECLARATION_GENEREE]: <FileText size={14} className="text-orange-500" />,
  [NotificationType.EMPLOYE_CREE]: <UserPlus size={14} className="text-violet-500" />,
  [NotificationType.CONTRAT_EXPIRATION]: <AlertTriangle size={14} className="text-amber-500" />,
  [NotificationType.ALERTE_SYSTEME]: <AlertTriangle size={14} className="text-red-500" />,
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationsApi.list();
      if (data.success && data.data) {
        setNotifications(data.data.notifications.slice(0, 10));
        setUnreadCount(data.data.unreadCount);
      }
    } catch {
      // Silent — bell is non-critical
    }
  }, []);

  // Poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refresh when popover opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const handleClick = async (n: Notification) => {
    if (!n.lu) {
      try {
        await notificationsApi.markRead(n.id);
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, lu: true } : x));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch { /* ignore */ }
    }
    setOpen(false);
    if (n.lien) navigate(n.lien);
  };

  const formatDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60_000) return "maintenant";
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m`;
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h`;
    return `${Math.floor(diff / 86400_000)}j`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition relative">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleMarkAllRead}
              >
                <CheckCheck size={12} className="mr-1" />
                Tout lire
              </Button>
            )}
          </div>
        </div>
        <Separator />

        {/* Content */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <BellOff size={28} className="mb-2" />
            <p className="text-xs">Aucune notification</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="divide-y divide-slate-100">
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex items-start gap-2.5 px-4 py-2.5 cursor-pointer transition-colors hover:bg-slate-50 ${
                    !n.lu ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {TYPE_ICONS[n.type] || <Bell size={14} className="text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-medium truncate ${!n.lu ? "text-slate-900" : "text-slate-500"}`}>
                        {n.titre}
                      </span>
                      {!n.lu && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-300 flex-shrink-0 mt-0.5">{formatDate(n.createdAt)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <Separator />
        {/* Footer */}
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs justify-center"
            onClick={() => { setOpen(false); navigate("/app/notifications"); }}
          >
            Voir toutes les notifications
            <ExternalLink size={12} className="ml-1" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
