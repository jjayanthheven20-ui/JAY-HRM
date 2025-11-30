import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import AttendanceView from './components/AttendanceView';
import LeaveView from './components/LeaveView';
import PayrollView from './components/PayrollView';
import ChatView from './components/ChatView';
import LoginView from './components/LoginView';
import { ViewState, Employee, Department, PayrollRecord, AttendanceRecord, LeaveRequest } from './types';
import { Bell, Menu } from 'lucide-react';
import { MOCK_EMPLOYEES, MOCK_PAYROLL, MOCK_ATTENDANCE, MOCK_LEAVES } from './constants';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Lifted state for data persistence across views/logins
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(MOCK_PAYROLL);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVES);

  const handleLogin = (employee: Employee) => {
    setCurrentUser(employee);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    setIsSidebarOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser!} />;
      case 'employees':
        // Double check safety if they somehow got here
        if (currentUser?.department !== Department.HR) return <Dashboard currentUser={currentUser!} />;
        return <EmployeeList employees={employees} onUpdateEmployees={setEmployees} />;
      case 'attendance':
        return (
          <AttendanceView 
            currentUser={currentUser!} 
            attendanceRecords={attendanceRecords}
            onUpdateAttendance={setAttendanceRecords}
          />
        );
      case 'leave':
        return (
          <LeaveView 
            currentUser={currentUser!} 
            leaveRequests={leaveRequests}
            onUpdateLeaves={setLeaveRequests}
          />
        );
      case 'payroll':
         // Double check safety
        if (currentUser?.department !== Department.HR) return <Dashboard currentUser={currentUser!} />;
        return (
          <PayrollView 
            currentUser={currentUser!} 
            employees={employees}
            payrollRecords={payrollRecords}
            onUpdatePayroll={setPayrollRecords}
          />
        );
      case 'chat':
        return <ChatView />;
      default:
        return <Dashboard currentUser={currentUser!} />;
    }
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} employees={employees} />;
  }

  const isHR = currentUser.department === Department.HR;

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-900">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onLogout={handleLogout}
        currentUser={currentUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Main Content - with responsive margin */}
      <main className="flex-1 md:ml-64 w-full">
        <div className="p-3 md:p-8">
          {/* Header Area */}
          <header className="flex justify-between items-center mb-4 md:mb-8 border-b border-gray-100 pb-4 md:pb-6">
            <div className="flex items-center">
              {/* Mobile Hamburger Button */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="mr-3 md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md active:bg-gray-200"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div>
                <h1 className="text-lg md:text-xl font-medium text-gray-400 leading-tight">
                  Welcome back, <span className="text-black font-bold block md:inline">{currentUser.firstName}</span>
                </h1>
                <div className="flex items-center mt-1">
                  <p className="text-xs md:text-sm text-gray-400 hidden md:block">HR Operations Dashboard</p>
                  {isHR && (
                    <span className="md:ml-2 px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 md:space-x-6">
              <div className="relative cursor-pointer group">
                <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Bell className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                </div>
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border border-white"></span>
              </div>
              
              <div className="flex items-center space-x-3 pl-3 md:pl-6 md:border-l border-gray-200">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-black">{currentUser.firstName} {currentUser.lastName}</p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                 </div>
                 <div className="h-9 w-9 md:h-10 md:w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm cursor-pointer overflow-hidden">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}</span>
                    )}
                 </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="animate-fade-in pb-8 md:pb-0">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;