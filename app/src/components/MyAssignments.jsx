import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import {Card, 
        CardHeader, 
        CardTitle, 
        CardContent, 
        CardFooter
} from '@/components/ui/card'
import { Button } from './ui/button'
import { Check, Plus } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
const MyAssignments = ({data}) => {
    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
          const reader = new FileReader()
    
          reader.onabort = () => console.log('file reading was aborted')
          reader.onerror = () => console.log('file reading has failed')
          reader.onload = () => {
          // Do whatever you want with the file contents
            const binaryStr = reader.result
            console.log(binaryStr)
          }
          reader.readAsArrayBuffer(file)
        })
        
      }, [])
      const {getRootProps, getInputProps} = useDropzone({onDrop})
    
  return (
    <Card className="">
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-xl flex w-full justify-between items-center font-bold'>
                {data?.title}
                <span className='text-sm font-light'>
                    Due date: {data.due_date} - {data.time}
                </span>
            </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
            <p className='w-[79%] text-wrap'>{data?.desc}</p>
            <Dialog>
                <DialogTrigger asChild>
                <Button>Submit</Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit files for Assignment</DialogTitle>
                    <DialogDescription>
                    Submit the file here. File size should be less than 2MB
                    <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <div className='h-80 flex items-center justify-center bg-slate-200 border-dashed border-2 border-slate-400 rounded-md w-full mt-3'>Drag 'n' drop some files here, or click to select files</div>
                    </div>
                    </DialogDescription>
                </DialogHeader>
                </DialogContent>
            </Dialog>
            </CardContent>
        {
          data?.button && 
            <CardFooter className="w-full">
              <Button className="w-full">View Assignments</Button>
            </CardFooter>
        }
    </Card>
  )
}

export default MyAssignments