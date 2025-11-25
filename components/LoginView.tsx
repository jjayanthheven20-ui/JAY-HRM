import React, { useState } from 'react';
import { Smartphone, ArrowRight, ShieldCheck, UserCheck, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Employee, Department, EmployeeStatus } from '../types';

interface LoginViewProps {
  onLogin: (employee: Employee) => void;
  employees: Employee[];
}

const SUPER_ADMIN: Employee = {
  id: 'ADMIN001',
  firstName: 'Jayanth',
  lastName: 'Admin',
  email: 'jayanth@jayhrm.com',
  mobileNumber: '0000000000',
  role: 'System Administrator',
  department: Department.HR, // Grants Admin Access
  status: EmployeeStatus.ACTIVE,
  joinDate: '2020-01-01',
  avatarUrl: 'https://ui-avatars.com/api/?name=Jayanth+Admin&background=000&color=fff&bold=true',
  salary: 0
};

const LoginView: React.FC<LoginViewProps> = ({ onLogin, employees }) => {
  const [mode, setMode] = useState<'employee' | 'admin'>('employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Employee Login State
  const [mobileNumber, setMobileNumber] = useState('');

  // Admin Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (mode === 'employee') {
        // Search in the dynamic employees list passed from App
        const employee = employees.find(emp => emp.mobileNumber === mobileNumber);
        if (employee) {
          onLogin(employee);
        } else {
          setError('Mobile number not found. Please contact HR.');
          setLoading(false);
        }
      } else {
        // Admin Validation
        if (username === 'jayanth20' && password === 'jayanth@12') {
          onLogin(SUPER_ADMIN);
        } else {
          setError('Invalid Username or Password.');
          setLoading(false);
        }
      }
    }, 800);
  };

  const toggleMode = (newMode: 'employee' | 'admin') => {
    setMode(newMode);
    setError('');
    setMobileNumber('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 animate-fade-in">
        
        {/* Header */}
        <div className="bg-black p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
          <div className="bg-blue-600/20 w-32 h-32 rounded-full absolute -top-16 -right-16 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col items-center">
             <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-blue-900/50">
                <span className="text-white font-bold text-3xl">J</span>
             </div>
             <h1 className="text-3xl font-bold text-white tracking-tight">JAY HRM</h1>
             <p className="text-gray-400 text-sm mt-2">{mode === 'admin' ? 'Administrator Access' : 'Employee Portal Access'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => toggleMode('employee')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center ${
              mode === 'employee' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Employee
          </button>
          <button 
            onClick={() => toggleMode('admin')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center ${
              mode === 'admin' 
                ? 'text-black border-b-2 border-black bg-gray-50' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Admin
          </button>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {mode === 'employee' ? (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <div className="relative group">
                  <Smartphone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-mono text-lg tracking-wide"
                    placeholder="Enter registered mobile"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Use the mobile number registered with HR.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input 
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                      placeholder="Admin Username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium animate-fade-in flex items-center">
                 <ShieldCheck className="w-4 h-4 mr-2" />
                 {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3.5 px-4 flex items-center justify-center space-x-2 text-white font-bold rounded-sm shadow-lg transition-all transform hover:-translate-y-0.5 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : mode === 'admin' 
                    ? 'bg-black hover:bg-gray-800 shadow-gray-900/20' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{mode === 'admin' ? 'Login to Dashboard' : 'Secure Login'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 text-center">
           {mode === 'employee' ? (
             <p className="text-xs text-gray-500">
               Test Employee: <span className="font-mono font-bold text-gray-700">9876543210</span>
             </p>
           ) : (
             <p className="text-xs text-gray-500">
               Protected System. Unauthorized access is prohibited.
             </p>
           )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;