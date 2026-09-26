import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Bell, CheckCircle2, XCircle, ThumbsUp, PackageCheck, Sprout, Trash2,
  CheckCheck, Wifi, WifiOff
} from 'lucide-react';
import { cardStaggerReveal } from '../animations';

const ICONS_BY_TYPE = {
  order_placed: { Icon: Sprout, cls: 'bg-emerald-100 text-emerald-700' },
  order_ready: { Icon: PackageCheck, cls: 'bg-amber-100 text-amber-700' },
  order_completed: { Icon: CheckCircle2, cls: 'bg-blue-100 text-blue-700' },
  order_accepted: { Icon: ThumbsUp, cls: 'bg-purple-100 text-purple-700' },
  order_cancelled: { Icon: XCircle, cls: 'bg-red-100 text-red-700' },
};

const iconFor = (type) => ICONS_BY_TYPE[type] || { Icon: Bell, cls: 'bg-slate-100 text-slate-600' };

/**
 * Opens a fetch-based SSE stream (EventSource can't send an Authorization
 * header, and the backend expects a Bearer token) and calls onMessage for
 * every `data: {...}` frame received. Returns an AbortController to close it.
 */
const openNotificationStream = (token, onMessage) => {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch('/api/notifications/stream', {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split('\n\n');
        buffer = frames.pop();

        for (const frame of frames) {
          const line = frame.split('\n').find((l) => l.startsWith('data: '));
          if (!line) continue;
          try {
            onMessage(JSON.parse(line.slice(6)));
          } catch {
            // ignore malformed frames (e.g. keep-alive pings)
          }
        }
      }
    } catch (err) {
      if (err?.name !== 'AbortError') console.error('Notification stream error:', err);
    }
  })();

  return controller;
};

export const NotificationsPanel = ({ embedded = false }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const listRef = useRef(null);
  const emptyRef = useRef(null);
  const [showEmpty, setShowEmpty] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetchAPI('/notifications');
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Real-time stream
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('marketlink_token');
    if (!token) return;

    const controller = openNotificationStream(token, (msg) => {
      if (msg.type === 'connected') {
        setConnected(true);
        return;
      }
      if (msg.type === 'notification' && msg.notification) {
        setNotifications((prev) => [msg.notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      controller.abort();
      setConnected(false);
    };
  }, [user]);

  // Stagger the list in once, the first time it loads with content.
  // New notifications that arrive later via SSE are prepended without
  // re-triggering the whole list's entrance animation.
  const hasRevealedRef = useRef(false);
  useEffect(() => {
    if (!loading && notifications.length > 0 && listRef.current && !hasRevealedRef.current) {
      hasRevealedRef.current = true;
      const items = listRef.current.querySelectorAll('[data-reveal]');
      cardStaggerReveal(items);
    }
  }, [loading, notifications.length]);

  // Empty-state entrance (CSS fallback classes, mount-triggered rather than scroll-triggered)
  useEffect(() => {
    if (!loading && notifications.length === 0) {
      const t = setTimeout(() => setShowEmpty(true), 30);
      return () => clearTimeout(t);
    }
    setShowEmpty(false);
  }, [loading, notifications.length]);

  const handleMarkAsRead = async (id) => {
    try {
      await fetchAPI(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetchAPI('/notifications/read-all', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetchAPI(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.read) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n.id !== id);
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="py-16 text-center text-slate-500">
        <Bell className="w-10 h-10 mx-auto mb-3 text-slate-200" />
        <p className="text-sm font-semibold">Log in to see your notifications.</p>
      </div>
    );
  }

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            {connected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-slate-300" />
            )}
            {connected ? 'Live' : 'Connecting…'}
          </span>
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div
          ref={emptyRef}
          className={`py-16 text-center text-slate-400 ${showEmpty ? 'reveal-show' : 'reveal-hidden'}`}
        >
          <Bell className="w-10 h-10 mx-auto mb-3 text-slate-200" />
          <p className="text-sm font-semibold text-slate-500">No notifications yet</p>
          <p className="text-xs mt-1">Order updates will show up here in real time.</p>
        </div>
      ) : (
        <div ref={listRef} className="space-y-2">
          {notifications.map((n) => {
            const { Icon, cls } = iconFor(n.type);
            return (
              <div
                key={n.id}
                data-reveal
                className={`w-full text-left p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                  !n.read ? 'border-brand-200 bg-brand-50/30' : 'border-slate-100 bg-white'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <button
                  onClick={() => !n.read && handleMarkAsRead(n.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-sm font-bold text-slate-900 leading-tight">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5" title="Unread" />}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
