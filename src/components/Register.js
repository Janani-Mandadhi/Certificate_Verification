// src/components/SimpleRegister.js
import React, { useState } from 'react';

const SimpleRegister = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }

    // Later: replace this with actual blockchain registration logic
    onRegister({ name, email, role });
  };

  return (
    <div style={{ maxWidth: 350, margin: '50px auto' }}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ display: 'block', marginBottom: 10, width: '100%' }}
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', marginBottom: 10, width: '100%' }}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ display: 'block', marginBottom: 10, width: '100%' }}
        >
          <option value="user">Student/User</option>
          <option value="issuer">Certificate Issuer</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', marginBottom: 10, width: '100%' }}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ display: 'block', marginBottom: 10, width: '100%' }}
        />

        <button type="submit" style={{ width: '100%' }}>
          Register
        </button>
      </form>
    </div>
  );
};

export default SimpleRegister;
