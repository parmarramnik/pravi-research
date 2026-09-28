import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Bell, CheckCheck, Filter, ShieldAlert } from 'lucide-react';
import { SeverityBadge } from '../components/Badges';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url = unreadOnly ? '/notifications?isRead=false' : '/notifications';
      const res = await apiClient.get(url);
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (e) {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      fetchNotifications();
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">CRITICAL ALERTS & EVENT FEED</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time event-driven notifications dispatched via RabbitMQ
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-3 py-1 text-xs font-mono border ${
              unreadOnly
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-[#1e293b] border-[#334155] text-slate-300'
            }`}
          >
            {unreadOnly ? 'Showing Unread Only' : 'Show All'}
          </button>

          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1.5 px-3 py-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-slate-200 text-xs font-mono"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-[#1e293b] divide-y divide-[#1e293b]">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400">No active alerts recorded.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono ${
                !n.isRead ? 'bg-[#1e293b]/40' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <SeverityBadge severity={n.severity} />
                  <span className="font-bold text-white text-xs">{n.title}</span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                  )}
                </div>
                <p className="text-slate-300 font-sans text-xs">{n.message}</p>
                <div className="text-[10px] text-slate-500">
                  Category: {n.category} • {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-2 py-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-indigo-300 text-[10px] shrink-0 self-start sm:self-auto"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
