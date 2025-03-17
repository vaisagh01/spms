'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import axios from 'axios';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

const page = () => {
  const [internships, setInternships] = useState([]);
  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    start_date: '',
    end_date: '',
    description: '',
    certificate: null,
  });
  const params = useParams();
  const [editId, setEditId] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // ✅ Added state for dialog control

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    const response = await axios.get(`http://localhost:8000/cocurricular/internships/${params.student_id}/`);
    setInternships(response.data);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    if (editId) {
      await axios.put(`http://localhost:8000/cocurricular/internship/${params.student_id}/${editId}/update/`, formDataToSend);
    } else {
      await axios.post(`http://localhost:8000/cocurricular/internships/${params.student_id}/add/`, formDataToSend);
    }

    fetchInternships();
    setEditId(null);
    setFormData({ company_name: '', position: '', start_date: '', end_date: '', description: '', certificate: null });
    setIsDialogOpen(false); // ✅ Close dialog after submit
  };

  const handleEdit = (internship) => {
    setEditId(internship.id);
    setFormData({
      company_name: internship.company_name,
      position: internship.position,
      start_date: internship.start_date,
      end_date: internship.end_date,
      description: internship.description,
      certificate: null,
    });
    setIsDialogOpen(true); // ✅ Open dialog when editing
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:8000/cocurricular/internship/${params.student_id}/${id}/delete/`);
    fetchInternships();
  };

  return (
    <div className="flex h-screen">
      <motion.div
        className="w-1/4 bg-gray-100 p-4 overflow-y-auto"
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Internships</h2>
        {internships.map((internship) => (
          <div
            key={internship.id}
            className={`p-2 cursor-pointer mb-2 rounded ${selectedInternship === internship ? 'bg-gray-300' : 'bg-white'}`}
            onClick={() => setSelectedInternship(internship)}
          >
            {internship.company_name}
          </div>
        ))}
      </motion.div>

      <div className="flex-1 p-8">
        <Button onClick={() => setIsDialogOpen(true)}>Add Internship</Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
              <Input
                name="company_name"
                placeholder="Company Name"
                value={formData.company_name}
                onChange={handleChange}
                required
              />
              <Input
                name="position"
                placeholder="Position"
                value={formData.position}
                onChange={handleChange}
                required
              />
              <Input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
              <Input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
              <Input
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
              />
              <Input
                type="file"
                name="certificate"
                onChange={handleChange}
              />
              <Button type="submit">{editId ? 'Update' : 'Add'} Internship</Button>
            </form>
          </DialogContent>
        </Dialog>

        {selectedInternship && (
          <Card className={`mt-8 ${selectedInternship.status === 'Approved' ? 'bg-green-100' : selectedInternship.status === 'Rejected' ? 'bg-red-100' : 'bg-neutral-100'}`}>
            <CardHeader>
              <CardTitle>{selectedInternship.company_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{selectedInternship.position}</p>
              <p>{selectedInternship.start_date} to {selectedInternship.end_date}</p>
              <p>{selectedInternship.description}</p>
              {selectedInternship.certificate && <a href={`http://localhost:8000${selectedInternship.certificate}`} className="text-blue-600">View Certificate</a>}
              <p>Assigned Teacher: {selectedInternship.assigned_teacher || 'Not Assigned'}</p>
              <p>Status: {selectedInternship.status}</p>
              <div className="flex gap-4 mt-4">
                <Button onClick={() => handleEdit(selectedInternship)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(selectedInternship.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default page;
