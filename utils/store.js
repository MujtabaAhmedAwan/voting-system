import fs from 'fs';
import path from 'path';

const storePath = process.env.VERCEL ? '/tmp/auth_store.json' : path.join(process.cwd(), '.auth_store.json');

export function getStatus(email) {
  try {
    if (fs.existsSync(storePath)) {
      const data = fs.readFileSync(storePath, 'utf8');
      return JSON.parse(data)[email];
    }
    return null;
  } catch (e) {
    console.error('Error reading from store', e);
    return null;
  }
}

export function setStatus(email, statusData) {
  try {
    let data = {};
    if (fs.existsSync(storePath)) {
      data = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    }
    data[email] = statusData;
    fs.writeFileSync(storePath, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing to store', e);
  }
}
