import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { MartianWallet } from '@martianwallet/aptos-wallet-adapter';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import IssueCertificate from './components/IssueCertificate';
import VerifyCertificate from './components/VerifyCertificate';
import RevokeCertificate from './components/RevokeCertificate';
import Login from './components/Login';
import Register from './components/Register';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const wallets = [new PetraWallet(), new MartianWallet()];
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
        
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);
  
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header user={user} onLogout={logout} />
                    
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes - accessible without login */}
              <Route path="/verify" element={<VerifyCertificate />} />
              
              {/* Auth routes - only show when not logged in */}
              <Route path="/login" element={
                !user ? <Login onLogin={login} /> : <Navigate to="/dashboard" />
              } />
              <Route path="/register" element={
                !user ? <Register onRegister={login} /> : <Navigate to="/dashboard" />
              } />
              
              {/* Protected routes - require login */}
              <Route path="/dashboard" element={
                user ? <Dashboard user={user} /> : <Navigate to="/login" />
              } />
              <Route path="/issue" element={
                user && ['admin', 'issuer'].includes(user.role) ? 
                <IssueCertificate user={user} /> : 
                <Navigate to="/login" />
              } />
              <Route path="/revoke" element={
                user && ['admin', 'issuer'].includes(user.role) ? 
                <RevokeCertificate user={user} /> : 
                <Navigate to="/login" />
              } />
              
              {/* Default route - redirect based on login status */}
              <Route path="/" element={
                <Navigate to={user ? "/dashboard" : "/login"} />
              } />
            </Routes>
          </main>
          
          <ToastContainer position="top-right" autoClose={5000} />
        </div>
      </Router>
    </AptosWalletAdapterProvider>
  );
}

export default App;