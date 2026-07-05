import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps {
  data: any[];
  columns: Column<any>[];
}

export type Column<T> = {
  key: keyof T;
  header: string;
  render?: (value: any) => React.ReactNode;
};

const GroupingDataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const itemsPerPage = 10;

  // Filter and group data
  const filteredData = data
    .map((group) => ({
      ...group,
      items: group.items.filter((item: any) =>
        Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          const itemValue = String(item[key as keyof any] || "").toLowerCase();
          return itemValue.includes(value.toLowerCase());
        }),
      ),
    }))
    .filter((group) => group.items.length > 0);

  // Pagination calculation
  const totalItems = filteredData.reduce((sum, group) => sum + group.items.length, 0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedData: any[] = [];
  let currentIndex = 0;

  for (const group of filteredData) {
    if (currentIndex >= (currentPage - 1) * itemsPerPage && currentIndex < currentPage * itemsPerPage) {
      const start = Math.max(0, (currentPage - 1) * itemsPerPage - currentIndex);
      const end = Math.min(group.items.length, currentPage * itemsPerPage - currentIndex);
      if (start < end) {
        paginatedData.push({
          ...group,
          items: group.items.slice(start, end),
        });
      }
    }
    currentIndex += group.items.length;
    if (currentIndex >= currentPage * itemsPerPage) break;
  }

  return (
    <div className='w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-300 dark:border-gray-700 my-4'>
      {/* Table Header */}
      <table className='w-full table-auto border-collapse'>
        <thead className='sticky top-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className='px-4 py-2 text-left text-sm font-semibold border-b dark:border-gray-700'
              >
                <div className='flex flex-col'>
                  <span>{column.header}</span>
                  <div className='relative mt-2'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-gray-400' />
                    <input
                      type='text'
                      className='w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      // placeholder={`Filter ${column.header}`}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [column.key as string]: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {/* Group Header */}
              <tr className='bg-gray-200 dark:bg-gray-800'>
                <td
                  colSpan={columns.length}
                  className='px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200'
                >
                  {group.groupName} (Credits: {group.totalCredits}, Earned: {group.totalCreditsEarned})
                </td>
              </tr>
              {/* Group Items */}
              {group.items.map((item: any, itemIndex: number) => (
                <tr key={itemIndex} className='hover:bg-gray-100 dark:hover:bg-gray-700'>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className='px-4 py-2 text-sm border-b dark:border-gray-700'>
                      {column.render ? column.render(item[column.key]) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <div className='flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700'>
        <div className='text-sm text-gray-700 dark:text-gray-300'>
          Page <span className='font-medium'>{currentPage}</span> of{" "}
          <span className='font-medium'>{totalPages}</span>
        </div>
        <div className='flex items-center gap-2'>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className='flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-300 dark:bg-gray-700 dark:text-gray-200 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 dark:hover:bg-gray-600'
          >
            <ChevronLeft className='h-4 w-4' />
            Previous
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className='flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-300 dark:bg-gray-700 dark:text-gray-200 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 dark:hover:bg-gray-600'
          >
            Next
            <ChevronRight className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupingDataTable;
