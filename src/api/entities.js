import { supabase } from './supabase';

// Challenge CRUD
export async function fetchChallenges() {
  const { data, error } = await supabase.from('challenge').select('*');
  if (error) throw error;
  return data;
}

export async function fetchChallengeById(id) {
  const { data, error } = await supabase.from('challenge').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createChallenge(challenge) {
  const { data, error } = await supabase.from('challenge').insert([challenge]).select().single();
  if (error) throw error;
  return data;
}

export async function updateChallenge(id, updateData) {
  const { data, error } = await supabase.from('challenge').update(updateData).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteChallenge(id) {
  const { error } = await supabase.from('challenge').delete().eq('id', id);
  if (error) throw error;
}

// Interview CRUD
export async function fetchInterviews(company_id) {
  const query = supabase.from('interview').select('*');
  if (company_id) query.eq('company_id', company_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchInterviewById(id) {
  const { data, error } = await supabase.from('interview').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createInterview(interview) {
  if (!interview.company_id || !interview.created_by) {
    throw new Error('company_id and created_by are required');
  }
  const { data, error } = await supabase.from('interview').insert([interview]).select().single();
  if (error) throw error;
  return data;
}

export async function updateInterview(id, updateData) {
  const { data, error } = await supabase.from('interview').update(updateData).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteInterview(id) {
  const { error } = await supabase.from('interview').delete().eq('id', id);
  if (error) throw error;
}
