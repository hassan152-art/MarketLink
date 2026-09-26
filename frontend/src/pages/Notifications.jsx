import React, { useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { NotificationsPanel } from '../components/NotificationsPanel';
import { pageEntrance } from '../animations';

export const Notifications = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    pageEntrance(pageRef.current);
  }, []);

  return (
    <div ref={pageRef} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Stay in the loop</span>
        <h1 className="text-3xl font-extrabold font-serif text-slate-900 flex items-center gap-2">
          Notifications <Bell className="w-6 h-6 text-brand-600" />
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Real-time updates on your orders and pickups, as they happen.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <NotificationsPanel />
      </div>
    </div>
  );
};
