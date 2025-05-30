// db.js
import { createClient } from "@supabase/supabase-js";
import { FileObject } from "@supabase/storage-js";
import * as FileSystem from "expo-file-system";
import { decode as atob } from "base-64";

// 1) Initialize Supabase client
const SUPABASE_URL = "https://owfwygmjaxixnoxofgtj.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93Znd5Z21qYXhpeG5veG9mZ3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3OTcxNTAsImV4cCI6MjA2MTM3MzE1MH0.cVbjjd2JoEPoA_9lnAR2C9Zxg8lJa0QgxHGBkgiWMQc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// 2) Create a new user profile
//    - userData: { id, name, email, ... }
//    - avatarFile: { uri, type, name }  (e.g. from ImagePicker)
export async function createUser(userData, avatarFile = null) {
  let avatar_url = null;
  // 2a) If an avatar file was provided, upload it to Storage
  if (avatarFile) {
    // Convert RN file URI into a Blob
    const response = await fetch(avatarFile.uri);
    const blob = await response.blob();

    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `avatars/${userData.id}.${fileExt}`;

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("avatars")
      .upload(filePath, blob, { contentType: avatarFile.type });

    if (uploadError) {
      console.warn("Avatar upload error:", uploadError);
    } else {
      // Public URL for the uploaded avatar
      const { publicURL, error: urlError } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (urlError) console.warn("Getting public URL failed:", urlError);
      else avatar_url = publicURL;
    }

    console.log("Blob info:", blob);
    console.log("Blob size:", blob.size, "type:", blob.type);
  }

  // 2b) Insert into your users table
  const { data, error } = await supabase
    .from("users")
    .insert([{ ...userData, avatar_url }])
    .single();

  return { user: data, error };
}

// 3) Update an existing user's profile (name, avatar, etc.)
export async function updateUser(id, updates, avatarFile = null) {
  let avatar_url = updates.avatar_url || null;

  // 3a) If a new avatar is provided, upload & override
  if (avatarFile) {
    const response = await fetch(avatarFile.uri);
    const blob = await response.blob();
    let fileName = avatarFile.name || avatarFile.fileName;
    if (!fileName && avatarFile.uri) {
      // Try to extract from URI
      fileName = avatarFile.uri.split("/").pop();
    }
    if (!fileName) {
      fileName = "avatar.jpg"; // fallback
    }
    const fileExt = fileName.split(".").pop();
    const filePath = `avatars/${id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, blob, {
        contentType: avatarFile.type,
        upsert: true,
      });
    if (!uploadError) {
      const { publicURL } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      avatar_url = publicURL;
    }

    console.log("Blob info:", blob);
    console.log("Blob size:", blob.size, "type:", blob.type);
  }

  // 3b) Update the row
  const { data, error } = await supabase
    .from("users")
    .update({ ...updates, avatar_url })
    .eq("id", id)
    .single();

  return { user: data, error };
}

// 4) Fetch a user's profile by their ID
export async function getUserProfile(id) {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, avatar_url, created_at, total_points")
    .eq("id", id)
    .single();
  return { user: data, error };
}

// 5) (Optional) List all users or search by name/email
export async function listUsers(filter = "") {
  let query = supabase.from("users").select("id, name, avatar_url");
  if (filter) {
    query = query.ilike("name", `%${filter}%`);
  }
  const { data, error } = await query;
  return { users: data, error };
}

/**
 * Set the current user's vote for a given challenge, returning the index of their new vote.
 * Returns null if undoing a vote.
 */
export async function uploadVote(challengeId, userId) {
  // Fetch the user's current selected challenge
  const { data: userRec, error: userErr } = await supabase
    .from("users")
    .select("selected_challenge_id")
    .eq("id", userId)
    .single();

  if (userErr) return { voteIndex: null, error: userErr };
  console.log("User Record:", userRec);

  // Update vote to the new challengeId
  const { error: updateErr } = await supabase
    .from("users")
    .update({ selected_challenge_id: challengeId })
    .eq("id", userId);

  console.log(challengeId);

  if (updateErr) return { voteIndex: null, error: updateErr };
  return { voteIndex: challengeId, error: null };
}

/* Gets list of challenges for a given round
 */
export const getChallengeList = async (roundNumber) => {
  console.log("bruh");
  const { data, error } = await supabase
    .from("challenge_list")
    .select(
      "id, short_desc, full_desc, difficulty, point_value, challenge_round"
    )
    .eq("challenge_round", roundNumber);
  console.log("Challenge List:", data);
  return { data, error };
};

/* Returns id # of the current challenge period based on current time
 */
export const getChallengeRound = async () => {
  const now = new Date().toISOString();
  console.log("Current time:", now);

  const { data, error } = await supabase
    .from("challenge_rounds")
    .select("id, start_time, end_time")
    .lte("start_time", now)
    .gte("end_time", now);

  return { data, error };
};

/**
 * Fetch the current user's match for a given challenge
 */
export async function getUserMatch(userId, challengeId) {
  // 1) get the match record involving this user
  const { data: matchRec, error: matchErr } = await supabase
    .from("matches")
    .select("user_a, user_b")
    .eq("challenge_id", challengeId)
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .single();
  if (matchErr || !matchRec) return { match: null, error: matchErr };
  // console.log("Match Record:", matchRec);
  // 2) determine the partner's ID
  const partnerId =
    matchRec.user_a === userId ? matchRec.user_b : matchRec.user_a;
  // 3) fetch partner's profile
  const { data: partner, error: userErr } = await supabase
    .from("users")
    .select("id, name, avatar_url, selected_challenge_id")
    .eq("id", partnerId)
    .single();
  return { match: partner, error: userErr };
}

/* Function to upload */
export async function uploadSubmissionMedia(
  userId,
  challengeId,
  fileUri,
  mimeType = "image/jpeg"
) {
  try {
    if (!userId || !fileUri || !challengeId) {
      throw new Error("Missing user ID, file URI, or challenge ID");
    }

    // Step 1: Upload file to Supabase storage
    const fileExt = fileUri.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `submissions/${fileName}`;

    const file = {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    };

    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(filePath, file, {
        contentType: mimeType,
      });

    if (uploadError) throw uploadError;

    // Step 2: Insert row into the submissions table
    const { error: insertError, data: submission } = await supabase
      .from("submissions")
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        payload: filePath, // store the storage path (or use getPublicUrl if you prefer)
        submitted_at: new Date().toISOString(),
      })
      .single();

    if (insertError) throw insertError;

    return { success: true, submission };
  } catch (err) {
    console.error("uploadSubmissionMedia error:", err);
    return { error: err.message || err };
  }
}

/**
 * (Optional) Fetch submissions/history for a user
 */
export async function getUserSubmissions(userId) {
  const { data, error } = await supabase
    .from("submissions")
    .select("id, challenge_id, payload, submitted_at")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });
  return { submissions: data, error };
}

export async function getChallenges() {
  const { data, error } = await supabase
    .from("challenge_rounds")
    .select("id, start_time, end_time")
    .order("id", { ascending: true });
  return { data, error };
}

/* Returns the user ID if their submission is complete */
export async function confirmSubmission(userId) {
  const { data, error } = await supabase
    .from("submissions")
    .select("challenge_id")
    .eq("user_id", userId);
  return { data, error };
}

// //get Avatar url from the users id
// export const getAvatarUrl = (userId, ext = "jpg") => {
//   const filePath = `avatars/${userId}.${ext}`;
//   const { publicURL } = supabase.storage.from("avatars").getPublicUrl(filePath);
//   return { avatarUrl: publicURL || null, error: null };
// };

/**
 * Set (upload and update) the avatar for a user using base64 and FileSystem
 * Only supports images (png, jpg, jpeg, etc.)
 * @param {string} userId
 * @param {object} avatarFile - { uri, type, fileName/name }
 * @returns {object} { avatarUrl, error }
 */

export async function setAvatar(userId, avatarFile) {
  // Ensure the file is an image
  if (!avatarFile.type || !avatarFile.type.startsWith("image")) {
    return {
      avatarUrl: null,
      error: new Error("Only image files are supported for avatars."),
    };
  }

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(avatarFile.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Create unique filename with timestamp
  const timestamp = Date.now();
  const uniqueFileName = `${userId}_${timestamp}.jpg`;
  const contentType = avatarFile.type;

  // Ensure content type is valid
  if (!contentType.startsWith("image/")) {
    return {
      avatarUrl: null,
      error: new Error("Invalid image type."),
    };
  }

  // Use filePath format with the unique filename
  const filePath = uniqueFileName;
  console.log("Generated filePath:", filePath); // Debug log

  // Decode base64 to binary
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, bytes, { contentType, upsert: true });

  if (uploadError) {
    console.log("Upload error:", uploadError);
    return { avatar_name: null, error: uploadError };
  }

  // Update user row in the database with the new avatar URL and filename
  console.log("Attempting to update user with:", {
    userId,
    avatar_name: filePath,
  });
  console.log("filePath:", filePath);
  console.log("userId:", userId);
  const { data: updateData, error: updateError } = await supabase
    .from("users")
    .update({
      avatar_name: filePath,
    })
    .eq("id", userId)
    .select(); // Add select to get the updated data

  if (updateError) {
    console.log("Update error:", updateError);
    return { avatar_name: null, error: updateError };
  }

  console.log("Update successful, returned data:", updateData); // Debug log

  return { avatar_name: filePath, error: null };
}
