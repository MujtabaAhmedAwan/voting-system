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

  const mockResult = {
    name: "Ali Khan",
    idCardNo: "12345-6789012-3",
    fatherName: "Ahmed Khan",
    address: "House 123, Street 4, Islamabad",
    children: [{ name: "Sara Khan", age: 22 }, { name: "Usman Khan", age: 19 }],
    listCode: "LST-9982",
    pageNumber: 42,
    pollingStation: "Pending Assignment (Future Election)"
  };

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

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
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
          <p className="muted">An email has been sent to the Admin with your details. Once they approve your request from their email, you will gain access automatically.</p>
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
            <p>Search for your vote details, assigned list, and future polling station.</p>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Enter ID Card No, Name, or Phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              required
            />
            <button type="submit" className="search-btn">Search Vote</button>
          </form>

          {hasSearched && (
            <div className="result-card">
              <div className="result-header">
                <h2>Voter Information Found</h2>
                <span className="badge success">Verified</span>
              </div>
              
              <div className="info-grid">
                <div className="info-item"><span className="label">Full Name</span><span className="value">{mockResult.name}</span></div>
                <div className="info-item"><span className="label">ID Card No</span><span className="value">{mockResult.idCardNo}</span></div>
                <div className="info-item"><span className="label">Father/Husband Name</span><span className="value">{mockResult.fatherName}</span></div>
                <div className="info-item"><span className="label">Address</span><span className="value">{mockResult.address}</span></div>
              </div>

              <hr className="divider" />

              <div className="list-details-grid">
                <div className="highlight-box"><h3>Voting List Code</h3><p className="big-text">{mockResult.listCode}</p></div>
                <div className="highlight-box"><h3>Page Number</h3><p className="big-text">Pg. {mockResult.pageNumber}</p></div>
                <div className="highlight-box primary"><h3>Polling Station</h3><p className="medium-text">{mockResult.pollingStation}</p></div>
              </div>

              <hr className="divider" />

              <div className="children-section">
                <h3>Registered Family Members (Children)</h3>
                <ul className="children-list">
                  {mockResult.children.map((child, index) => (
                    <li key={index}><strong>{child.name}</strong> (Age: {child.age})</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
