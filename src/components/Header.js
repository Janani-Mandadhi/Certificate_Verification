// Example: components/Header.js
import React from 'react';

function Header({ user, onLogout }) {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1>Certificate DApp</h1>
        {user && (
          <button onClick={onLogout} className="bg-red-500 px-4 py-2 rounded">
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;