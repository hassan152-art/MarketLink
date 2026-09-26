import React from 'react';
import { Code, ExternalLink, ShieldCheck, Terminal, Server } from 'lucide-react';

export const APIDocs = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest flex items-center gap-1">
            <Terminal className="w-4 h-4" /> Developer Specifications
          </span>
          <h1 className="text-3xl font-extrabold font-serif text-slate-900">MarketLink REST API Docs</h1>
        </div>

        <a
          href={`${window.location.origin}/api/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:bg-slate-800 transition-colors"
        >
          <span>Open Full Swagger UI</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <Server className="w-6 h-6 text-brand-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-slate-900">Base API Endpoint</p>
            <code className="text-brand-700 font-mono text-xs">{`${window.location.origin}/api`}</code>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold font-serif text-slate-900 text-lg">Core API Endpoints Overview</h3>

          <div className="space-y-3 font-mono text-xs">
            {[
              { method: 'POST', endpoint: '/api/auth/login', desc: 'Authenticate user & issue JWT Token' },
              { method: 'GET', endpoint: '/api/markets', desc: 'List all Farmers Markets with map coordinates & farmer counts' },
              { method: 'GET', endpoint: '/api/products', desc: 'Filter produce by category, price, market day, stock status' },
              { method: 'POST', endpoint: '/api/orders', desc: 'Create pre-order for pickup with selected time slot window' },
              { method: 'POST', endpoint: '/api/ai/chat', desc: 'Greenie AI natural language query engine (Supports English & Roman Urdu)' },
              { method: 'GET', endpoint: '/api/ai/forecast', desc: 'AI Demand Forecasting algorithm output per product' },
              { method: 'GET', endpoint: '/api/qr/:id', desc: 'Retrieve unique pre-order QR code payload' },
              { method: 'POST', endpoint: '/api/qr/verify', desc: 'Farmer scanner QR code verification' },
              { method: 'GET', endpoint: '/api/impact/food-waste', desc: 'Environmental Food Waste & CO2 Impact metrics' },
              { method: 'GET', endpoint: '/api/audit/logs', desc: 'Retrieve system security audit log trail' },
            ].map((api, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
                    api.method === 'GET' ? 'bg-emerald-100 text-brand-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {api.method}
                  </span>
                  <span className="font-bold text-slate-900">{api.endpoint}</span>
                </div>
                <span className="font-sans text-xs text-slate-500">{api.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
