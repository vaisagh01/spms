'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

export default function TeacherInternshipPage() {
  const [internships, setInternships] = useState([]);
  const [filter, setFilter] = useState('All');
  const params = useParams();

  useEffect(() => {
    fetchInternships();
  }, [filter]);

  const fetchInternships = async () => {
    const res = await axios.get(`http://localhost:8000/cocurricular/internship/teacher/${params.teacher_id}/`);
    const data = res.data;

    if (filter === 'All') {
      setInternships(data);
    } else {
      const filtered = data.filter((internship) => internship.status === filter);
      setInternships(filtered);
    }
  };

  const handleStatusChange = async (internshipId, status) => {
    await axios.put(`http://localhost:8000/cocurricular/internship/status/${internshipId}/${params.teacher_id}/`, { status });
    fetchInternships();
  };

  const handleDownloadExcel = () => {
    window.open(`http://localhost:8000/cocurricular/internship/download/${params.teacher_id}/`, '_blank');
  };

  const handleViewCertificate = (certificateUrl) => {
    if (certificateUrl) {
      window.open(`http://localhost:8000${certificateUrl}`, '_blank');
    } else {
      alert('No Certificate Uploaded!');
    }
  };
  console.log(internships);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Internship Management</h1>

      <div className="flex justify-between mb-4">
        <Select value={filter} onValueChange={(value) => setFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleDownloadExcel}>
          Download Excel
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Certificate</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {internships.map((internship) => (
            <TableRow key={internship.id}>
              <TableCell>{internship.company_name}</TableCell>
              <TableCell>{internship.position}</TableCell>
              <TableCell>{internship.student_username}</TableCell>
              <TableCell>
                {internship.status === 'Approved' ? (
                  <CheckCircleIcon className="text-green-500" />
                ) : internship.status === 'Rejected' ? (
                  <XCircleIcon className="text-red-500" />
                ) : (
                  'Pending'
                )}
              </TableCell>
              <TableCell>
                <Button onClick={() => handleViewCertificate(internship.certificate)} variant="outline">
                  View Certificate
                </Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleStatusChange(internship.id, 'Approved')} className="mr-2">Approve</Button>
                <Button onClick={() => handleStatusChange(internship.id, 'Rejected')} variant="destructive">Reject</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
