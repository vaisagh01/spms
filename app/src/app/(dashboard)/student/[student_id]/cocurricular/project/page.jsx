'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const ProjectsPage = () => {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [link, setLink] = useState('');
  const [document, setDocument] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [open, setOpen] = useState(false);
  const params = useParams();

  const fetchProjects = async () => {
    const res = await axios.get(`http://localhost:8000/cocurricular/get-projects/${params.student_id}/`);
    setProjects(res.data.projects);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleFileChange = (e) => {
    setDocument(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    if (link) formData.append('link', link);
    if (document) formData.append('document', document);

    try {
      if (editingProject) {
        await axios.put(`http://localhost:8000/cocurricular/projects/${params.student_id}/${projectId}/edit/`, formData);
        // toast({ title: 'Success', description: 'Project updated successfully' });
      } else {
        await axios.post(`http://localhost:8000/cocurricular/add-project/${params.student_id}/`, formData);
        // toast({ title: 'Success', description: 'Project added successfully' });
      }
      setOpen(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      // toast({ title: 'Error', description: 'Something went wrong' });
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setStartDate(project.start_date);
    setEndDate(project.end_date);
    setLink(project.link || '');
    setOpen(true);
  };

  const handleDelete = async (projectId) => {
    await axios.delete(`http://localhost:8000/cocurricular/projects/${params.student_id}/${projectId}/delete/`);
    // toast({ title: 'Success', description: 'Project deleted successfully' });
    fetchProjects();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setLink('');
    setDocument(null);
    setEditingProject(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Project Management</h1>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add Project</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Input placeholder="Link (Optional)" value={link} onChange={(e) => setLink(e.target.value)} />
            <Input type="file" onChange={handleFileChange} />
            <Button type="submit">{editingProject ? 'Update Project' : 'Add Project'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            {/* <TableHead>Description</TableHead> */}
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Document</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.title}</TableCell>
              {/* <TableCell className="whitespace-normal break-words max-w-32">{project.description}</TableCell> */}
              <TableCell>{project.start_date}</TableCell>
              <TableCell>{project.end_date}</TableCell>
              <TableCell>{project.link && <a href={project.link} target="_blank" className="text-blue-500">View Link</a>}</TableCell>
              <TableCell>{project.document && <a href={project.document} target="_blank" className="text-green-500">View Document</a>}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(project)} className="mr-2">Edit</Button>
                <Button onClick={() => handleDelete(project.id)} className="text-red-500">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectsPage;
