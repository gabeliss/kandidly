import React, { useEffect, useState } from 'react';
import { getUser } from '../api/auth';
import { supabase } from '../api/supabase';

export default function AccountInfo() {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchInfo() {
      setLoading(true);
      setError('');
      try {
        const authUser = await getUser();
        setUser(authUser);
        if (!authUser) throw new Error('Not logged in');
        const { data: dbUser, error: userErr } = await supabase
          .from('users')
          .select('*')
          .eq('email', authUser.email)
          .single();
        if (userErr) throw userErr;
        setDbUser(dbUser);
        if (dbUser.company_id) {
          const { data: company, error: companyErr } = await supabase
            .from('companies')
            .select('*')
            .eq('id', dbUser.company_id)
            .single();
          if (companyErr) throw companyErr;
          setCompany(company);
        }
      } catch (e) {
        setError(e.message || 'Failed to load account info');
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, []);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading account info...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="p-4 border rounded bg-gray-50 max-w-md">
      <div className="font-bold mb-2">Account Info</div>
      <div className="text-sm text-gray-700">
        <div><span className="font-medium">Email:</span> {user?.email}</div>
        <div><span className="font-medium">Role:</span> {dbUser?.role}</div>
        {company && (
          <>
            <div><span className="font-medium">Company:</span> {company.name}</div>
            <div><span className="font-medium">Domain:</span> {company.domain}</div>
          </>
        )}
      </div>
    </div>
  );
} 