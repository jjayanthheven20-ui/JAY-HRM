import React, { useState } from 'react';
import { CalendarDays, Send, Sparkles, Clock, CheckCircle2, XCircle, AlertCircle, ThumbsUp, ThumbsDown, Lock } from 'lucide-react';
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

  return (
    <div className="p-6 space-y-6 animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Application Form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-sm">
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
                className="w-full border-gray-300 shadow-sm border p-2.5 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 rounded-sm"
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
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start</label>
                <input 
                  type="date" 
                  className="w-full border-gray-300 shadow-sm border p-2.5 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 rounded-sm"
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End</label>
                <input 
                  type="date" 
                  className="w-full border-gray-300 shadow-sm border p-2.5 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 rounded-sm"
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reason</label>
              <div className="relative">
                <textarea 
                  rows={5} 
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
              className="w-full bg-blue-600 text-white py-3 font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/10 uppercase tracking-wider text-sm rounded-sm"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: History */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden h-full rounded-sm">
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
                // Find employee in static mock or current user if not found (handling dynamic)
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