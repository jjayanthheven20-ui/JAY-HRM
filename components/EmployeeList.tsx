import React, { useState } from 'react';
import { Search, Plus, Filter, X, Trash2, Eye, DollarSign, Mail, Briefcase, Calendar, User, Smartphone, Save, ChevronRight } from 'lucide-react';
import { EmployeeStatus, Department, Employee } from '../types';

interface EmployeeListProps {
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onUpdateEmployees }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    role: '',
    salary: '12000',
    department: Department.ENGINEERING,
    status: EmployeeStatus.ACTIVE,
    joinDate: new Date().toISOString().split('T')[0]
  });

  const getStatusBadge = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE: 
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case EmployeeStatus.INACTIVE: 
        return 'bg-white text-gray-500 border border-gray-300';
      case EmployeeStatus.ON_LEAVE: 
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: 
        return 'bg-white text-black border border-black';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmployee: Employee = {
      id: `EMP${Math.floor(Math.random() * 10000)}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      role: formData.role,
      department: formData.department,
      status: formData.status,
      joinDate: formData.joinDate,
      avatarUrl: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random`,
      salary: Number(formData.salary)
    };

    onUpdateEmployees([...employees, newEmployee]);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      role: '',
      salary: '12000',
      department: Department.ENGINEERING,
      status: EmployeeStatus.ACTIVE,
      joinDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      onUpdateEmployees(employees.filter(emp => emp.id !== id));
      if (viewModalOpen) setViewModalOpen(false);
    }
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewModalOpen(true);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-200 pb-4 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight">Employees</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your workforce.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 flex items-center justify-center space-x-2 transition-colors shadow-sm rounded-sm w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Add Employee</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 bg-gray-50 p-4 border border-gray-200 rounded-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or role..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-white border border-gray-300 px-4 py-2.5 flex items-center justify-center space-x-2 text-gray-700 hover:bg-gray-50 rounded-sm">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter</span>
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredEmployees.map((employee) => (
           <div key={employee.id} onClick={() => handleView(employee)} className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm active:scale-[0.99] transition-transform flex items-center justify-between">
              <div className="flex items-center space-x-4">
                 <img src={employee.avatarUrl} alt="" className="w-12 h-12 rounded-full bg-gray-200 object-cover" />
                 <div>
                    <h3 className="font-bold text-gray-900">{employee.firstName} {employee.lastName}</h3>
                    <p className="text-sm text-gray-500">{employee.role}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${getStatusBadge(employee.status)}`}>
                        {employee.status}
                    </span>
                 </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
           </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200 shadow-sm overflow-hidden rounded-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Salary</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <img src={employee.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                    <div>
                      <p className="text-sm font-bold text-black">{employee.firstName} {employee.lastName}</p>
                      <p className="text-xs text-gray-500">{employee.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 font-medium">{employee.role}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-sm">{employee.department}</span>
                </td>
                <td className="px-6 py-4 text-sm text-black font-bold text-right font-mono">
                  ${employee.salary?.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${getStatusBadge(employee.status)}`}>
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleView(employee)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(employee.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Employee"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-8 py-6 bg-black text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Add New Employee</h3>
                <p className="text-gray-400 text-sm mt-1">Enter the details for the new team member.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              {/* ... (Existing Form Content - kept simplified for brevity in diff but assuming content logic is same) ... */}
              {/* Personal Info Section */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-gray-100 pb-2">Personal Information</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                          required 
                          name="firstName" 
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full border-gray-300 border pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-md transition-shadow bg-gray-50 focus:bg-white"
                          placeholder="e.g. John"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                      <input 
                        required 
                        name="lastName" 
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-md transition-shadow bg-gray-50 focus:bg-white"
                        placeholder="e.g. Doe"
                      />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                        <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                            required 
                            type="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full border-gray-300 border pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-md transition-shadow bg-gray-50 focus:bg-white"
                            placeholder="john.doe@company.com"
                        />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number <span className="text-red-500">*</span></label>
                        <div className="relative">
                        <Smartphone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                            required 
                            type="tel" 
                            name="mobileNumber" 
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                            className="w-full border-gray-300 border pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-md transition-shadow bg-gray-50 focus:bg-white font-mono"
                            placeholder="e.g. 9876543210"
                        />
                        </div>
                    </div>
                 </div>
              </div>

              {/* Role Info Section */}
              <div className="space-y-4 pt-4">
                 <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-gray-100 pb-2">Role & Compensation</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <select 
                          name="department" 
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full border-gray-300 border pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-md transition-shadow bg-gray-50 focus:bg-white appearance-none"
                        >
                          {Object.values(Department).map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Job Title <span className="text-red-500">*</span></label>
                       <input 
                          required 
                          name="role" 
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full border-gray-300 border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-md transition-shadow bg-gray-50 focus:bg-white"
                          placeholder="e.g. Senior Developer" 
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Basic Salary (USD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                          required 
                          type="number" 
                          name="salary" 
                          value={formData.salary}
                          onChange={handleInputChange}
                          className="w-full border-gray-300 border pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-md transition-shadow bg-gray-50 focus:bg-white font-mono"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Joining Date</label>
                       <div className="relative">
                         <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                         <input 
                            type="date" 
                            name="joinDate" 
                            value={formData.joinDate}
                            onChange={handleInputChange}
                            className="w-full border-gray-300 border pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-md transition-shadow bg-gray-50 focus:bg-white"
                          />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-100 flex justify-end space-x-3">
                 <button 
                   type="button" 
                   onClick={() => setIsModalOpen(false)}
                   className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-sm hover:bg-gray-50 transition-colors uppercase tracking-wider text-xs"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   className="px-6 py-3 bg-blue-600 text-white font-bold rounded-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 uppercase tracking-wider text-xs flex items-center"
                 >
                   <Save className="w-4 h-4 mr-2" />
                   Save Employee
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
              <div className="bg-black p-6 flex items-start justify-between shrink-0">
                 <div className="flex items-center space-x-4">
                    <img src={selectedEmployee.avatarUrl} alt="" className="w-16 h-16 rounded-full border-4 border-white object-cover" />
                    <div>
                       <h3 className="text-xl font-bold text-white">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                       <p className="text-blue-400 font-medium">{selectedEmployee.role}</p>
                    </div>
                 </div>
                 <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-sm">
                       <p className="text-xs text-gray-500 uppercase font-bold">Department</p>
                       <p className="font-medium text-black mt-1">{selectedEmployee.department}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-sm">
                       <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                       <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold uppercase rounded-full ${getStatusBadge(selectedEmployee.status)}`}>
                          {selectedEmployee.status}
                       </span>
                    </div>
                 </div>
                 
                 <div className="space-y-3 pt-2">
                    <div className="flex items-center text-sm text-gray-700 border-b border-gray-100 pb-2">
                       <Mail className="w-4 h-4 mr-3 text-blue-600" />
                       <span className="flex-1 break-all">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 border-b border-gray-100 pb-2">
                       <Smartphone className="w-4 h-4 mr-3 text-blue-600" />
                       <span className="flex-1 font-mono">{selectedEmployee.mobileNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 border-b border-gray-100 pb-2">
                       <Calendar className="w-4 h-4 mr-3 text-blue-600" />
                       <span className="flex-1">Joined: {selectedEmployee.joinDate}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 pb-2">
                       <DollarSign className="w-4 h-4 mr-3 text-blue-600" />
                       <span className="flex-1 font-mono font-bold">${selectedEmployee.salary?.toLocaleString()} / yr</span>
                    </div>
                 </div>

                 <div className="pt-4 flex flex-col md:flex-row justify-end gap-3">
                    <button 
                      onClick={() => handleDelete(selectedEmployee.id)}
                      className="px-4 py-3 md:py-2 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-red-100 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Employee
                    </button>
                    <button 
                      onClick={() => setViewModalOpen(false)}
                      className="px-4 py-3 md:py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-gray-800 transition-colors"
                    >
                      Close Details
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;