import { supabase } from './supabase';

export async function signInWithEmail(email) {
  return supabase.auth.signInWithOtp({ email });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// Upsert user and company after login
export async function upsertUserAndCompany() {
  const { user } = await supabase.auth.getUser().then(r => r.data);
  if (!user) return;
  const email = user.email;
  const domain = email.split('@')[1].toLowerCase();

  // 1. Find or create company
  let { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('domain', domain)
    .single();
  if (companyError && companyError.code === 'PGRST116') {
    // Not found, create
    const { data: newCompany, error: createCompanyError } = await supabase
      .from('companies')
      .insert([{ name: domain, domain }])
      .select()
      .single();
    if (createCompanyError) throw createCompanyError;
    company = newCompany;
  } else if (companyError) {
    throw companyError;
  }

  // 2. Find or create user
  let { data: existingUser, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (userError && userError.code === 'PGRST116') {
    // Not found, create
    const { data: newUser, error: createUserError } = await supabase
      .from('users')
      .insert([{ email, company_id: company.id, role: 'admin' }])
      .select()
      .single();
    if (createUserError) throw createUserError;
    existingUser = newUser;
  } else if (userError) {
    throw userError;
  }
  // If user exists but not linked to company, update
  if (existingUser && !existingUser.company_id) {
    await supabase.from('users').update({ company_id: company.id }).eq('id', existingUser.id);
  }
  return { user: existingUser, company };
} 