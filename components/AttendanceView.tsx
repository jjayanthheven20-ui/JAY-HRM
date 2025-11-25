import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Sparkles, LogIn, LogOut, Timer, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';
import { MOCK_EMPLOYEES } from '../constants';
import { AttendanceStatus, AttendanceRecord, Employee, Department } from '../types';
import { analyzeAttendance } from '../services/geminiService';

interface AttendanceViewProps {
  currentUser: Employee;
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ currentUser, attendanceRecords, onUpdateAttendance }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Self Attendance State
  const [isUserCheckedIn, setIsUserCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const isHR = currentUser.department === Department.HR;

  // Restore session state from records on mount
  useEffect(() => {
    // Find the most recent record for this user
    const userRecords = attendanceRecords
      .filter(r => r.employeeId === currentUser.id)
      .sort((a, b) => {
        // Sort by date desc, then by checkIn time desc
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.checkIn.localeCompare(a.checkIn);
      });

    if (userRecords.length > 0) {
      const lastRecord = userRecords[0];
      // If today and no checkout time, they are still checked in
      const todayStr = new Date().toISOString().split('T')[0];
      
      if (lastRecord.date === todayStr && !lastRecord.checkOut) {
        setIsUserCheckedIn(true);
        setCurrentSessionId(lastRecord.id);
        
        // Parse time "HH:MM" to Date object for timer
        const [hours, minutes] = lastRecord.checkIn.split(':').map(Number);
        const dateObj = new Date();
        dateObj.setHours(hours, minutes, 0, 0);
        setCheckInTime(dateObj);
      }
    }
  }, [attendanceRecords, currentUser.id]);

  // Timer logic for checked-in state
  useEffect(() => {
    let interval: any;
    if (isUserCheckedIn && checkInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - checkInTime.getTime();
        if (diff >= 0) {
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setElapsedTime(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isUserCheckedIn, checkInTime]);

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: 
        return <span className="flex items-center text-white bg-blue-600 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-full"><CheckCircle className="w-3 h-3 mr-1" /> Present</span>;
      case AttendanceStatus.ABSENT: 
        return <span className="flex items-center text-gray-700 bg-white px-2 py-1 text-xs font-bold uppercase tracking-wider border border-gray-300 rounded-full"><XCircle className="w-3 h-3 mr-1" /> Absent</span>;
      case AttendanceStatus.LATE: 
        return <span className="flex items-center text-orange-700 bg-orange-100 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-full"><AlertCircle className="w-3 h-3 mr-1" /> Late</span>;
      default: return null;
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzeAttendance(attendanceRecords);
    setAnalysis(result);
    setAnalyzing(false);
  };

  const handleCheckIn = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateString = now.toISOString().split('T')[0];
    const newId = `ATT${Date.now()}`;

    // Create new record
    const newRecord: AttendanceRecord = {
      id: newId,
      employeeId: currentUser.id,
      date: dateString,
      checkIn: timeString,
      checkOut: '',
      status: AttendanceStatus.PRESENT,
      isVerified: false // Default to unverified for self check-in
    };

    onUpdateAttendance([newRecord, ...attendanceRecords]);
    setCheckInTime(now);
    setIsUserCheckedIn(true);
    setCurrentSessionId(newId);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // Update the record in the list
    onUpdateAttendance(attendanceRecords.map(record => {
        if (record.id === currentSessionId) {
          return { ...record, checkOut: timeString };
        }
        return record;
      })
    );

    setIsUserCheckedIn(false);
    setCheckInTime(null);
    setElapsedTime('00:00:00');
    setCurrentSessionId(null);
  };

  const handleApprove = (id: string) => {
    onUpdateAttendance(attendanceRecords.map(record => {
        if (record.id === id) {
          return { ...record, isVerified: true };
        }
        return record;
      })
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-black tracking-tight">Attendance</h2>
          <p className="text-gray-500 text-sm mt-1">Daily logs, self-check-in, and analytics.</p>
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={analyzing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 flex items-center space-x-2 transition-colors disabled:opacity-70 shadow-sm rounded-sm"
        >
          {analyzing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span className="font-medium">{analyzing ? 'Analyzing...' : 'AI Insights'}</span>
        </button>
      </div>

      {/* Self Service Attendance Card */}
      <div className="bg-white border border-gray-200 shadow-md rounded-sm overflow-hidden">
        <div className="bg-black px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg flex items-center">
            <Timer className="w-5 h-5 mr-2 text-blue-500" />
            My Daily Attendance
          </h3>
          <span className="text-gray-400 text-xs font-mono">{new Date().toDateString()}</span>
        </div>
        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${isUserCheckedIn ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
              <Clock className={`w-8 h-8 ${isUserCheckedIn ? 'text-blue-600 animate-pulse' : 'text-gray-400'}`} />
            </div>
            <div>
               <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Current Status</p>
               <h2 className={`text-3xl font-bold ${isUserCheckedIn ? 'text-blue-600' : 'text-gray-800'}`}>
                 {isUserCheckedIn ? 'CHECKED IN' : 'CHECKED OUT'}
               </h2>
               {isUserCheckedIn && (
                 <p className="text-sm text-gray-500 mt-1 font-mono">
                   Since {checkInTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
               )}
            </div>
          </div>

          <div className="flex flex-col items-end">
             {isUserCheckedIn && (
               <div className="mb-4 text-center">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Session Duration</p>
                 <div className="text-4xl font-mono font-bold text-black tracking-wider">
                   {elapsedTime}
                 </div>
               </div>
             )}
             
             {!isUserCheckedIn ? (
                <button 
                  onClick={handleCheckIn}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-blue-600 font-pj rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/30"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  CHECK IN NOW
                </button>
             ) : (
                <button 
                  onClick={handleCheckOut}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-black font-pj rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-800 shadow-lg"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  CHECK OUT
                </button>
             )}
          </div>
        </div>
      </div>

      {/* AI Analysis Result */}
      {analysis && (
        <div className="bg-blue-50 border border-blue-100 p-6 flex items-start space-x-4 shadow-sm rounded-sm">
          <div className="bg-blue-600 p-2 rounded-full shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wide mb-1">AI Trend Analysis</h4>
            <p className="text-blue-800 text-sm leading-relaxed">{analysis}</p>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Attendance Logs</h3>
          {!isHR && <span className="text-xs text-gray-500 flex items-center"><Lock className="w-3 h-3 mr-1"/> Admin Approval Restricted</span>}
        </div>
        <table className="w-full text-left">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Check In</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Check Out</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Verification Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {attendanceRecords.map((record) => {
              const employee = MOCK_EMPLOYEES.find(e => e.id === record.employeeId) || 
                               (currentUser.id === record.employeeId ? currentUser : undefined);
              return (
                <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-xs font-bold text-white rounded-full">
                        {employee?.firstName.charAt(0)}{employee?.lastName.charAt(0)}
                      </div>
                      <span className="font-bold text-sm text-black">{employee?.firstName} {employee?.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{record.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{record.checkIn || '--:--'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{record.checkOut || '--:--'}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {record.isVerified ? (
                      <div className="flex items-center justify-end text-blue-600 space-x-1">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end">
                        {isHR ? (
                          <button 
                            onClick={() => handleApprove(record.id)}
                            className="flex items-center px-3 py-1.5 bg-black text-white hover:bg-gray-800 rounded-sm text-xs font-bold uppercase transition-colors"
                          >
                            <ShieldAlert className="w-3 h-3 mr-1.5" />
                            Approve
                          </button>
                        ) : (
                          <span className="flex items-center text-gray-400 text-xs italic">
                             <Clock className="w-3 h-3 mr-1" /> Pending Review
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceView;