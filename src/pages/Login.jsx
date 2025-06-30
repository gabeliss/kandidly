import React, { useState } from 'react';
import { signInWithEmail } from '../api/auth';

const PUBLIC_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'aol.com', 'outlook.com', 'icloud.com', 'mail.com', 'gmx.com', 'protonmail.com', 'zoho.com', 'yandex.com'
];

// DEV: Allowlist for development testing
const DEV_ALLOWLIST = [
  'gabeliss17@gmail.com',
  'gabe.liss17@gmail.com',
  'gabeliss2019@gmail.com',
  'gabeliss@umich.edu'
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function isPublicDomain(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    return PUBLIC_DOMAINS.includes(domain);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('Please enter your work email.');
      return;
    }
    // DEV: Allow specific emails for development
    if (!DEV_ALLOWLIST.includes(email) && isPublicDomain(email)) {
      setError('Please use your company email address. Public email domains are not allowed.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email);
      setMessage('Check your email for a login link!');
    } catch (err) {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Company Login</h2>
        <input
          type="email"
          placeholder="yourname@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
          disabled={loading}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className="text-green-600 text-sm">{message}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Sending magic link...' : 'Send Magic Link'}
        </button>
        <div className="text-xs text-gray-500 text-center pt-2">
          Only company emails allowed. No public email domains.<br/>
          <span className="text-blue-400">DEV: Allowlist enabled for testing.</span>
        </div>
      </form>
    </div>
  );
} 