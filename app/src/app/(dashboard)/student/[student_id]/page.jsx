
import EventDates from "./components/EventDates";
import AllClubs from "./components/AllClubs";
import EventTable from "./components/AllEvents";
import UpcomingTests from "./components/UpcomingTests";

const API_BASE_URL = "http://127.0.0.1:8000/curricular";

async function getStudentDetails(student_id) {
  if (!student_id) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/student/${student_id}/`, {
      cache: "no-store", // Ensures fresh data on each request
    });

    if (!res.ok) throw new Error("Failed to fetch student details");
    
    const data = await res.json();
    return data.student;
  } catch (error) {
    console.error("Error fetching student details:", error);
    return null;
  }
}

const Page = async ({ params }) => {
  const studentDetails = await getStudentDetails(params.student_id);

  return (
    <div className="p-4">
      <div className="flex flex-1 flex-col space-y-2 gap-1">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-4xl flex items-center gap-4 font-bold tracking-tight">
            <p className="text-slate-500">Hey! </p> 
            {studentDetails ? `${studentDetails.first_name} ${studentDetails.last_name}` : ""}!
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-2">
            <AllClubs params={params}/>
          </div>
          <div className="col-span-4 md:col-span-4">
            <EventDates params={params} />
          </div>
          <div className="col-span-4 md:col-span-3">
            <EventTable params={params} />
          </div>
          <div className="col-span-4 md:col-span-3">
            <UpcomingTests params={params} />
          </div> 
        </div>
      </div>
    </div>
  );
};

export default Page;
