import React, { useState, useEffect, useRef } from 'react';
import { fetchAPI } from '../services/api';
import { Star, X } from 'lucide-react';
import { modalOpen, modalClose } from '../animations';

export const ReviewModal = ({ order, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
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

  const handleClose = () => {
    modalClose(backdropRef.current, dialogRef.current, onClose);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setLoading(true);
      await fetchAPI('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          farmer_id: order.farmer_id,
          product_id: order.items[0]?.product_id,
          rating,
          comment
        })
      });
      onSubmitted();
      handleClose();
    } catch (err) {
      alert(err.message);
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
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold font-serif text-slate-900 text-base">Rate Your Harvest Purchase</h3>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Star Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 active:scale-95 transition-transform"
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Your Feedback Comment</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows="4"
              required
              placeholder="Tell other shoppers about freshness, taste, and stall service..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? 'Submitting Review...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};
