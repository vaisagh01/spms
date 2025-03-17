import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Predefined pastel colors for subject cards
const cardColors = [
  "bg-indigo-100",
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-orange-100",
  "bg-pink-100",
  "bg-purple-100",
  "bg-teal-100",
];

const MySubjectCard = ({ data, index }) => {
  return (
    <Card className={`hover:bg-slate-50 shadow-md rounded-lg p-4 ${cardColors[index % cardColors.length]}`} style={{ height: "150px" }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold flex justify-between w-full">
          <p>{data?.subject_name}</p>
          <p className="text-slate-500">{data?.subject_code}</p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data?.num}</div>
        <p className="text-xs text-muted-foreground">
          {data?.teacher_name}
          {data?.img && (
            <img src="/club_image.jpg" alt="club" className="mt-2 rounded" />
          )}
        </p>
      </CardContent>
      {data?.button && (
        <CardFooter className="w-full">
          <Button className="w-full">View Assignments</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default MySubjectCard;
