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
      if (v.cnic.includes(normalizedQuery)) return true;
      if (v.raw_line.includes(normalizedQuery)) return true;
      return false;
    }).map(v => {
      // Parse structured data from the garbled line
      let name = 'Unknown';
      let familyNo = 'Unknown';
      let voteNo = 'Unknown';
      let blockCode = 'Unknown';
      
      try {
        if (v.block_code && v.block_code !== 'Unknown') {
          blockCode = v.block_code.slice(-2); // Get last 2 digits
        }

        const ageMatch = v.raw_line.match(new RegExp(`(\\d{2,3})\\s+${v.cnic}`));
        
        // Extract the name part (everything before the age and CNIC)
        const nameMatch = v.raw_line.match(new RegExp(`^(.*?)\\s*\\.?\\.?\\.?\\s*\\d{2,3}\\s+${v.cnic}`));
        if (nameMatch) {
            name = nameMatch[1].trim();
        } else {
            const cnicMatch = v.raw_line.match(new RegExp(`^(.*?)\\s+${v.cnic}`));
            if (cnicMatch) name = cnicMatch[1].trim();
        }
        
        const afterCnic = v.raw_line.split(v.cnic)[1];
        if (afterCnic) {
          const numsAfter = afterCnic.match(/\d+/g);
          if (numsAfter && numsAfter.length >= 2) {
             voteNo = numsAfter[numsAfter.length - 1];
             familyNo = numsAfter[numsAfter.length - 2];
          } else if (numsAfter && numsAfter.length === 1) {
             voteNo = numsAfter[0];
          }
        }
      } catch(e) {}

      return {
        ...v,
        name,
        familyNo,
        voteNo,
        blockCode,
        y0_pct: v.y0_pct,
        y1_pct: v.y1_pct
      };
    });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search voter database' }, { status: 500 });
  }
}
