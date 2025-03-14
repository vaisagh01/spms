"use client"
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const MyAssignments = ({ data, studentId, refreshData }) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleSubmit = async () => {
    setOpenConfirmDialog(false);

    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to submit.",
      });
      return;
    }

    const formData = new FormData();
    formData.append('student', studentId);
    formData.append('assignment', data.assignment_id);
    formData.append('file', selectedFile);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    formData.append('submission_date', today);

    try {
      setUploading(true);
      const response = await fetch('http://localhost:8000/curricular/upload_assignment_submission/', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        if (response.ok) {
          toast({ title: "Assignment Submitted", description: "Uploaded successfully." });
          refreshData(); // <== Call this function to update the list dynamically
        }
        toast({
          variant: "default",
          title: "Assignment Submitted",
          description: "Your assignment has been uploaded successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: result.error || "Something went wrong. Try again.",
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Failed to submit assignment. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const currentDate = new Date();
  const dueDate = new Date(data.due_date);
  let borderColor = 'border-gray-500';
  let statusText = 'Pending';

  if (dueDate < currentDate) {
    if (data.is_completed) {
      borderColor = 'border-green-500';
      statusText = 'Completed';
    } else {
      borderColor = 'border-red-500';
      statusText = 'Missing';
    }
  } else if (data.is_completed) {
    borderColor = 'border-green-500';
    statusText = 'Completed';
  }
  console.log(data);

  return (
    <Card className={`border-l-4 rounded-none p-4 ${borderColor}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl flex w-full justify-between items-center font-bold">
          <div className='flex flex-col gap-3'>
            <div>{data?.title}</div>
            <div className='text-md text-slate-600'>{data?.subject_name}</div>
          </div>
          <span className="text-sm font-light">
            Due date: {data.due_date} {data.time && `- ${data.time}`}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex items-center justify-between">
        <div className="w-[79%] text-wrap">{data?.description}</div>
        <span
          className={`text-sm px-2 py-1 rounded ${
            statusText === 'Missing'
              ? 'bg-red-200 text-red-800'
              : statusText === 'Completed'
              ? 'bg-green-200 text-green-800'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {statusText}
        </span>
      </CardContent>
        {data?.submitted_file && (
          <CardContent>
            <p className="text-sm font-medium text-gray-700">Submitted File:</p>
            <Link href={`http://localhost:8000/${data.submitted_file}`} className="text-indigo-600 hover:underline ml-2">
              {data.submitted_file.split("/").pop() || "View Submitted File"} 
            </Link>
          </CardContent>
        )}

      <CardContent className="flex items-center justify-between mt-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button>{data.is_completed ? 'Resubmit' : 'Submit'}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit files for Assignment</DialogTitle>
              <DialogDescription>
                Submit your file here. File size should be less than 2MB.
                <div {...getRootProps()} className="mt-3">
                  <input {...getInputProps()} />
                  <div className="h-32 flex items-center justify-center bg-slate-200 border-dashed border-2 border-slate-400 rounded-md w-full p-4 text-center cursor-pointer hover:bg-slate-300">
                    {selectedFile ? selectedFile.name : 'Drag & drop files here, or click to select'}
                  </div>
                </div>
              </DialogDescription>
              <Button className="mt-3" onClick={() => setOpenConfirmDialog(true)} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Submit'}
              </Button>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardContent>

      {data?.button && (
        <CardFooter className="w-full">
          <Button className="w-full">View Assignments</Button>
        </CardFooter>
      )}

      {/* Alert Dialog for confirmation before submitting */}
      <AlertDialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={uploading}>
              {uploading ? "Submitting..." : "Yes, Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default MyAssignments;
