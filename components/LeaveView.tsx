import React, { useState } from 'react';
import { CalendarDays, Send, Sparkles, Clock, CheckCircle2, XCircle, AlertCircle, ThumbsUp, ThumbsDown, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { MOCK_EMPLOYEES } from '../constants';
import { generateProfessionalReason } from '../services/geminiService';
import { LeaveType, LeaveStatus, LeaveRequest, Employee, Department } from '../types';

interface LeaveViewProps {
  currentUser: Employee;
  leaveRequests: LeaveRequest[];
  onUpdateLeaves: (requests: LeaveRequest[]) => void;
}

const LeaveView: React.FC<LeaveViewProps> = ({ currentUser, leaveRequests, onUpdateLeaves }) => {
  // Form State
  const [formData, setFormData] = useState({
    type: LeaveType.CASUAL,
    startDate: '',
    endDate: '',
    reason: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHR = currentUser.department === Department.HR;

  const handleGenerateReason = async () => {
    if (!formData.reason.trim()) return;
    setIsGenerating(true);
    const refinedReason = await generateProfessionalReason(formData.reason, formData.type);
    setFormData(prev => ({ ...prev, reason: refinedReason }));
    setIsGenerating(false);
  };

  const handleSubmit = () => {
    // Basic Validation
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setError("Please fill in all fields.");
      return;
    }
    
    setError(null);

    // Create New Request
    const newRequest: LeaveRequest = {
      id: `LR${Date.now()}`,
      employeeId: currentUser.id,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: LeaveStatus.PENDING
    };

    // Update State (Add new request to top of list)
    onUpdateLeaves([newRequest, ...leaveRequests]);

    // Reset Form
    setFormData({
      type: LeaveType.CASUAL,
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const handleApprove = (id: string) => {
    onUpdateLeaves(leaveRequests.map(leave => 
        leave.id === id ? { ...leave, status: LeaveStatus.APPROVED } : leave
      )
    );
  };

  const handleReject = (id: string) => {
    if (window.confirm('Are you sure you want to reject this leave request?')) {
      onUpdateLeaves(leaveRequests.map(leave => 
          leave.id === id ? { ...leave, status: LeaveStatus.REJECTED } : leave
        )
      );
    }
  };

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED: return 'bg-green-100 text-green-700 border-green-200';
      case LeaveStatus.REJECTED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Application Form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-4 md:p-6 border border-gray-200 shadow-sm rounded-sm">
          <h3 className="text-lg font-bold text-black mb-6 flex items-center uppercase tracking-wide border-b border-gray-100 pb-3">
            <Send className="w-5 h-5 mr-2 text-blue-600" />
            New Request
          </h3>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm flex items-center mb-4">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Leave Type</label>
              <select 
                className="w-full border-gray-300 shadow-sm border p-3 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 rounded-sm"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as LeaveType})}
              >
                {Object.values(LeaveType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
                <input 
                  type="date" 
                  className="w-full border-gray-300 shadow-sm border p-3 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 rounded-sm"
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Date</label>
                <input 
                  type="date" 
                  className="w-full border-gray-300 shadow-sm border p-3 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 rounded-sm"
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reason</label>
              <div className="relative">
                <textarea 
                  rows={4} 
                  className="w-full border-gray-300 shadow-sm border p-3 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 rounded-sm"
                  placeholder="Reason for leave..."
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                />
                <button 
                  onClick={handleGenerateReason}
                  disabled={isGenerating || !formData.reason}
                  className="absolute bottom-2 right-2 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs px-3 py-1.5 flex items-center disabled:opacity-50 transition-all font-bold rounded-full"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {isGenerating ? 'Drafting...' : 'AI Rephrase'}
                </button>
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3.5 font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/10 uppercase tracking-wider text-sm rounded-sm active:scale-95 duration-200"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: History */}
      <div className="lg:col-span-2">
        
        {/* Mobile View: Card List */}
        <div className="md:hidden space-y-4">
          <h3 className="text-lg font-bold text-black flex items-center uppercase tracking-wide px-1">
             <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
             My Requests
          </h3>
          {leaveRequests.map((leave) => {
             const employee = MOCK_EMPLOYEES.find(e => e.id === leave.employeeId) || 
                              (currentUser.id === leave.employeeId ? currentUser : undefined);
             return (
              <div key={leave.id} className="bg-white p-4 border border-gray-200 shadow-sm rounded-lg flex flex-col gap-3">
                <div className="flex justify-between items-start">
                   <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">{leave.type}</span>
                      <h4 className="font-bold text-black text-sm">{employee?.firstName} {employee?.lastName}</h4>
                   </div>
                   <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(leave.status)}`}>
                     {leave.status}
                   </span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md text-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-500 text-xs font-bold">From</span>
                    <span className="font-mono font-medium">{leave.startDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs font-bold">To</span>
                    <span className="font-mono font-medium">{leave.endDate}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 italic border-l-2 border-gray-200 pl-2">
                  "{leave.reason}"
                </p>

                {isHR && leave.status === LeaveStatus.PENDING && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100 mt-1">
                    <button 
                      onClick={() => handleApprove(leave.id)}
                      className="flex-1 py-2 bg-black text-white text-xs font-bold uppercase rounded-sm flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" /> Approve
                    </button>
                    <button 
                      onClick={() => handleReject(leave.id)}
                      className="flex-1 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold uppercase rounded-sm flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <ThumbsDown className="w-3 h-3 mr-1" /> Reject
                    </button>
                  </div>
                )}
              </div>
             );
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block bg-white border border-gray-200 shadow-sm overflow-hidden h-full rounded-sm">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
             <h3 className="text-lg font-bold text-black flex items-center uppercase tracking-wide">
              <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
              Request History
            </h3>
            {!isHR && <span className="text-xs text-gray-500 flex items-center"><Lock className="w-3 h-3 mr-1"/> Admin View Restricted</span>}
          </div>
          <table className="w-full text-left">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Reason Summary</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                {isHR && <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaveRequests.map((leave) => {
                const employee = MOCK_EMPLOYEES.find(e => e.id === leave.employeeId) || 
                                 (currentUser.id === leave.employeeId ? currentUser : undefined);
                return (
                  <tr key={leave.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-bold mr-3 rounded-full">
                           {employee?.firstName.charAt(0)}{employee?.lastName.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-black">{employee?.firstName} {employee?.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{leave.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {leave.startDate} <span className="text-gray-400">/</span> {leave.endDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate italic" title={leave.reason}>
                      "{leave.reason}"
                    </td>
                    <td className="px-6 py-4">
                      {leave.status === LeaveStatus.APPROVED && <span className="inline-flex items-center text-xs text-green-700 bg-green-100 font-bold px-2 py-1 uppercase tracking-wider rounded-full"><CheckCircle2 className="w-3 h-3 mr-1"/> Approved</span>}
                      {leave.status === LeaveStatus.PENDING && <span className="inline-flex items-center text-xs text-orange-700 bg-orange-100 font-bold px-2 py-1 uppercase tracking-wider rounded-full"><Clock className="w-3 h-3 mr-1"/> Pending</span>}
                      {leave.status === LeaveStatus.REJECTED && <span className="inline-flex items-center text-xs text-red-700 bg-red-100 font-bold px-2 py-1 uppercase tracking-wider rounded-full"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>}
                    </td>
                    {isHR && (
                      <td className="px-6 py-4 text-right">
                        {leave.status === LeaveStatus.PENDING && (
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleApprove(leave.id)}
                              className="text-gray-400 hover:text-green-600 transition-colors p-1"
                              title="Approve Request"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleReject(leave.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="Reject Request"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveView;