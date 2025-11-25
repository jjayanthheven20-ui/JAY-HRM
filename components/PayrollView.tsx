import React, { useState } from 'react';
import { DollarSign, Download, CreditCard, TrendingUp, Calendar, Wallet, ArrowUpRight, ArrowDownRight, Plus, X, Calculator, Lock } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Employee, PayrollRecord, Department } from '../types';

interface PayrollViewProps {
  currentUser: Employee;
  employees: Employee[];
  payrollRecords: PayrollRecord[];
  onUpdatePayroll: (records: PayrollRecord[]) => void;
}

const PayrollView: React.FC<PayrollViewProps> = ({ currentUser, employees, payrollRecords, onUpdatePayroll }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    basicSalary: 0,
    bonuses: 0,
    deductions: 0
  });

  const isHR = currentUser.department === Department.HR;

  // Filter records: HR sees all, Employees see only theirs
  const visibleRecords = isHR 
    ? payrollRecords 
    : payrollRecords.filter(r => r.employeeId === currentUser.id);

  // Mock chart data based on visible records
  const chartData = visibleRecords.reduce((acc: any[], curr) => {
    const key = `${curr.month.substring(0, 3)}`;
    const existing = acc.find(item => item.name === key);
    if (existing) {
      existing.amount += curr.netSalary;
    } else {
      acc.push({ name: key, amount: curr.netSalary });
    }
    return acc;
  }, []).slice(0, 6); // Just take first 6 for demo

  // Calculate stats
  const totalDisbursed = visibleRecords.reduce((acc, curr) => acc + curr.netSalary, 0);
  const totalBonuses = visibleRecords.reduce((acc, curr) => acc + curr.bonuses, 0);
  const totalDeductions = visibleRecords.reduce((acc, curr) => acc + curr.deductions, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'employeeId' || name === 'month' ? value : Number(value)
    }));

    // Auto-fill basic salary if employee is selected
    if (name === 'employeeId') {
      const selectedEmp = employees.find(emp => emp.id === value);
      if (selectedEmp) {
        setFormData(prev => ({
           ...prev,
           employeeId: value,
           basicSalary: Math.round(selectedEmp.salary / 12) // Approx monthly
        }));
      }
    }
  };

  const calculateNet = () => {
    return formData.basicSalary + formData.bonuses - formData.deductions;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: PayrollRecord = {
      id: `PR${Date.now()}`,
      employeeId: formData.employeeId,
      month: formData.month,
      year: formData.year,
      basicSalary: formData.basicSalary,
      bonuses: formData.bonuses,
      deductions: formData.deductions,
      netSalary: calculateNet(),
      status: 'Paid' // Defaulting to Paid for simplicity
    };

    onUpdatePayroll([newRecord, ...payrollRecords]);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      employeeId: '',
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      basicSalary: 0,
      bonuses: 0,
      deductions: 0
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-black tracking-tight">Payroll</h2>
          <p className="text-gray-500 text-sm mt-1">Salary processing, payslips, and financial insights.</p>
        </div>
        
        {isHR && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 flex items-center space-x-2 transition-colors shadow-lg shadow-blue-900/20 rounded-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Process Payroll</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Card */}
        <div className="bg-black text-white p-8 shadow-xl rounded-sm relative overflow-hidden group">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Wallet className="w-40 h-40" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Disbursed</p>
                <h3 className="text-4xl font-bold mt-2 text-white">${totalDisbursed.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-white/10 rounded-full backdrop-blur-md">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-6 flex items-center space-x-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="font-mono">Current Financial Year</span>
            </div>
          </div>
        </div>
        
        {/* Avg Bonus */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-sm flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4">
             <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Bonuses</p>
               <h3 className="text-3xl font-bold text-black mt-1">${totalBonuses.toLocaleString()}</h3>
             </div>
             <div className="p-2 bg-green-50 rounded-full text-green-600">
               <ArrowUpRight className="w-5 h-5" />
             </div>
           </div>
           <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
             <div className="h-full bg-green-500 w-[65%] rounded-full"></div>
           </div>
        </div>

        {/* Deductions */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-sm flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4">
             <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Deductions</p>
               <h3 className="text-3xl font-bold text-black mt-1">${totalDeductions.toLocaleString()}</h3>
             </div>
             <div className="p-2 bg-red-50 rounded-full text-red-500">
               <ArrowDownRight className="w-5 h-5" />
             </div>
           </div>
           <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
             <div className="h-full bg-red-500 w-[25%] rounded-full"></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-1 bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
             <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-6 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                Trends
             </h3>
             <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: '#eff6ff'}}
                            contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px'}}
                        />
                        <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </div>

        {/* Table Section */}
        <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm overflow-hidden rounded-sm flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Payroll History</h3>
                {!isHR && <span className="text-xs text-gray-500 flex items-center"><Lock className="w-3 h-3 mr-1"/> Personal Records Only</span>}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-200">
                    <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Basic</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Net Pay</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {visibleRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">No payroll records found.</td>
                      </tr>
                    ) : (
                      visibleRecords.map((record) => {
                      const employee = employees.find(e => e.id === record.employeeId);
                      return (
                          <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                  {employee ? (
                                    <img src={employee.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">?</div>
                                  )}
                                  <div>
                                      <p className="text-sm font-bold text-black">{employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}</p>
                                      <p className="text-xs text-gray-500 font-mono">{employee?.role}</p>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.month} {record.year}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 text-right font-mono">${record.basicSalary.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-bold text-black text-right font-mono text-base">${record.netSalary.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                              record.status === 'Paid' 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                  : 'bg-orange-50 text-orange-600 border-orange-200'
                              }`}>
                              {record.status}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                              <button className="text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 p-2 rounded-sm hover:bg-blue-50">
                              <Download className="w-4 h-4" />
                              </button>
                          </td>
                          </tr>
                      );
                      })
                    )}
                </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Add Payroll Modal (HR Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
             <div className="bg-black p-6 flex justify-between items-center text-white">
                <div>
                   <h3 className="text-xl font-bold">Process Payroll</h3>
                   <p className="text-gray-400 text-sm">Add a new salary record</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white bg-white/10 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
             </div>

             <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Employee <span className="text-red-500">*</span></label>
                  <select 
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 border p-3 text-sm rounded-sm focus:ring-1 focus:ring-blue-600 bg-gray-50"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.role})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Month</label>
                    <select 
                      name="month"
                      value={formData.month}
                      onChange={handleInputChange}
                      className="w-full border-gray-300 border p-3 text-sm rounded-sm focus:ring-1 focus:ring-blue-600 bg-gray-50"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Year</label>
                    <input 
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full border-gray-300 border p-3 text-sm rounded-sm focus:ring-1 focus:ring-blue-600 bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t border-gray-100 pt-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Basic Salary</label>
                     <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400 font-mono">$</span>
                        <input 
                          type="number"
                          name="basicSalary"
                          value={formData.basicSalary}
                          onChange={handleInputChange}
                          className="w-full pl-8 border-gray-300 border p-3 text-sm rounded-sm focus:ring-1 focus:ring-blue-600 bg-gray-50 font-mono"
                        />
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Bonuses</label>
                       <div className="relative">
                          <span className="absolute left-3 top-3 text-green-600 font-mono">+</span>
                          <input 
                            type="number"
                            name="bonuses"
                            value={formData.bonuses}
                            onChange={handleInputChange}
                            className="w-full pl-8 border-green-200 border p-3 text-sm rounded-sm focus:ring-1 focus:ring-green-600 bg-green-50 font-mono text-green-800"
                          />
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Deductions</label>
                       <div className="relative">
                          <span className="absolute left-3 top-3 text-red-500 font-mono">-</span>
                          <input 
                            type="number"
                            name="deductions"
                            value={formData.deductions}
                            onChange={handleInputChange}
                            className="w-full pl-8 border-red-200 border p-3 text-sm rounded-sm focus:ring-1 focus:ring-red-500 bg-red-50 font-mono text-red-800"
                          />
                       </div>
                     </div>
                   </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-sm flex justify-between items-center border border-blue-100">
                   <div className="flex items-center text-blue-800">
                     <Calculator className="w-5 h-5 mr-2" />
                     <span className="font-bold text-sm uppercase">Net Salary</span>
                   </div>
                   <span className="text-xl font-bold text-blue-900 font-mono">${calculateNet().toLocaleString()}</span>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-3 uppercase tracking-wider text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/10 rounded-sm"
                >
                  Confirm & Process
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollView;