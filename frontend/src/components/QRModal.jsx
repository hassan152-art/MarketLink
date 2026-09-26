import React, { useState, useEffect, useRef } from 'react';
import { fetchAPI } from '../services/api';
import { QrCode, CheckCircle2, X, Scan, AlertTriangle, ShieldCheck, PackageCheck, Lock } from 'lucide-react';
import { modalOpen, modalClose } from '../animations';

export const QRModal = ({ orderId, isFarmerScanner = false, onClose, onVerified }) => {
  const [qrData, setQrData] = useState(null);
  const [scanInput, setScanInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const backdropRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    modalOpen(backdropRef.current, dialogRef.current);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isFarmerScanner && orderId) {
      loadQRData();
    }
  }, [orderId, isFarmerScanner]);

  const handleClose = () => {
    modalClose(backdropRef.current, dialogRef.current, onClose);
  };

  const loadQRData = async () => {
    try {
      const data = await fetchAPI(`/qr/${orderId}`);
      setQrData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyScan = async (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    try {
      setLoading(true);
      const res = await fetchAPI('/qr/verify', {
        method: 'POST',
        body: JSON.stringify({ qr_code_data: scanInput.trim() })
      });
      setVerificationResult(res);
      if (onVerified) onVerified();
    } catch (err) {
      const msg = err.message || '';
      const isNotOwner = err.status === 403 || msg.toLowerCase().includes('not available') ||
        msg.toLowerCase().includes('authorized') || msg.toLowerCase().includes('not your');
      setVerificationResult({
        verified: false,
        notOwner: isNotOwner,
        title: isNotOwner ? 'Not Available' : 'Verification Failed',
        message: isNotOwner
          ? (err.message || 'This order belongs to another farmer\'s stall.')
          : err.message || 'QR Verification failed.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold font-serif text-slate-900 text-base flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-600" />
            {isFarmerScanner ? 'Digital QR Stall Scanner' : `Order #${orderId} Pickup QR`}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer QR View */}
        {!isFarmerScanner && qrData && (
          <div className="text-center space-y-4">
            <div className="relative p-6 bg-slate-950 rounded-3xl inline-block shadow-lg border-2 border-emerald-400/80 overflow-hidden">
              {/* Subtle animated laser line */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

              <svg viewBox="0 0 100 100" className="w-48 h-48 fill-white mx-auto">
                <rect x="0" y="0" width="30" height="30" fill="white" />
                <rect x="5" y="5" width="20" height="20" fill="black" />
                <rect x="10" y="10" width="10" height="10" fill="white" />

                <rect x="70" y="0" width="30" height="30" fill="white" />
                <rect x="75" y="5" width="20" height="20" fill="black" />
                <rect x="80" y="10" width="10" height="10" fill="white" />

                <rect x="0" y="70" width="30" height="30" fill="white" />
                <rect x="5" y="75" width="20" height="20" fill="black" />
                <rect x="10" y="80" width="10" height="10" fill="white" />

                <rect x="40" y="10" width="8" height="8" fill="white" />
                <rect x="52" y="20" width="8" height="8" fill="white" />
                <rect x="35" y="40" width="30" height="8" fill="white" />
                <rect x="40" y="60" width="8" height="8" fill="white" />
                <rect x="55" y="75" width="12" height="12" fill="white" />
                <rect x="75" y="45" width="10" height="10" fill="white" />
              </svg>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900">{qrData.customer_name}</p>
              <p className="text-[11px] text-slate-500 font-mono tracking-wider">{qrData.qr_code_data}</p>
              <p className="text-xs text-brand-700 font-bold mt-2">
                Present this digital QR pass at the stall for instant pickup verification!
              </p>
            </div>
          </div>
        )}

        {/* Farmer Scanner Verification View */}
        {isFarmerScanner && (
          <div className="space-y-4">
            {/* Animated Laser Scanner Frame */}
            <div className="relative h-28 bg-slate-950 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-800">
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <Scan className="w-5 h-5 animate-pulse" />
                <span>Ready to Verify Customer QR</span>
              </div>
            </div>

            <form onSubmit={handleVerifyScan} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scan QR / Paste 6-Char Verification Code
                </label>
                <input
                  type="text"
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  placeholder="e.g. ML-X8Y9Z0 or paste QR payload"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
              >
                <Scan className="w-4 h-4" /> {loading ? 'Checking...' : 'Verify & Complete Pickup'}
              </button>
            </form>

            {/* Results Feedback */}
            {verificationResult && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold border flex items-start gap-3 ${
                  verificationResult.verified
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : verificationResult.notOwner
                    ? 'bg-red-50 text-red-900 border-2 border-red-300 shadow-sm'
                    : 'bg-red-50 text-red-900 border-red-200'
                }`}
              >
                {verificationResult.verified ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : verificationResult.notOwner ? (
                  <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-red-700" />
                  </div>
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-sm">
                    {verificationResult.title || (verificationResult.verified ? 'Pickup Verified!' : 'Verification Failed')}
                  </p>
                  <p className="text-[11px] mt-0.5 leading-relaxed">{verificationResult.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
