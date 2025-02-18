"use client"

export const columns = [
  {
    accessorKey: "event_name", // The event name
    header: "Event Name", // Column header
    cell: (info) => info.getValue(), // Display event name
  },
  {
    accessorKey: "club_name", // The club name
    header: "Club", // Column header
    cell: (info) => info.getValue(), // Display club name
  },
  {
    accessorKey: "role_in_event", // The role of the student in the event (e.g. Speaker, Volunteer)
    header: "Role", // Column header
    cell: (info) => info.getValue(), // Display role
  },
  {
    accessorKey: "achievement", // The role of the student in the event (e.g. Speaker, Volunteer)
    header: "Achievement", // Column header
    cell: (info) => info.getValue(), // Display role
  },
  {
    accessorKey: "event_date", // The date of the event
    header: "Date", // Column header
    cell: (info) => new Date(info.getValue()).toLocaleDateString(), // Format the date
  },
]
