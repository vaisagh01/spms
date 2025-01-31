import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
const data = [
  {
    name: "blossoms",
    club : "Student Welfare Office",
    role: "hospitality",
    date: "12/12/2021"
  },
  {
    name: "inblooms",
    club : "Student Welfare Office",
    role: "hospitality",
    date: "12/12/2021"
  },
  {
    name: "art",
    club : "Student Welfare Office",
    role: "hospitality",
    date: "12/12/2021"
  },
]
const page = () => {
  return (
    <div className="p-4">
      <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-4xl font-bold tracking-tight'>
            Events!
          </h2>
        </div>
      <Table className="my-4">
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Club</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((data, i) => (
            <TableRow>
              <TableCell className="font-medium">{data.name}</TableCell>
              <TableCell>{data.club}</TableCell>
              <TableCell>{data.role}</TableCell>
              <TableCell className="text-right">{data.date}</TableCell>
            </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default page