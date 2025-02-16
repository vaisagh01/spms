import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const MyAssignments = ({ data }) => {
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('File reading was aborted');
      reader.onerror = () => console.log('File reading has failed');
      reader.onload = () => {
        const binaryStr = reader.result;
        console.log(binaryStr);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Get current date
  const currentDate = new Date();
  const dueDate = new Date(data.due_date);

  // Determine border color & status
  let borderColor = 'border-gray-500'; // Default: Upcoming assignment
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

  return (
    <Card className={`border-l-4 p-4 ${borderColor}`}>
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

      <CardContent className="flex items-center justify-between mt-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              {data.is_completed ? 'Resubmit' : 'Submit'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit files for Assignment</DialogTitle>
              <DialogDescription>
                Submit your file here. File size should be less than 2MB.
                <div {...getRootProps()} className="mt-3">
                  <input {...getInputProps()} />
                  <div className="h-32 flex items-center justify-center bg-slate-200 border-dashed border-2 border-slate-400 rounded-md w-full p-4 text-center cursor-pointer hover:bg-slate-300">
                    Drag & drop files here, or click to select
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardContent>

      {data?.button && (
        <CardFooter className="w-full">
          <Button className="w-full">View Assignments</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default MyAssignments;
