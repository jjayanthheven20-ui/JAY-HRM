import React from 'react';
import { LayoutDashboard, Users, CalendarCheck, CalendarDays, DollarSign, LogOut, MessageSquare, X } from 'lucide-react';
import { ViewState, Employee, Department } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  currentUser: Employee;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, currentUser, isOpen, onClose }) => {
  const isHR = currentUser.department === Department.HR;

  // Filter menu items based on role
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // Only HR sees Employee List
    ...(isHR ? [{ id: 'employees', label: 'Employees', icon: Users }] : []),
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'leave', label: 'Leave Mgmt', icon: CalendarDays },
    // Only HR sees Payroll module (as requested)
    ...(isHR ? [{ id: 'payroll', label: 'Payroll', icon: DollarSign }] : []),
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
  ];

  const handleNavigate = (view: ViewState) => {
    onNavigate(view);
    onClose(); // Close sidebar on mobile when item clicked
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-black text-white border-r border-gray-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <span className="text-xl font-bold tracking-tight">JAY HRM</span>
          </div>
          {/* Close button only visible on mobile */}
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id as ViewState)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-500 group-hover:text-white'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800 bg-black safe-area-bottom">
          {/* User Profile Snippet */}
          <div className="flex items-center space-x-3 px-3 mb-4 pb-4 border-b border-neutral-800">
              <div className="h-9 w-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white/10 shrink-0">
                  {currentUser.avatarUrl ? (
                     <img src={currentUser.avatarUrl} alt="Me" className="w-full h-full rounded-full object-cover"/>
                  ) : (
                     <span>{currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}</span>
                  )}
              </div>
              <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{currentUser.firstName} {currentUser.lastName}</p>
                  <p className="text-[10px] text-neutral-500 truncate uppercase tracking-wider">{currentUser.role}</p>
              </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
          <div className="mt-4 px-4 text-[10px] text-neutral-600 text-center font-mono">
            © www.jayhrm.com
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;