import React, { useState } from 'react';
import { MapView } from '../components/MapView';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle, Users, HelpCircle } from 'lucide-react';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Support & Contact</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-serif mt-3">We’re here to help you use MarketLink.</h1>
            <p className="text-sm sm:text-base text-slate-300 leading-7 mt-5">
              Whether you are a customer looking for a market, a farmer setting up your stall, or an administrator managing the platform, send us your question and our support team can guide you to the right place.
            </p>
          </div>
        </div>
      </section>

      {/* Contact channels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            [Mail, 'Email Support', 'support@marketlink.com', 'For general questions and platform support.'],
            [Phone, 'Support Hotline', '+1 (555) 019-2831', 'For urgent platform or order enquiries.'],
            [Clock, 'Support Hours', 'Mon – Sat · 9 AM – 6 PM', 'Response times may vary by enquiry volume.'],
            [MessageCircle, 'Customer Help', 'Orders & pickup', 'Get help with reservations, products and market details.'],
          ].map(([Icon, title, value, text]) => (
            <div key={title} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-brand-700 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="text-sm font-semibold text-brand-700 mt-2">{value}</p>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main contact area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="font-bold font-serif text-slate-900 text-xl">MarketLink Support Center</h2>
              <p className="text-sm text-slate-500 leading-6 mt-3">
                Tell us what you need help with. Useful details such as your order reference, market name or account email can help us understand your request faster.
              </p>
              <div className="space-y-5 mt-7 text-sm">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-brand-700 shrink-0" />
                  <div><p className="font-bold text-slate-900">Office Location</p><p className="text-slate-500">100 Green Tech Plaza, Suite 400, New York, NY 10021</p></div>
                </div>
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-brand-700 shrink-0" />
                  <div><p className="font-bold text-slate-900">Email</p><p className="text-slate-500">support@marketlink.com</p></div>
                </div>
                <div className="flex gap-3">
                  <Users className="w-5 h-5 text-brand-700 shrink-0" />
                  <div><p className="font-bold text-slate-900">Farmer & Seller Support</p><p className="text-slate-500">Registration, inventory, orders and market listing guidance.</p></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Office Location</h3>
              <MapView
                markets={[{ id: 99, name: 'MarketLink HQ', address: '100 Green Tech Plaza', latitude: 40.7829, longitude: -73.9654 }]}
                center={[40.7829, -73.9654]}
                zoom={13}
                className="h-72"
              />
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
            <div className="mb-7">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Send an Enquiry</span>
              <h2 className="font-bold font-serif text-slate-900 text-2xl mt-1">How can we help?</h2>
              <p className="text-sm text-slate-500 mt-2">Complete the form and include enough detail for our team to understand your request.</p>
            </div>

            {sent && (
              <div className="mb-5 p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Your message has been submitted successfully.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-bold text-slate-700 mb-2">Full Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Your name" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-2">Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-2">How can we help?</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">Select an enquiry type</option>
                  <option>Customer Support</option>
                  <option>Order & Pickup</option>
                  <option>Farmer Registration</option>
                  <option>Product or Market Listing</option>
                  <option>Technical Issue</option>
                  <option>General Enquiry</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-2">Message</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows="7" placeholder="Describe your question or issue..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <button type="submit" className="w-full py-4 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-bold shadow-md flex items-center justify-center gap-2 transition-colors">
                <Send className="w-4 h-4" /> Submit Support Request
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <HelpCircle className="w-7 h-7 text-brand-700 mx-auto mb-3" />
          <h2 className="text-3xl font-extrabold font-serif text-slate-900">Before You Contact Us</h2>
          <p className="text-sm text-slate-500 mt-2">A few common questions that may help you find the answer faster.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['How do I find a market?', 'Open the Markets directory to search participating markets, review operating days and view stall information.'],
            ['How do pre-orders work?', 'Add available products to your cart, review your order and follow the checkout flow for the selected pickup plan.'],
            ['I am a farmer. Can I list products?', 'Use the registration flow and farmer dashboard to manage your seller profile and available inventory.'],
            ['Where can I report a technical issue?', 'Choose Technical Issue in the enquiry form and describe what happened, including the page or feature where you saw the problem.'],
          ].map(([q, a]) => (
            <details key={q} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm group">
              <summary className="cursor-pointer list-none font-bold text-sm text-slate-900 flex justify-between gap-4">{q}<span className="text-brand-700 text-lg group-open:rotate-45 transition-transform">+</span></summary>
              <p className="text-xs text-slate-500 leading-6 mt-3">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};
