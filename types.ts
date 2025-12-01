export type ViewState = 'dashboard' | 'employees' | 'attendance' | 'leave' | 'payroll' | 'chat' | 'documents';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export enum EmployeeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  ON_LEAVE = 'On Leave'
}

export enum Department {
  ENGINEERING = 'Engineering',
  MARKETING = 'Marketing',
  HR = 'HR',
  SALES = 'Sales',
  FINANCE = 'Finance'
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
  department: Department;
  status: EmployeeStatus;
  joinDate: string;
  avatarUrl: string;
  salary: number;
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late'
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  isVerified?: boolean;
}

export enum LeaveType {
  SICK = 'Sick Leave',
  CASUAL = 'Casual Leave',
  VACATION = 'Vacation'
}

export enum LeaveStatus {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  REJECTED = 'Rejected'
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Processing' | 'Pending';
}