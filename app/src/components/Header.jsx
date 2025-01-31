import React from 'react'
import { Input } from "@/components/ui/input"
import { Avatar,AvatarImage,AvatarFallback } from '@/components/ui/avatar'
import { SidebarTrigger } from './ui/sidebar'

export default function Header() {
  return (
    <div className='p-4 bg-slate-50 flex justify-between items-center border-b border-slate-200'> 
        <SidebarTrigger />
        <div className='w-1/4 flex justify-between items-center gap-3'> 
            <Input placeholder="Search..." />
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        </div>

    </div>
  )
}
