import React from 'react';
import { Users, UserCheck, Clock, DollarSign, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { MOCK_EMPLOYEES, MOCK_ATTENDANCE, MOCK_PAYROLL } from '../constants';
import { EmployeeStatus, Department } from '../types';
import { Employee } from '../types';

// Black & Blue Palette
const COLORS = ['#2563eb', '#1e40af', '#60a5fa', '#93c5fd', '#bfdbfe'];

// We need to access currentUser to check role, so we modify props
// NOTE: Ideally Dashboard should receive currentUser as prop from App.tsx. 
// Assuming Dashboard component signature update is acceptable or we use a context (but context is not set up here).
// For this quick fix, I will assume we can't easily change the prop signature in App.tsx without providing the file in full context.
// However, since App.tsx was provided in the prompt, I can update the component definition.

const Dashboard = () => {
  // HACK: To access currentUser without prop drilling in this specific XML response format if App.tsx isn't fully re-rendered, 
  // we usually need props. But let's check App.tsx content.
  // App.tsx renders <Dashboard /> without props.
  // I will check if I can get user info or if I should just use the passed props if I change App.tsx too.
  // Actually, I can't change the component signature without changing App.tsx.
  // Let's rely on localStorage or similar? No, that's bad practice.
  // The cleanest way is to just render all for now, OR better: Update App.tsx to pass currentUser to Dashboard.
  return <DashboardContent />;
};

const DashboardContent = () => {
  // Re-implementing logic with role check simulation or assume standard view
  // Since I cannot access currentUser here without props, and the user asked to change visibility "in employee", 
  // I will update App.tsx to pass the user to Dashboard, and then update Dashboard here.
  return null; 
};

// Redefining Dashboard correctly
interface DashboardProps {
  currentUser?: Employee; // Optional to not break if not passed immediately, but we will pass it
}

const DashboardComponent: React.FC<DashboardProps> = ({ currentUser }) => {
  // Calculated stats
  const totalEmployees = MOCK_EMPLOYEES.length;
  const activeEmployees = MOCK_EMPLOYEES.filter(e => e.status === EmployeeStatus.ACTIVE).length;
  const onLeave = MOCK_EMPLOYEES.filter(e => e.status === EmployeeStatus.ON_LEAVE).length;
  const totalPayroll = MOCK_PAYROLL.reduce((acc, curr) => acc + curr.netSalary, 0);

  const isHR = currentUser?.department === Department.HR;

  // Chart Data Preparation
  const deptData = MOCK_EMPLOYEES.reduce((acc: any[], curr) => {
    const existing = acc.find((i: any) => i.name === curr.department);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.department, value: 1 });
    }
    return acc;
  }, []);

  const attendanceStats = [
    { name: 'Present', value: MOCK_ATTENDANCE.filter(a => a.status === 'Present').length },
    { name: 'Late', value: MOCK_ATTENDANCE.filter(a => a.status === 'Late').length },
    { name: 'Absent', value: MOCK_ATTENDANCE.filter(a => a.status === 'Absent').length },
  ];

  const StatCard = ({ icon: Icon, title, value, prefix = '' }: any) => (
    <div className="bg-white p-6 border-l-4 border-blue-600 shadow-sm flex items-center space-x-4 transition-transform hover:translate-x-1 duration-200">
      <div className="p-3 bg-blue-50 rounded-full">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-black">{prefix}{value.toLocaleString()}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-black tracking-tight">Dashboard</h2>
        <span className="text-sm text-gray-500 font-mono">{new Date().toLocaleDateString()}</span>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isHR ? (
          <StatCard icon={Users} title="Total Employees" value={totalEmployees} />
        ) : (
          <StatCard icon={ShieldCheck} title="My Role" value={currentUser?.role || 'Employee'} prefix="" />
        )}
        
        <StatCard icon={UserCheck} title="Active Colleagues" value={activeEmployees} />
        <StatCard icon={Clock} title="On Leave" value={onLeave} />
        
        {isHR && (
          <StatCard icon={DollarSign} title="Total Payroll" value={totalPayroll} prefix="$" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Department Distribution */}
        <div className="bg-white p-8 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-black mb-6 uppercase tracking-wide border-l-4 border-blue-600 pl-3">Department Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#2563eb"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {deptData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '4px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="bg-white p-8 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-black mb-6 uppercase tracking-wide border-l-4 border-blue-600 pl-3">Daily Attendance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="name" tick={{ fill: '#666' }} axisLine={{ stroke: '#e5e5e5' }} />
                <YAxis allowDecimals={false} tick={{ fill: '#666' }} axisLine={{ stroke: '#e5e5e5' }} />
                <Tooltip 
                   cursor={{ fill: '#eff6ff' }}
                   contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '4px', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;