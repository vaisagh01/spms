import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { Check, X } from 'lucide-react';
const MyAccordian = ({data}) => {
    console.log(data);
    
  return (
    <Accordion type="single" defaultChecked="true" collapsible>
        {data.map((item, index) => (
            <AccordionItem key={index} value={item.title} >
                <AccordionTrigger className="font-bold text-2xl text-slate-600">
                    {item.title}
                </AccordionTrigger>
                <AccordionContent>
                    Faculty : {item.desc}
                </AccordionContent>
                <AccordionContent>
                    Hours : {item.hours}
                </AccordionContent>
                <AccordionContent>
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="bg-slate-200 p-3">Chapters</AccordionTrigger>
                        {
                            item.chapters.map((subitem, index) => (
                                <AccordionContent key={index} className="border-b-2 border-l-2 ml-10 border-slate-200 py-4 px-2">
                                    {subitem.title} <X className="float-right" />
                                </AccordionContent>
                            ))
                        }
                    </AccordionItem>
                    </Accordion>
                </AccordionContent>

            </AccordionItem>
        ))}
    </Accordion>
  )
}

export default MyAccordian