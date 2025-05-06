// db.js
import { createClient } from '@supabase/supabase-js';

// 1) Initialize Supabase client
const SUPABASE_URL   = 'https://owfwygmjaxixnoxofgtj.supabase.co';
const SUPABASE_ANON  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93Znd5Z21qYXhpeG5veG9mZ3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3OTcxNTAsImV4cCI6MjA2MTM3MzE1MH0.cVbjjd2JoEPoA_9lnAR2C9Zxg8lJa0QgxHGBkgiWMQc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// 2) Create a new user profile
//    - userData: { id, name, email, ... }
//    - avatarFile: { uri, type, name }  (e.g. from ImagePicker)
export async function createUser(userData, avatarFile = null) {
  let avatar_url = null;
  console.log("got to create user")
  // 2a) If an avatar file was provided, upload it to Storage
  if (avatarFile) {
    // Convert RN file URI into a Blob
    const response = await fetch(avatarFile.uri);
    const blob = await response.blob();

    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `avatars/${userData.id}.${fileExt}`;

    const { error: uploadError, data: uploadData } =
      await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { contentType: avatarFile.type });

    if (uploadError) {
      console.warn('Avatar upload error:', uploadError);
    } else {
      // Public URL for the uploaded avatar
      const { publicURL, error: urlError } =
        supabase.storage.from('avatars').getPublicUrl(filePath);

      if (urlError) console.warn('Getting public URL failed:', urlError);
      else avatar_url = publicURL;
    }
  }

  // 2b) Insert into your users table
  const { data, error } = await supabase
    .from('users')
    .insert([{ ...userData, avatar_url }])
    .single();

  return { user: data, error };
}

// 3) Update an existing user’s profile (name, avatar, etc.)
export async function updateUser(id, updates, avatarFile = null) {
  let avatar_url = updates.avatar_url || null;

  // 3a) If a new avatar is provided, upload & override
  if (avatarFile) {
    const response = await fetch(avatarFile.uri);
    const blob = await response.blob();
    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `avatars/${id}.${fileExt}`;

    const { error: uploadError } =
      await supabase.storage.from('avatars').upload(filePath, blob, {
        contentType: avatarFile.type,
        upsert: true
      });
    if (!uploadError) {
      const { publicURL } =
        supabase.storage.from('avatars').getPublicUrl(filePath);
      avatar_url = publicURL;
    }
  }

  // 3b) Update the row
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, avatar_url })
    .eq('id', id)
    .single();

  return { user: data, error };
}

// 4) Fetch a user’s profile by their ID
export async function getUserProfile(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, avatar_url, created_at')
    .eq('id', id)
    .single();

  return { user: data, error };
}

// 5) (Optional) List all users or search by name/email
export async function listUsers(filter = '') {
  let query = supabase.from('users').select('id, name, avatar_url');
  if (filter) {
    query = query.ilike('name', `%${filter}%`);
  }
  const { data, error } = await query;
  return { users: data, error };
}

export const getChallengeList = async () => {
  const { data, error } = await supabase
    .from('challenge_list')
    .select('id, short_desc, full_desc, difficulty')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getChallengePeriod = async () => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('start_time', { ascending: false })
    .limit(1);
  return { data, error };
};


/**
 * Fetch the current user's match for a given challenge
 */
export async function getUserMatch(userId, challengeId) {
    // 1) get the match record involving this user
    const { data: matchRec, error: matchErr } = await supabase
      .from('matches')
      .select('user_a, user_b')
      .eq('challenge_id', challengeId)
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .single();
      console.log("Match Record:", matchRec);
    if (matchErr || !matchRec) return { match: null, error: matchErr };
    // console.log("Match Record:", matchRec);
    // 2) determine the partner's ID
    const partnerId = matchRec.user_a === userId ? matchRec.user_b : matchRec.user_a;
    console.log("Partner ID:", partnerId);
    // 3) fetch partner's profile
    const { data: partner, error: userErr } = await supabase
      .from('users')
      .select('id, name, avatar_url')
      .eq('id', partnerId)
      .single();
  
    return { match: partner, error: userErr };
  }
  
  /**
   * (Optional) Fetch submissions/history for a user
   */
  export async function getUserSubmissions(userId) {
    const { data, error } = await supabase
      .from('submissions')
      .select('id, challenge_id, payload, submitted_at')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });
    return { submissions: data, error };
  }
  

export async function getChallenges() {
    const { data, error } = await supabase
      .from('challenges')
      .select('id, start_time, end_time')
      .order('id', { ascending: true });
    return { data, error };
  }
  