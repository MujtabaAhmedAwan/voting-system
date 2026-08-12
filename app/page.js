'use client';
import { useState } from 'react';
import './globals.css';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Mock data to demonstrate the UI
  const mockResult = {
    name: "Ali Khan",
    idCardNo: "12345-6789012-3",
    fatherName: "Ahmed Khan",
    address: "House 123, Street 4, Islamabad",
    children: [
      { name: "Sara Khan", age: 22 },
      { name: "Usman Khan", age: 19 }
    ],
    listCode: "LST-9982",
    pageNumber: 42,
    pollingStation: "Pending Assignment (Future Election)"
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
  };

  return (
    <main className="main-container">
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
            <div className="info-item">
              <span className="label">Full Name</span>
              <span className="value">{mockResult.name}</span>
            </div>
            <div className="info-item">
              <span className="label">ID Card No</span>
              <span className="value">{mockResult.idCardNo}</span>
            </div>
            <div className="info-item">
              <span className="label">Father/Husband Name</span>
              <span className="value">{mockResult.fatherName}</span>
            </div>
            <div className="info-item">
              <span className="label">Address</span>
              <span className="value">{mockResult.address}</span>
            </div>
          </div>

          <hr className="divider" />

          <div className="list-details-grid">
            <div className="highlight-box">
              <h3>Voting List Code</h3>
              <p className="big-text">{mockResult.listCode}</p>
            </div>
            <div className="highlight-box">
              <h3>Page Number</h3>
              <p className="big-text">Pg. {mockResult.pageNumber}</p>
            </div>
            <div className="highlight-box primary">
              <h3>Polling Station</h3>
              <p className="medium-text">{mockResult.pollingStation}</p>
            </div>
          </div>

          <hr className="divider" />

          <div className="children-section">
            <h3>Registered Family Members (Children)</h3>
            <ul className="children-list">
              {mockResult.children.map((child, index) => (
                <li key={index}>
                  <strong>{child.name}</strong> (Age: {child.age})
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </main>
  );
}
