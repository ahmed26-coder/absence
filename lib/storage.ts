import type { AttendanceData, Student, AttendanceStatus } from "./types";

const STORAGE_KEY = "attendance_data";

export const getStorageData = (): AttendanceData => {
  if (typeof window === "undefined")
    return { students: [], lastUpdated: new Date().toISOString() };

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return { students: [], lastUpdated: new Date().toISOString() };
  }

  try {
    return JSON.parse(data);
  } catch {
    return { students: [], lastUpdated: new Date().toISOString() };
  }
};

export const saveStorageData = (data: AttendanceData): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addStudent = (name: string): Student => {
  const data = getStorageData();
  const newStudent: Student = {
    id: Date.now().toString(),
    name,
    attendance: {},
  };
  data.students.push(newStudent);
  data.lastUpdated = new Date().toISOString();
  saveStorageData(data);
  return newStudent;
};

export const deleteStudent = (studentId: string): void => {
  const data = getStorageData();
  data.students = data.students.filter((s) => s.id !== studentId);
  data.lastUpdated = new Date().toISOString();
  saveStorageData(data);
};

export const updateAttendance = (
  studentId: string,
  date: string,
  status: AttendanceStatus | null | undefined,
  reason?: string
): void => {
  const data = getStorageData();
  const student = data.students.find((s) => s.id === studentId);

  if (student) {
    if (status === null || typeof status === "undefined") {
      if (student.attendance && student.attendance[date]) {
        delete student.attendance[date];
      }
    } else {
      student.attendance = student.attendance || {};
      student.attendance[date] = { date, status, reason };
    }
    data.lastUpdated = new Date().toISOString();
    saveStorageData(data);
  }
};

export const getStudentStats = (
  student: Student,
  startDate?: string | null,
  endDate?: string | null
) => {
  let present = 0;
  let absent = 0;
  let excused = 0;

  if (!student || !student.attendance) {
    return {
      present,
      absent,
      excused,
      presentPercentage: 0,
      absentPercentage: 0,
      excusedPercentage: 0,
    };
  }

  Object.entries(student.attendance).forEach(([date, record]) => {
    const inRange =
      (!startDate && !endDate) ||
      (!startDate && endDate ? date <= endDate : true) ||
      (startDate && !endDate ? date >= startDate : true) ||
      (startDate && endDate ? date >= startDate && date <= endDate : true);

    if (!inRange) return;

    if (record.status === "H") present++;
    else if (record.status === "G") absent++;
    else if (record.status === "E") excused++;
  });

  const total = present + absent + excused;
  return {
    present,
    absent,
    excused,
    presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
    absentPercentage: total > 0 ? Math.round((absent / total) * 100) : 0,
    excusedPercentage: total > 0 ? Math.round((excused / total) * 100) : 0,
  };
};
