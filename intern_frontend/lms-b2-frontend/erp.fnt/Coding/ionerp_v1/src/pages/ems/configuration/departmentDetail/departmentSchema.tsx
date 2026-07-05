import { z } from "zod";

// Department schema
export const Schema = z.object({
  dept_name: z.string().min(1, { message: "Department Name is required" }),
  dept_acronym: z.string().min(1, { message: "Department Acronym is required" }),
  dept_code_usn: z.string().min(1, { message: "Department Code USN is required" }),
  dept_description: z.string().min(1, { message: "Department Description is required" }),
  no_batch_dept: z.boolean().optional(),
});

export const SchemaFields = [
  {
    group: "",
    fields: [
      {
        type: "text",
        name: "dept_name",
        label: "Department Name",
        placeholder: "Enter your department name",
        required: true,
      },
      {
        type: "text",
        name: "dept_acronym",
        label: "Department Acronym",
        placeholder: "Enter your Department Acronym",
        required: true,
      },
      {
        type: "text",
        name: "dept_code_usn",
        label: "Department Code USN",
        placeholder: "Enter your Department Code USN",
        required: true,
      },
      {
        type: "text",
        name: "dept_description",
        label: "Department Description",
        placeholder: "Enter your Description",
        required: true,
      },      
      {
        type: "checkbox",
        name: "no_batch_dept",
        label: "No batches",
        placeholder: "Enter your No batches",
        required: false,
      },
    ],
  },
];

// Department column definitions
export const SchemaColumnDefs = [
  {
    headerName: "Department Name",
    field: "dept_name",
    sortable: true,
    filter: true,
    editable: false,
  },
  {
    headerName: "Department Acronym",
    field: "dept_acronym",
    sortable: true,
    filter: true,
    editable: false,
  },
  {
    headerName: "Department Code USN",
    field: "dept_code_usn",
    sortable: true,
    filter: true,
    editable: false,
  },
  {
    headerName: "Department Description",
    field: "dept_description",
    sortable: true,
    filter: true,
    editable: false,
  },
];
