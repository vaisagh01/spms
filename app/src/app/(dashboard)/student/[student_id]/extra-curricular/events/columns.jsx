"use client"

export const columns = [
  {
    accessorKey: "event_name", // The event name
    header: "Event Name", // Column header
    cell: (info) => info.getValue(), // Display event name
  },
  {
    accessorKey: "event_date", // The event date
    header: "Event Date", // Column header
    cell: (info) => info.getValue(), // Display event date
  },
  {
    accessorKey: "role_in_event", // The event time
    header: "Role", // Column header
    cell: (info) => info.getValue(), // Display event tim
  },
  {
    accessorKey: "achievement", // The event time
    header: "Achievement", // Column header
    cell: (info) => info.getValue(), // Display event tim
  }
]
