import MyCard from "@/components/MyCard"
import { DataTable } from "./data-table"
import { columns } from "./columns"
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
  {
    name: "art",
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
  {
    name: "art",
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
  {
    name: "art",
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
            Manage your events here
          </h2>
      </div>

      <div className="flex gap-3">
        <div className="w-3/4">
        <div className="container mx-auto py-10">
          <DataTable columns={columns} data={data} />
        </div>
        </div>

        <div className="w-1/4">
          {/* <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-1">
            <MyCard desc={"number of events"} num={234}/>
            <MyCard desc={"number of events"} num={234}/>
            <MyCard desc={"number of events"} num={234}/>
            <MyCard desc={"number of events"} num={234}/>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default page