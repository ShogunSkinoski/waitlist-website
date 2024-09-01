import React, { useState, useEffect } from 'react';
import './EmailCapture.css';
import logo from '../logo.png';

const EmailCapture = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSignups, setTotalSignups] = useState(0);

  useEffect(() => {
    fetchTotalSignups();
  }, []);

  const fetchTotalSignups = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/total-signups');
      if (!response.ok) {
        throw new Error('Failed to fetch total signups');
      }
      const data = await response.json();
      setTotalSignups(data.totalSignups);
    } catch (error) {
      console.error('Error fetching total signups:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/submit-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit email');
      }
      
      const data = await response.json();
      setTotalSignups(data.totalSignups);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="email-capture">
      <div className="logo-container">
        <img src={logo} alt="Company Logo" className="logo" />
      </div>
      <p className="coming-soon">Coming this summer</p>
      <p className="total-signups">Total Beta Signups: {totalSignups}</p>
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className={isLoading ? 'loading' : ''}>
          <div className="input-container">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
            <span className="input-focus"></span>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'JOIN CLOSED BETA'}
          </button>
        </form>
      ) : (
        <div className="success-message">
          <p>Thanks for joining! We'll be in touch soon.</p>
        </div>
      )}
    </div>
  );
};

export default EmailCapture;