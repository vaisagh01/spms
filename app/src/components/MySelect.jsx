import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const MySelect = ({data}) => {
  console.log(data);
    
  return (
    <Select>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semester" />
        </SelectTrigger>
        <SelectContent>
            {data.map((item, index) => (
                <SelectItem value={item.title} key={index}>Semester {item}</SelectItem>
            ))}
        </SelectContent>
    </Select>
  )
}

export default MySelect