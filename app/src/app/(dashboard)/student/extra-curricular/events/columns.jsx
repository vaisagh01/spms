"use client"

import { ColumnDef } from "@tanstack/react-table"

export const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "club",
    header: "Club",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
]
