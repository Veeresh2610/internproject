import React from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getExpandedRowModel,
    ExpandedState,
    flexRender,
} from "@tanstack/react-table";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

export const ReusableGroupingTable: React.FC<any> = ({ datasource, columns }: any) => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const table = useReactTable({
        data: datasource,
        columns,
        state: {
            expanded,
            columnFilters: [],
        },
        onExpandedChange: setExpanded,
        getSubRows: (row: any) => row.subRows || [], // Ensure subRows exist
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // Enable filtering
        getExpandedRowModel: getExpandedRowModel(),
    });

    return (
        <div className="p-4 bg-white rounded-lg ">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <div className="overflow-y-auto max-h-[70vh]">
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-150 sticky top-0 z-3">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className="px-6 py-4 font-medium whitespace-nowrap bg-gray-50 border-b"
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div className="flex flex-col">
                                                    <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                                                    {/* Filter Input */}
                                                    {/* <input
                                                        type="text"
                                                        placeholder={`Filter ${header.column.columnDef.header}`}
                                                        className="mt-1 p-1 border border-gray-300 rounded-md"
                                                        onChange={(e) => {
                                                            table.setColumnFilters((old) => [
                                                                ...old.filter((filter) => filter.id !== header.id),
                                                                { id: header.id, value: e.target.value },
                                                            ]);
                                                        }}
                                                    /> */}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {table.getRowModel().rows.map((row) => (
                                <React.Fragment key={row.id}>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                    {/* {row.getIsExpanded() && (
                                        <tr className="bg-gray-200">
                                            <td colSpan={row.getVisibleCells().length} className="px-6 py-2 font-semibold text-gray-800">
                                                Expanded Row Header
                                            </td>
                                            {row.getVisibleCells().map((cell) => (
                                            <td colSpan={row.getVisibleCells().length} key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                        </tr>
                                    )} */}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex items-center justify-between mt-4 px-2">
                <div className="flex items-center gap-2">
                    <button
                        className="inline-flex items-center p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <MdKeyboardDoubleArrowLeft />
                    </button>
                    <button
                        className="inline-flex items-center p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <MdKeyboardArrowLeft />
                    </button>
                    <button
                        className="inline-flex items-center p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <MdKeyboardArrowRight />
                    </button>
                    <button
                        className="inline-flex items-center p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <MdKeyboardDoubleArrowRight />
                    </button>
                </div>
                <span className="text-sm text-gray-700">
                    Page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{" "}
                    <span className="font-medium">{table.getPageCount()}</span>
                </span>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="block w-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ReusableGroupingTable;
