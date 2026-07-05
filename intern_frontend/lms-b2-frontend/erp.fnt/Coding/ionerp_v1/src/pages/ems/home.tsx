import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Rectangle,
} from "recharts";
import { ApiEndpoint } from "../../utils/ApiEndpoint/emsapiEndpoint";
import { useAxios } from "../../hooks/useAxios";
import Tabs from "../../components/Tabs/Tabs";
import { FaCircle } from "react-icons/fa6";
import DataTable from "../../components/Table/DataTable";

export interface examEventInterface {
  result_year: string;
  event_type: string;
  result_year_dd: string;
  semester_start_date?: string;
  semester_end_date?: string;
}

export interface DashboardDataInterface {
  students_intake: StudentsIntake[];
  student_pass_percentage: StudentPassPercentage[];
  cgpa_report: any;
  result_analysis: Analysis[];
  todo_pre_exam: TodoPreExam[];
  todo_exam: TodoExam[];
  todo_post_exam: TodoPostExam[];
}

export interface StudentsIntake {
  dept_acronym: string;
  std_count: number;
}

export interface StudentPassPercentage {
  dept_acronym: string;
  dept_name: string;
  failed: number;
  passed: number;
  appeared: number;
  pass_per: number;
}

export interface Analysis {
  dept_acronym: string;
  department_id: number;
  cia: number;
  attendance: number;
  absentee: number;
  presentee: number;
  mal_practice: number;
  failed_students: number;
  "count(regno)": number;
  passed_students: number;
}

export interface TodoPreExam {
  academic_batch_id: number;
  academic_batch_code: string;
  cia: string;
  attendance: string;
  eligibility: string;
  registered: string;
  exam_time_table: any;
}

export interface TodoExam {
  academic_batch_id: number;
  academic_batch_code: string;
  hall_allocation: any;
  see_marks: string;
}

export interface TodoPostExam {
  academic_batch_id: number;
  academic_batch_code: string;
  grade_processing: string;
  reval_registration: string;
}

// Inside your render method or functional component
const renderLabAllocation = (allocation: string) => {
  let color;

  if (allocation === null) {
    color = "black"; // No data
  } else if (allocation === "red") {
    color = "red"; // Red allocation
  } else if (allocation === "green") {
    color = "green"; // Green allocation
  } else {
    color = "red"; // Default color if none of the above
  }

  return <FaCircle style={{ color }} />;
};

export const ExamColumnDefs = [
  {
    headerName: "Academic Batch",
    field: "academic_batch_code",
    sortable: false,
    filter: false,
    editable: false,
  },
  {
    headerName: "Lab Allocation",
    field: "lab_allocation",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.lab_allocation), // Pass the string directly
  },
  {
    headerName: "Hall Allocation",
    field: "hall_allocation",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.hall_allocation), // Pass the string directly
  },
  {
    headerName: "See Absentee",
    field: "see_absentee",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.see_absentee), // Pass the string directly
  },
  {
    headerName: "SEE Marks",
    field: "see_marks",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.see_marks), // Pass the string directly
  },
];

export const PostExamColumnDefs = [
  {
    headerName: "Academic Batch",
    field: "academic_batch_code",
    sortable: false,
    filter: false,
    editable: false,
  },
  {
    headerName: "Grade Processing",
    field: "grade_processing",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.grade_processing), // Pass the string directly
  },
  {
    headerName: "Result Declaration",
    field: "result_declaration",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.result_declaration), // Pass the string directly
  },
  {
    headerName: "Revaluation Registration",
    field: "reval_registration",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.reval_registration), // Pass the string directly
  },
  {
    headerName: "Revaluation Result",
    field: "revaluation_result",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.revaluation_result), // Pass the string directly
  },
  {
    headerName: "Revaluation Grade",
    field: "revaluation_grade",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.revaluation_grade), // Pass the string directly
  },
];

export const PreExamColumnDefs = [
  {
    headerName: "Academic Batch",
    field: "academic_batch_code",
    sortable: false,
    filter: false,
    editable: false,
  },
  {
    headerName: "CIA",
    field: "cia",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.cia), // Pass the string directly
  },
  {
    headerName: "Attendance",
    field: "attendance",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.attendance), // Pass the string directly
  },
  {
    headerName: "Eligibility",
    field: "eligibility",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.eligibility), // Pass the string directly
  },
  {
    headerName: "Exam Time Table",
    field: "exam_time_table",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.exam_time_table), // Pass the string directly
  },
  {
    headerName: "Exam Registration",
    field: "registered",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.registered), // Pass the string directly
  },
  {
    headerName: "Hall Ticket",
    field: "hall_ticket",
    sortable: false,
    filter: false,
    editable: false,
    cellRenderer: (params: any) => renderLabAllocation(params.data.hall_ticket), // Pass the string directly
  },
];



const Analysiss: React.FC<{ result: DashboardDataInterface }> = ({ result }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  const cgpaComparisonData = [
    { name: "0 - 2", value: 1 },
    { name: "2 - 4", value: 0 },
    { name: "4 - 6", value: 2 },
    { name: "6 - 8", value: 0 },
    { name: "8 - 10", value: 2 },
  ];

  return (
    <div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <ChartCard title='Students Intake'>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={result.students_intake}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='dept_acronym' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='std_count' fill='#85c0e4' />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title='Students Pass Percentage'>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={result.student_pass_percentage}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='dept_name' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='pass_per' fill='#82ca9d' />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title='Comparison of #CGPA across Departments'>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={cgpaComparisonData}
              cx='50%'
              cy='50%'
              outerRadius={80}
              fill='#8884d8'
              dataKey='value'
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {cgpaComparisonData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title='Result Analysis'>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart
            width={500}
            height={300}
            data={result.result_analysis}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray='1 1' />
            <XAxis dataKey='dept_acronym' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey='cia' fill='#ffb85f' activeBar={<Rectangle fill='gold' stroke='purple' />} />
            <Bar
              dataKey='attendance'
              fill='#e45641e6'
              activeBar={<Rectangle fill='gold' stroke='purple' />}
            />
            <Bar dataKey='absentee' fill='#00bfbae6' activeBar={<Rectangle fill='gold' stroke='purple' />} />
            <Bar dataKey='presentee' fill='#00aaa0' activeBar={<Rectangle fill='pink' stroke='blue' />} />
            <Bar
              dataKey='mal_practice'
              fill='#82ca9d'
              activeBar={<Rectangle fill='gold' stroke='purple' />}
            />
            <Bar
              dataKey='passed_students'
              fill='#7b8d8e'
              activeBar={<Rectangle fill='gray' stroke='purple' />}
            />
            <Bar
              dataKey='failed_students'
              fill='#e45641e6'
              activeBar={<Rectangle fill='red' stroke='purple' />}
            />
          </BarChart>
          {/* <BarChart data={result.result_analysis}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dept_acronym" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="std_count" fill="#85c0e4" />
          </BarChart> */}
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className='bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg dark:shadow-gray-700 my-3'>
    <div className='p-5'>
      <h3 className='text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4'>{title}</h3>
      {children}
    </div>
  </div>
);

const ToDoList: React.FC<{ result: DashboardDataInterface }> = ({ result }) => {
  const [showData, setShowData] = useState<string>("Pre-Exam");

  return (
    <div className=''>
      <div className='mt-4 max-w-lg'>
        <label htmlFor='todoType' className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          Select To Do
        </label>
        <select
          className='
            w-full 
            px-3 
            py-2 
            border 
            rounded-md 
            shadow-sm 
            focus:outline-none 
            focus:ring-2 
            transition 
            duration-300
            appearance-none
            border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            sm:text-sm
          '
          value={showData}
          onChange={(e) => setShowData(e.target.value)}
        >
          <option value='Pre-Exam'>Pre-Exam</option>
          <option value='Exam'>Exam</option>
          <option value='Post-Exam'>Post-Exam</option>
        </select>
      </div>

      <DataTable
        columnDefs={
          showData === "Pre-Exam"
            ? PreExamColumnDefs
            : showData === "Exam"
              ? ExamColumnDefs
              : PostExamColumnDefs
        }
        rowData={
          showData === "Pre-Exam"
            ? result.todo_pre_exam
            : showData === "Exam"
              ? result.todo_exam
              : result.todo_post_exam
        }
        headerFilter={false}
        pageSize={20}
      />
    </div>
  );
};



const Home: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardDataInterface | null>(null);
  const [examEvent, setExamEvent] = useState<string>("");
  const { responseData, customApiCall } = useAxios<{ show_all: number }, examEventInterface[]>(ApiEndpoint.fetch_result_year_options, {
    method: "post",
    loader: true,
    payload: { show_all: 1 },
    shouldFetch: true,
  });

  // Memoize the API call function
  const callDashboardApi = useCallback(async (examEvent: string) => {
    if (!examEvent) return;
    const response = await customApiCall(
      ApiEndpoint.dashboard_info_all_data,
      "post",
      { result_year: examEvent },
      false,
    );
    if (response) {
      setDashboardData(response as DashboardDataInterface);
    }
  }, [customApiCall]);

  // Effect for initializing the dashboard
  useEffect(() => {
    if (responseData?.length) {
      const initialEvent = responseData[0].result_year_dd;
      setExamEvent(initialEvent);
      callDashboardApi(initialEvent);
    }
  }, [responseData, callDashboardApi]);

  // Handle select change
  const handleExamEventChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newExamEvent = e.target.value;
    setExamEvent(newExamEvent);
    callDashboardApi(newExamEvent);
  }, [callDashboardApi]);

  const tabItems = useMemo(() => [
    {
      label: "Analysis",
      content: dashboardData && <Analysiss result={dashboardData} />,
    },
    {
      label: "To Do",
      content: dashboardData && <ToDoList result={dashboardData} />,
    },
  ], [dashboardData]);

  return (
    <div>
      <div className='mb-4 max-w-lg'>
        <label htmlFor='examEvent' className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          Exam Event
        </label>
        <select
          className='w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition duration-300 appearance-none border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 sm:text-sm'
          value={examEvent}
          onChange={handleExamEventChange}
        >
          <option key='placeholder' value=''>
            Select Exam Event
          </option>
          {responseData?.map((item, index) => (
            <option key={index} value={item.result_year_dd}>
              {item.result_year_dd}
            </option>
          ))}
        </select>
      </div>

      <Tabs items={tabItems} onSelectTab={setActiveIndex} activeTab={activeIndex} />
    </div>
  );
};

export default Home;
