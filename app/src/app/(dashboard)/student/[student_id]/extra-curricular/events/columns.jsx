"use client"

export const columns = [
  {
    accessorKey: "event_name", // The event name
    header: "Event Name", // Column header
    cell: (info) => info.getValue(), // Display event name
  },
]
