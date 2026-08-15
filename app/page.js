'use client';
import { useState, useEffect } from 'react';
import './globals.css';

export default function Home() {
  const [authState, setAuthState] = useState('REGISTER'); // REGISTER, OTP, PENDING, APPROVED, DENIED
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState('');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Check for direct approval link and local storage token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      
      if (urlToken) {
        localStorage.setItem('voting_access_token', urlToken);
        // Clean up URL
        window.history.replaceState({}, document.title, '/');
        setAuthState('APPROVED');
        return;
      }

      const storedToken = localStorage.getItem('voting_access_token');
      if (storedToken) {
        setAuthState('APPROVED');
      }
    }
  }, []);

  // Poll for admin approval when in PENDING state
  useEffect(() => {
    let intervalId;
    if (authState === 'PENDING' && formData.email) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/auth/status?email=${encodeURIComponent(formData.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'approved' && data.accessToken) {
              localStorage.setItem('voting_access_token', data.accessToken);
              setAuthState('APPROVED');
              clearInterval(intervalId);
            } else if (data.status === 'denied') {
              setAuthState('DENIED');
              clearInterval(intervalId);
            }
          }
        } catch (e) {
          console.error('Polling error', e);
        }
      }, 3000); // Check every 3 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [authState, formData.email]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert("Error sending email: " + (data.error || "Unknown error"));
        return;
      }
      
      setOtpToken(data.token);
      setAuthState('OTP');
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otpToken, otp })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Invalid OTP');
        return;
      }
      setAuthState('PENDING');
    } catch (err) {
      console.error(err);
      alert("Error verifying OTP");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);
    setHasSearched(true);
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (res.ok) {
        setSearchResults(data.results || []);
        if (data.results.length === 0) {
           setSearchError('No voter found with that CNIC or name.');
        }
      } else {
        setSearchError(data.error || 'Failed to search');
      }
    } catch (err) {
      setSearchError('Network error during search.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="main-container">
      {/* --- 1. REGISTRATION SCREEN --- */}
      {authState === 'REGISTER' && (
        <div className="auth-box">
          <div className="header">
            <h1>Create Account</h1>
            <p>Register to request access to the Voting List.</p>
          </div>
          <form className="auth-form" onSubmit={handleRegister}>
            <input type="text" placeholder="Full Name" required value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} />
            <input type="tel" placeholder="Phone Number (e.g., 03001234567)" required pattern="03[0-9]{9}" title="Enter an 11-digit Pakistani phone number starting with 03" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} />
            <button type="submit" className="search-btn">Send OTP to Email</button>
          </form>
        </div>
      )}

      {/* --- 2. OTP SCREEN --- */}
      {authState === 'OTP' && (
        <div className="auth-box">
          <div className="header">
            <h1>Email Verification</h1>
            <p>We sent a 6-digit OTP to {formData.email}</p>
          </div>
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <input type="text" placeholder="Enter OTP" required value={otp} onChange={(e)=>setOtp(e.target.value)} maxLength={6} style={{textAlign: 'center', letterSpacing: '5px', fontSize: '1.5rem'}} />
            <button type="submit" className="search-btn">Verify Email</button>
          </form>
        </div>
      )}

      {/* --- 3. PENDING ADMIN APPROVAL SCREEN --- */}
      {authState === 'PENDING' && (
        <div className="auth-box text-center">
          <div className="status-icon wait" style={{animation: 'spin 2s linear infinite'}}>⏳</div>
          <h2>Wait for Access</h2>
          <p>Your email has been verified correctly!</p>
          <p className="muted">An email has been sent to the Admin. Please wait on this screen. Once they approve your request, you will be automatically logged in.</p>
        </div>
      )}

      {/* --- ACCESS DENIED SCREEN --- */}
      {authState === 'DENIED' && (
        <div className="auth-box text-center">
          <div className="status-icon" style={{color: 'red'}}>❌</div>
          <h2 style={{color: 'red'}}>Access Denied</h2>
          <p>The Admin has rejected your request to access the Voting System.</p>
        </div>
      )}

      {/* --- 4. MAIN APP SCREEN --- */}
      {authState === 'APPROVED' && (
        <>
          <div className="header">
            <h1>Voting List Verification</h1>
            <p>Search for your vote details in the 2023 List.</p>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Enter CNIC (e.g., 38201-1140881-7) or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              required
            />
            <button type="submit" className="search-btn" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search Vote'}
            </button>
          </form>

          {hasSearched && (
            <div className="result-container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {searchError && (
                <div className="auth-box text-center" style={{ padding: '20px' }}>
                  <p style={{ color: 'red', margin: 0 }}>{searchError}</p>
                </div>
              )}
              
              {!searchError && searchResults.length > 0 && searchResults.map((result, idx) => (
                <div key={idx} className="result-card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#333' }}>Voter Found</h2>
                    <span className="badge success" style={{ background: '#e6f4ea', color: '#137333', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Page {result.page}</span>
                  </div>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">ID Card No (CNIC)</span>
                      <span className="value" style={{ color: '#818cf8' }}>{result.cnic}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Name (نام)</span>
                      {/* Using the text field as requested, even if it appears garbled. */}
                      <span className="value urdu">{result.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Family No (گھرانہ نمبر)</span>
                      <span className="value">{result.familyNo}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Vote No (سلسلہ نمبر)</span>
                      <span className="value">{result.voteNo}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Block Code (بلاک کوڈ)</span>
                      <span className="value">{result.blockCode}</span>
                    </div>
                  </div>

                  <div className="page-screenshot-section">
                    <h3>Original Voting List Page (Page {result.page})</h3>
                    <div className="image-wrapper">
                      <img 
                        src={`/pages/page_${result.page}.jpg`} 
                        alt={`Voting List Page ${result.page}`}
                        loading="lazy" 
                      />
                    </div>
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem' }}>
                      Cross-reference your details with the official document above.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
