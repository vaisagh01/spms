'use client'
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StudentPerformance() {
    const params = useParams();
    const [results, setResults] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState("");

    useEffect(() => {
        if (params.student_id) {
            fetch(`http://localhost:8000/curricular/student/${params.student_id}/results/`)
                .then(response => response.json())
                .then(data => {
                    setResults(data.results);
                    setSelectedSemester(Object.keys(data.results)[0] || "");
                })
                .catch(error => console.error("Error fetching data:", error));
        }
    }, [params.student_id]);

    if (!results) return <p>Loading...</p>;

    const gpaData = Object.keys(results).map(semester => ({
        semester,
        gpa: results[semester].gpa,
        percentage: results[semester].percentage,
    }));

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Student Performance</h1>
            
            <Select onValueChange={setSelectedSemester} value={selectedSemester}>
                <SelectTrigger className="w-64 mb-4">
                    <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                    {Object.keys(results).map(semester => (
                        <SelectItem key={semester} value={semester}>Semester {semester}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            
            {selectedSemester && (
                <Card className="mb-6 bg-gray-50 border border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-indigo-700">Semester {selectedSemester} Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-indigo-700">Subject</TableHead>
                                    <TableHead className="text-indigo-700">Mid Sem Marks</TableHead>
                                    <TableHead className="text-indigo-700">End Sem Marks</TableHead>
                                    <TableHead className="text-indigo-700">Total Marks</TableHead>
                                    <TableHead className="text-indigo-700">Percentage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.keys(results[selectedSemester].subjects).map(subject => {
                                    const sub = results[selectedSemester].subjects[subject];
                                    return (
                                        <TableRow key={subject} className="hover:bg-gray-100">
                                            <TableCell className="font-medium">{subject}</TableCell>
                                            <TableCell>{sub.mid_sem_marks}</TableCell>
                                            <TableCell>{sub.end_sem_marks}</TableCell>
                                            <TableCell>{sub.total_marks} / {sub.max_marks}</TableCell>
                                            <TableCell className={`font-semibold ${sub.percentage >= 50 ? "text-green-600" : "text-red-600"}`}>{sub.percentage.toFixed(2)}%</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <div className="mt-4 font-semibold text-indigo-700">GPA: {results[selectedSemester].gpa} | Percentage: {results[selectedSemester].percentage.toFixed(2)}%</div>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-gray-50 border border-gray-200">
                <CardHeader>
                    <CardTitle className="text-indigo-700">GPA & Percentage Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={gpaData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                            <XAxis dataKey="semester" tick={{ fill: "#4F46E5" }} />
                            <YAxis domain={[0, 10]} tick={{ fill: "#4F46E5" }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="gpa" stroke="#4F46E5" strokeWidth={2} name="GPA" />
                            <Line type="monotone" dataKey="percentage" stroke="#10B981" strokeWidth={2} name="Percentage" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}