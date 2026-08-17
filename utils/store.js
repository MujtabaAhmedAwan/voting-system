import { kv } from '@vercel/kv';

export async function getStatus(email) {
  try {
    const data = await kv.get(`auth_status:${email}`);
    return data;
  } catch (e) {
    console.error('Error reading from Vercel KV store', e);
    return null;
  }
}

export async function setStatus(email, statusData) {
  try {
    // Expire pending requests after 24 hours to keep the DB clean
    await kv.set(`auth_status:${email}`, statusData, { ex: 86400 });
  } catch (e) {
    console.error('Error writing to Vercel KV store', e);
  }
}
