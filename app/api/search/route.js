import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', 'voter_data.json');
    
    if (!fs.existsSync(dataPath)) {
       return NextResponse.json({ error: 'Database not found. Please run the extraction script.' }, { status: 500 });
    }

    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const voters = JSON.parse(fileContent);

    // Search by CNIC first (exact match ignoring formatting or partial match)
    // Then search raw line for names (might be unreliable due to Urdu text extraction)
    const normalizedQuery = query.trim();

    const results = voters.filter(v => {
      if (v.cnic.includes(normalizedQuery)) {
        return true;
      }
      if (v.raw_line.includes(normalizedQuery)) {
        return true;
      }
      return false;
    });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search voter database' }, { status: 500 });
  }
}
