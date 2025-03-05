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

  const handleSemChange = (value) => setSelectedSem(value);
  const result = studentResults?.results[selectedSem];

  const performanceData = studentResults
    ? Object.keys(studentResults.results).map((sem) => ({
        name: `Semester ${sem}`,
        GPA: studentResults.results[sem].gpa,
        Percentage: studentResults.results[sem].percentage
      }))
    : [];

  const subjectData = result
    ? Object.entries(result.subjects).map(([subject, marks], index) => ({
        name: subject,
        TotalMarks: marks.total_marks,
        fill: `hsl(${index * 70}, 70%, 50%)`
      }))
    : [];
    console.log(subjectData);
    
  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Student Results</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
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
              <div>
                <h2 className="text-2xl font-bold text-center mb-6">Performance Overview</h2>
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
                <h2 className="text-2xl font-bold text-center mb-6">Subject Wise Marks</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    {subjectData.map((entry, index) => (
                      <Bar key={index} dataKey="TotalMarks" fill={entry.fill} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
