import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const familyNoParam = searchParams.get('familyNo');
  const blockCodeParam = searchParams.get('blockCode');
  
  if (!familyNoParam || !blockCodeParam) {
    return NextResponse.json({ error: 'familyNo and blockCode are required' }, { status: 400 });
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', 'voter_data.json');
    
    if (!fs.existsSync(dataPath)) {
       return NextResponse.json({ error: 'Database not found. Please run the extraction script.' }, { status: 500 });
    }

    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const voters = JSON.parse(fileContent);

    // Load family data for accurate gharana and name
    const familyDataPath = path.join(process.cwd(), 'family_data.json');
    let familyData = {};
    if (fs.existsSync(familyDataPath)) {
      try {
        const familyContent = fs.readFileSync(familyDataPath, 'utf8');
        const parsedFamily = JSON.parse(familyContent);
        for (const key in parsedFamily) {
           for (const member of parsedFamily[key].members) {
               familyData[member.CNIC] = member;
           }
        }
      } catch(e) {
        console.error("Error parsing family_data.json", e);
      }
    }

    // To find family members, we need to parse the structured data first, because familyNo is not stored as a key
    const results = voters.map(v => {
      let name = 'Unknown';
      let familyNo = 'Unknown';
      let voteNo = 'Unknown';
      let blockCode = 'Unknown';
      
      try {
        if (v.block_code && v.block_code !== 'Unknown') {
          blockCode = v.block_code.slice(-2); // Get last 2 digits
        }

        if (familyData[v.cnic]) {
          const member = familyData[v.cnic];
          name = member.NameUrdu;
          familyNo = member.GharanaNo;
          voteNo = member.SilsilaNo;
        } else {
          // Fallback to extraction if not in family_data.json
          const ageMatch = v.raw_line.match(new RegExp(`(\\d{2,3})\\s+${v.cnic}`));
          const nameMatch = v.raw_line.match(new RegExp(`^(.*?)\\s*\\.?\\.?\\.?\\s*\\d{2,3}\\s+${v.cnic}`));
          if (nameMatch) {
              name = nameMatch[1].trim();
          } else {
              const cnicMatch = v.raw_line.match(new RegExp(`^(.*?)\\s+${v.cnic}`));
              if (cnicMatch) name = cnicMatch[1].trim();
          }
          
          let rawNoCnic = v.raw_line.replace(v.cnic, ' ');
          if (v.block_code) {
             rawNoCnic = rawNoCnic.replace(v.block_code, ' ');
          }
          
          const nums = rawNoCnic.match(/\b\d+\b/g);
          
          if (nums && nums.length >= 2) {
              let validPairs = [];
              for (let i = 0; i < nums.length - 1; i++) {
                  const f = parseInt(nums[i]);
                  const v_num = parseInt(nums[i+1]);
                  if (f <= v_num && f < 1500 && v_num < 4000) {
                      validPairs.push({ f: f.toString(), v: v_num.toString() });
                  }
              }
              if (validPairs.length > 0) {
                  familyNo = validPairs[validPairs.length - 1].f;
                  voteNo = validPairs[validPairs.length - 1].v;
              }
          }
        }
        
        // ==========================================
        // MANUAL OVERRIDES: Add missing or merged CNICs here
        // If the PDF extraction messed up a Gharana Number, you can force it here.
        // ==========================================
        const cnicOverrides = {
            '38201-6215011-4': { familyNo: '6', voteNo: '19' },
            '38201-1116216-4': { familyNo: '6' }, // From user
            '38201-1116216-6': { familyNo: '6' }, // In database
            '38201-9004840-4': { familyNo: '6' },
            '38201-6205416-4': { familyNo: '6' },
            '38201-0202235-5': { familyNo: '6' },
            '38201-1158228-1': { familyNo: '6' },
            '38201-5057660-7': { familyNo: '6' }
        };

        if (cnicOverrides[v.cnic]) {
            familyNo = cnicOverrides[v.cnic].familyNo;
            if (cnicOverrides[v.cnic].voteNo) voteNo = cnicOverrides[v.cnic].voteNo;
        }
        // ==========================================
      } catch(e) {}

      // Add mock location and constituency mapping
      let constituency = 'NA-123 / PP-456';
      let pollingStation = 'Govt. Primary School, Local Block';
      let district = 'Unknown District';
      
      if (blockCode !== 'Unknown') {
        const lastDigit = parseInt(blockCode.slice(-1)) || 0;
        const regionCode = parseInt(v.block_code.slice(0, 3)) || 100;
        constituency = `NA-${regionCode + 10} / PP-${regionCode + lastDigit + 20}`;
        district = regionCode > 250 ? 'Rawalpindi' : 'Lahore';
        pollingStation = `Govt. High School No. ${lastDigit + 1}, Block ${blockCode}`;
      }

      return {
        ...v,
        name,
        familyNo,
        voteNo,
        blockCode,
        y0_pct: v.y0_pct,
        y1_pct: v.y1_pct,
        constituency,
        pollingStation,
        district
      };
    }).filter(v => {
      if (familyNoParam === 'Unknown' || v.familyNo === 'Unknown') {
          return false;
      }
      
      // STRICT FILTER: Only show people from the EXACT same block code.
      // Do NOT merge adjacent blocks, as they represent completely different geographic areas
      // in some constituencies.
      const isCorrectFamily = v.familyNo === familyNoParam;
      const isCorrectBlock = v.block_code === blockCodeParam;

      return isCorrectFamily && isCorrectBlock;
    });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Family search error:', error);
    return NextResponse.json({ error: 'Failed to search family database' }, { status: 500 });
  }
}
