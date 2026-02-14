import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AttendanceRecord } from '../types';

interface SystemContextType {
  users: User[];
  attendanceRecords: AttendanceRecord[];
  registerUser: (user: User) => void;
  markAttendance: (record: AttendanceRecord) => void;
  clearAttendance: () => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Load data from local storage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('faceguard_users');
    const storedRecords = localStorage.getItem('faceguard_records');
    
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedRecords) setAttendanceRecords(JSON.parse(storedRecords));
  }, []);

  // Save data to local storage on change
  useEffect(() => {
    localStorage.setItem('faceguard_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('faceguard_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const registerUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const markAttendance = (record: AttendanceRecord) => {
    // Check for duplicates for today
    const today = new Date().toDateString();
    const alreadyMarked = attendanceRecords.some(r => 
      r.userId === record.userId && new Date(r.timestamp).toDateString() === today
    );

    if (!alreadyMarked) {
      setAttendanceRecords(prev => [record, ...prev]);
    }
  };

  const clearAttendance = () => {
    setAttendanceRecords([]);
  };

  return (
    <SystemContext.Provider value={{ users, attendanceRecords, registerUser, markAttendance, clearAttendance }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};