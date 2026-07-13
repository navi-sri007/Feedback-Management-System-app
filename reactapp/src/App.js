import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FeedbackForm from './components/FeedbackForm';
import UserFeedbackList from './components/UserFeedbackList';
import AdminFeedbackList from './components/AdminFeedbackList';
import './App.css';

function Home() {
  return (
    <div className="form-container">
      <h2>Feedback Management System</h2>
      <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
        <li><Link to="/submit">Submit Feedback</Link></li>
        <li><Link to="/user-feedback">View My Feedback</Link></li>
        <li><Link to="/admin">Admin Feedback Management</Link></li>
      </ul>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', background: 'var(--bg-gray-100)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<FeedbackForm />} />
          <Route path="/user-feedback" element={<UserFeedbackList />} />
          <Route path="/admin" element={<AdminFeedbackList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
