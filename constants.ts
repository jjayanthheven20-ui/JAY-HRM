import { Department, Employee, EmployeeStatus, AttendanceRecord, AttendanceStatus, LeaveRequest, LeaveType, LeaveStatus, PayrollRecord } from "./types";

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    firstName: 'Jay',
    lastName: 'Sharma',
    email: 'jay.sharma@jayhrm.com',
    mobileNumber: '9876543210',
    role: 'Senior Engineer',
    department: Department.ENGINEERING,
    status: EmployeeStatus.ACTIVE,
    joinDate: '2022-03-15',
    avatarUrl: 'https://picsum.photos/seed/jay/100/100',
    salary: 95000
  },
  {
    id: 'EMP002',
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 'sarah.c@jayhrm.com',
    mobileNumber: '9876543211',
    role: 'Product Manager',
    department: Department.MARKETING,
    status: EmployeeStatus.ACTIVE,
    joinDate: '2021-06-01',
    avatarUrl: 'https://picsum.photos/seed/sarah/100/100',
    salary: 88000
  },
  {
    id: 'EMP003',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'm.chen@jayhrm.com',
    mobileNumber: '9876543212',
    role: 'HR Specialist',
    department: Department.HR,
    status: EmployeeStatus.ON_LEAVE,
    joinDate: '2023-01-10',
    avatarUrl: 'https://picsum.photos/seed/chen/100/100',
    salary: 65000
  },
  {
    id: 'EMP004',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.d@jayhrm.com',
    mobileNumber: '9876543213',
    role: 'Sales Executive',
    department: Department.SALES,
    status: EmployeeStatus.ACTIVE,
    joinDate: '2023-05-20',
    avatarUrl: 'https://picsum.photos/seed/emily/100/100',
    salary: 72000
  },
  {
    id: 'EMP005',
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'r.wilson@jayhrm.com',
    mobileNumber: '9876543214',
    role: 'Accountant',
    department: Department.FINANCE,
    status: EmployeeStatus.INACTIVE,
    joinDate: '2020-11-05',
    avatarUrl: 'https://picsum.photos/seed/robert/100/100',
    salary: 75000
  }
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'ATT001', employeeId: 'EMP001', date: '2023-10-24', checkIn: '09:00', checkOut: '17:30', status: AttendanceStatus.PRESENT, isVerified: true },
  { id: 'ATT002', employeeId: 'EMP001', date: '2023-10-25', checkIn: '09:15', checkOut: '17:45', status: AttendanceStatus.LATE, isVerified: true },
  { id: 'ATT003', employeeId: 'EMP001', date: '2023-10-26', checkIn: '08:55', checkOut: '17:30', status: AttendanceStatus.PRESENT, isVerified: false },
  { id: 'ATT004', employeeId: 'EMP002', date: '2023-10-26', checkIn: '09:00', checkOut: '18:00', status: AttendanceStatus.PRESENT, isVerified: false },
  { id: 'ATT005', employeeId: 'EMP003', date: '2023-10-26', checkIn: '', checkOut: '', status: AttendanceStatus.ABSENT, isVerified: true },
];

export const MOCK_LEAVES: LeaveRequest[] = [
  { id: 'LR001', employeeId: 'EMP001', type: LeaveType.SICK, startDate: '2023-11-01', endDate: '2023-11-02', reason: 'Suffering from high fever.', status: LeaveStatus.APPROVED },
  { id: 'LR002', employeeId: 'EMP003', type: LeaveType.CASUAL, startDate: '2023-11-05', endDate: '2023-11-06', reason: 'Personal family matters.', status: LeaveStatus.PENDING },
];

export const MOCK_PAYROLL: PayrollRecord[] = [
  { id: 'PR001', employeeId: 'EMP001', month: 'September', year: 2023, basicSalary: 5000, bonuses: 500, deductions: 200, netSalary: 5300, status: 'Paid' },
  { id: 'PR002', employeeId: 'EMP002', month: 'September', year: 2023, basicSalary: 6000, bonuses: 0, deductions: 300, netSalary: 5700, status: 'Paid' },
  { id: 'PR003', employeeId: 'EMP003', month: 'September', year: 2023, basicSalary: 4500, bonuses: 200, deductions: 100, netSalary: 4600, status: 'Processing' },
];