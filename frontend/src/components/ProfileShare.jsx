import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * MarketLink profile sharing button.
 * Place this component inside a page that is rendered under AuthProvider.
 * It shares the logged-in user's profile URL using Web Share or clipboard.
 * Optional props: className and profilePath. Without profilePath it shares the current page.
 */
export default function ProfileShare({ className = '', profilePath }) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  if (!user) return null;

  const displayName = user.name || user.fullName || user.username || 'MarketLink User';
  const path = profilePath || window.location.pathname;
  const profileUrl = `${window.location.origin}${path}`;

  const shareProfile = async () => {
    setMessage('');
    const shareData = {
      title: `${displayName} on MarketLink`,
      text: `Check out ${displayName}'s profile on MarketLink.`,
      url: profileUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setMessage('Profile sharing opened.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl);
        setMessage('Profile link copied!');
      } else {
        window.prompt('Copy your MarketLink profile link:', profileUrl);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setMessage('Could not share automatically. Copy this link: ' + profileUrl);
      }
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={shareProfile}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '10px 16px', border: 'none', borderRadius: 10,
          background: '#15803d', color: '#fff', fontWeight: 600,
          cursor: 'pointer', fontSize: 14,
        }}
        aria-label="Share my MarketLink profile"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <path d="m8.6 10.7 6.8-4.4M8.6 13.3l6.8 4.4" />
        </svg>
        Share Profile
      </button>
      {message && <p role="status" style={{ marginTop: 8, fontSize: 13, color: '#166534', overflowWrap: 'anywhere' }}>{message}</p>}
    </div>
  );
}
