import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import Link from "next/link";

const TeacherNav = ({ teacher_id }) => {
  const data = {
    home: [
      { title: "Home", url: `/teacher/1`, icon: Home },
      { title: "Manage Students", url: `/teacher/1/managestudents`, icon: Home },
      { title: "Manage Subjects", url: `/teacher/1/managesubjects`, icon: Home },
      { title: "Manage Assignments", url: `/teacher/1/assignments`, icon: Home },
      { title: "Manage Assessments", url: `/teacher/1/assessments`, icon: Home },
      { title: "Send Notifications", url: `/teacher/1/notifications`, icon: Home },
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
