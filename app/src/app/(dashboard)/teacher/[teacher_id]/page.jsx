'use client'
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Home } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const TeacherNav = ({ teacher_id }) => {
  const params = useParams()
  const data = {
    home: [
      { title: "Home", url: `/teacher/1`, icon: Home },
      // { title: "Department", url: `/teacher/${params.teacher_id}/department`, icon: Building2 },
      { title: "Manage Students", url: `/teacher/${params.teacher_id}/managestudents`, icon: Home },
      { title: "Manage Subjects", url: `/teacher/${params.teacher_id}/managesubjects`, icon: Home },
      { title: "Manage Assignments", url: `/teacher/${params.teacher_id}/assignments`, icon: Home },
      { title: "Manage Assessments", url: `/teacher/${params.teacher_id}/assessments`, icon: Home },
      { title: "Send Notifications", url: `/teacher/${params.teacher_id}/notifications`, icon: Home },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {data.home.map((item, index) => (
        <Link key={index} href={item.url}>
          <Card className="cursor-pointer hover:shadow-lg transition duration-300">
            <CardContent className="flex items-center space-x-4 p-4">
              {/* <item.icon className="w-6 h-6" /> */}
              <span className="text-lg font-semibold">{item.title}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default TeacherNav;
