'use client'
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useParams } from "next/navigation";

export default function StudentAttendancePage() {
    const params = useParams();
    const [attendance, setAttendance] = useState(null);
    const [warning, setWarning] = useState("");

    useEffect(() => {
        if (params.student_id) {
            fetch(`http://localhost:8000/curricular/attendance/student/${params.student_id}/`)
                .then(response => response.json())
                .then(data => setAttendance(data))
                .catch(error => console.error("Error fetching data:", error));
        }
    }, [params.student_id]);

    // Compute subject-wise attendance using useMemo (to prevent recalculations)
    const subjectData = useMemo(() => {
        if (!attendance) return [];

        const attendanceBySubject = {};

        attendance.attendance.forEach(record => {
            if (!attendanceBySubject[record.subject_name]) {
                attendanceBySubject[record.subject_name] = { total: 0, present: 0 };
            }
            attendanceBySubject[record.subject_name].total++;
            if (record.status === "Present") {
                attendanceBySubject[record.subject_name].present++;
            }
        });

        return Object.keys(attendanceBySubject).map(subject => {
            const total = attendanceBySubject[subject].total;
            const present = attendanceBySubject[subject].present;
            const percentage = (present / total) * 100;
            return { subject, percentage };
        });
    }, [attendance]);

    // Compute overall attendance inside useEffect
    useEffect(() => {
        if (subjectData.length === 0) return;

        const totalAttendance = subjectData.reduce((sum, item) => sum + item.percentage, 0);
        const computedOverallAttendance = totalAttendance / subjectData.length;

        if (computedOverallAttendance < 85 || subjectData.some(sub => sub.percentage < 75)) {
            setWarning("Warning: Your attendance is below the required threshold. Please be cautious!");
        } else {
            setWarning("");
        }
    }, [subjectData]);

    const overallAttendance = subjectData.length
        ? subjectData.reduce((sum, item) => sum + item.percentage, 0) / subjectData.length
        : 0;

    // Show loading until data is available
    if (!attendance) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Attendance Details</h1>
            {warning && <p className="text-red-600 font-semibold mb-4">{warning}</p>}
            
            <Card className="mb-6 bg-gray-50 border border-gray-200">
                <CardHeader>
                    <CardTitle className="text-indigo-700">Overall Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-4xl font-bold ${overallAttendance < 85 ? "text-red-600" : "text-green-600"}`}>
                        {overallAttendance.toFixed(2)}%
                    </div>
                </CardContent>
            </Card>
            
            <Card className="mb-6 bg-gray-50 border border-gray-200">
                <CardHeader>
                    <CardTitle className="text-indigo-700">Attendance by Subject</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={subjectData}>
                            <XAxis dataKey="subject" tick={{ fill: "#4F46E5" }} />
                            <YAxis domain={[0, 100]} tick={{ fill: "#4F46E5" }} />
                            <Tooltip />
                            <Bar dataKey="percentage" fill="#4F46E5" name="Attendance %" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-gray-50 border border-gray-200">
                <CardHeader>
                    <CardTitle className="text-indigo-700">Detailed Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Subject Code</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Hour</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendance.attendance.map(record => (
                                <TableRow key={`${record.subject_code}-${record.date}-${record.hour}`} className="hover:bg-gray-100">
                                    <TableCell>{record.subject_name}</TableCell>
                                    <TableCell>{record.subject_code}</TableCell>
                                    <TableCell>{record.date}</TableCell>
                                    <TableCell>{record.hour}</TableCell>
                                    <TableCell className={record.status === "Present" ? "text-green-600" : "text-red-600"}>{record.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}