'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const [selectedSem, setSelectedSem] = useState('');
  const [studentResults, setStudentResults] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({});
  const [selectedDate, setSelectedDate] = useState('');

  // Fetch attendance data
  useEffect(() => {
    fetch(`http://localhost:8000/curricular/student/123/attendance/`)
      .then((res) => res.json())
      .then((data) => {
        setAttendanceData(data.attendance || []);
        if (data.attendance.length > 0) {
          setSelectedDate(data.attendance[0].date); // Default to the latest date
        }
      });
  }, []);

  // Fetch attendance data for a specific student
  useEffect(() => {
    if (params.student_id) {
      fetch(`http://localhost:8000/curricular/attendance/student/${params.student_id}/`)
        .then((res) => res.json())
        .then((data) => {
          setAttendanceData(data.attendance || []);
          setMonthlySummary(data.monthly_summary || {});
          if (data.attendance.length > 0) {
            const latestMonth = data.attendance[0].date.slice(0, 7);
            setSelectedMonth(latestMonth);
          }
        });
    }
  }, [params.student_id]);

  // Fetch student results
  useEffect(() => {
    if (params.student_id) {
      fetch(`http://localhost:8000/curricular/student/${params.student_id}/results/`)
        .then((res) => res.json())
        .then((data) => {
          setStudentResults(data);
          const semesters = Object.keys(data.results);
          const latestSem = semesters[semesters.length - 1];
          setSelectedSem(latestSem);
        });
    }
  }, [params.student_id]);

  // Handlers
  const handleDateChange = (value) => setSelectedDate(value);
  const handleMonthChange = (value) => setSelectedMonth(value);
  const handleSemChange = (value) => setSelectedSem(value);

  // Filtered and aggregated data
  const filteredAttendance = attendanceData.filter((record) => record.date.startsWith(selectedMonth));
  const aggregatedData = filteredAttendance.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = { date: record.date, Present: 0 };
    }
    if (record.status === 'Present') {
      acc[record.date].Present += 1;
    }
    return acc;
  }, {});

  const chartData = Object.values(aggregatedData);
  const monthlyChartData = Object.keys(monthlySummary).map((month) => ({
    month,
    Attendance: monthlySummary[month].present_percentage,
  }));

  const result = studentResults?.results[selectedSem];
  const performanceData = studentResults
    ? Object.keys(studentResults.results).map((sem) => ({
        name: `Semester ${sem}`,
        GPA: studentResults.results[sem].gpa,
        Percentage: studentResults.results[sem].percentage,
      }))
    : [];

  const subjectData = result
    ? Object.entries(result.subjects).map(([subject, marks], index) => ({
        name: subject,
        TotalMarks: marks.total_marks,
        fill: `hsl(${index * 80}, 80%, 50%)`,
      }))
    : [];

  return (
    <div className="p-1 w-full m-5 mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Student Dashboard</h1>

      {/* Results Section */}
      {studentResults && (
        <>
          <div className="flex justify-center mb-10">
            <Select value={selectedSem} onValueChange={handleSemChange}>
              <SelectTrigger className="w-72 shadow-md">Select Semester</SelectTrigger>
              <SelectContent>
                {Object.keys(studentResults.results).map((sem) => (
                  <SelectItem key={sem} value={sem}>{`Semester ${sem}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {result && (
            <div className="gap-10 mb-10">
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Mid Sem Marks</TableHead>
                      <TableHead>End Sem Marks</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(result.subjects).map(([subject, marks]) => (
                      <TableRow key={subject}>
                        <TableCell>{subject}</TableCell>
                        <TableCell>{marks.mid_sem_marks}</TableCell>
                        <TableCell>{marks.end_sem_marks}</TableCell>
                        <TableCell>{marks.total_marks}</TableCell>
                        <TableCell>{marks.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <h2 className="text-2xl font-bold text-center mb-6">Performance Overview</h2>
              <div className='flex'>
                <ResponsiveContainer width="100%" height={300} className="mb-10">
                  <LineChart data={performanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="GPA" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Percentage" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="TotalMarks" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* Attendance Section */}
      <div className="p-10 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Student Attendance</h1>

        <div className="flex justify-center mb-10">
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-72 shadow-md">Select Month</SelectTrigger>
            <SelectContent>
              {Object.keys(monthlySummary).map((month) => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="Present" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* <Card className="mb-10">
          <CardHeader>
            <CardTitle>Attendance Summary (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                <Tooltip />
                <Bar dataKey="Attendance" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}

        <div className="flex justify-center mb-6">
          <Select value={selectedDate} onValueChange={handleDateChange}>
            <SelectTrigger className="w-72 shadow-md">Select Date</SelectTrigger>
            <SelectContent>
              {[...new Set(attendanceData.map((record) => record.date))].map((date) => (
                <SelectItem key={date} value={date}>{date}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Hour</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendance.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.subject_name}</TableCell>
                <TableCell>{record.hour}</TableCell>
                <TableCell>{record.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}