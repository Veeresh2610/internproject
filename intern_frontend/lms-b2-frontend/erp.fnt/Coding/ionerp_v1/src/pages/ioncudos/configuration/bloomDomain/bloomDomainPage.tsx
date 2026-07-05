import React, { useCallback, useState, useMemo } from "react";
import { GoPencil } from "react-icons/go";
import { MdOutlineDoNotDisturbAlt } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import ModalWithForm from "../../../../components/Modal/ModalWithForm";
import ConfirmDialog from "../../../../components/Dialog/ConfirmDialog";
import DataTable from "../../../../components/Table/DataTable";
import { Schema, SchemaColumnDefs, SchemaFields } from "./bloomDomainSchema";
import { useAxios } from "../../../../hooks/useAxios";
import { getBloomDomainList } from "./responseInterface";

// API endpoint configuration for CUDOS module
const ApiEndpoint = {
  master_soft_delete: "comman_function/soft_delete",
  bloomDomain: {
    save_bloom_domain: "bloom_domain/save_bloom_domain",
    bloom_domain_list: "comman_function/bloom_domain_list",
  },
};

/**
 * Bloom's Domain Page Component
 * Manages CRUD operations for Bloom's Domain taxonomy
 */
const BloomDomainPage: React.FC = () => {
  // State management
  const [deleteId, setDeleteId] = useState<getBloomDomainList | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [targetStatus, setTargetStatus] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Memoized axios configuration
  const axiosPayload = useMemo(() => ({
    show_delete: 1,
    equal_or_not_equal: 0,
    no_batch: 1,
  }), []);

  const axiosOptions = useMemo(() => ({
    method: "post" as const,
    loader: true,
    payload: axiosPayload,
    shouldFetch: true,
  }), [axiosPayload]);

  // API connectivity
  const { responseData, addItem, editStateItem, addStateItem, refetch } =
    useAxios<any, getBloomDomainList[]>(ApiEndpoint.bloomDomain.bloom_domain_list, axiosOptions);

  // Computed data
  const displayData = useMemo(() => (Array.isArray(responseData) ? responseData : []), [responseData]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return displayData;
    const lowerSearch = searchTerm.toLowerCase();
    return displayData.filter((item) =>
      item.bloom_domain_name?.toLowerCase().includes(lowerSearch) ||
      item.bloom_domain_acronym?.toLowerCase().includes(lowerSearch) ||
      item.bloom_domain_description?.toLowerCase().includes(lowerSearch)
    );
  }, [displayData, searchTerm]);

  // Handlers
  const closeModalHandler = useCallback(() => {
    setIsModalOpen(false);
    setEditingData(null);
  }, []);

  const OpenModalHandler = useCallback(() => {
    const activeDomainsCount = displayData.filter((item) => item.status !== 2).length;
    if (activeDomainsCount >= 3 && !editingData) {
      alert("Maximum 3 Bloom's Domains allowed.");
      return;
    }
    setIsModalOpen(true);
  }, [displayData, editingData]);

  const handleEdit = useCallback((data: getBloomDomainList) => {
    setEditingData(data);
    setIsModalOpen(true);
  }, []);

  const handleDeleteTrigger = useCallback((item: getBloomDomainList, message: string, status: number) => {
    setConfirmMessage(message);
    setDeleteId(item);
    setTargetStatus(status);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId && targetStatus !== null) {
      const payload = {
        flag: "bloom_domain",
        record_id: deleteId.bloom_domain_id,
        status: targetStatus,
      };

      const response = await addItem(payload, ApiEndpoint.master_soft_delete);
      if (response) {
        refetch();
      }
      setDeleteId(null);
      setTargetStatus(null);
    }
  }, [addItem, deleteId, targetStatus, refetch]);

  const handleFormSubmit = useCallback(async (formData: any) => {
    const payload = {
      ...formData,
      bloom_domain_id: editingData ? editingData.bloom_domain_id : null,
    };

    const response = await addItem(payload, ApiEndpoint.bloomDomain.save_bloom_domain);
    if (response) {
      if (editingData) {
        editStateItem("bloom_domain_id", (response as any).bloom_domain_id, response as any);
      } else {
        addStateItem(response as any);
      }
      closeModalHandler();
    }
  }, [addItem, addStateItem, editStateItem, editingData, closeModalHandler]);

  // Column Definitions
  const columnDefs = useMemo(() => [
    ...SchemaColumnDefs.map(col => ({ ...col, flex: 1, minWidth: 100 })),
    {
      headerName: "Action",
      field: "action",
      cellRenderer: (params: any) => (
        <div className="flex space-x-2 justify-center items-center h-full">
          <GoPencil
            size={18}
            onClick={() => handleEdit(params.data)}
            className="cursor-pointer text-yellow-600"
            title="Edit"
          />
          <MdOutlineDoNotDisturbAlt
            className="cursor-pointer text-red-600"
            size={18}
            title="Delete"
            onClick={() => handleDeleteTrigger(params.data, "Are you sure you want to delete?", 2)}
          />
          {params.data.status === 1 ? (
            <FaCheckCircle
              className="cursor-pointer text-green-600"
              size={18}
              title="Active"
              onClick={() => handleDeleteTrigger(params.data, "Deactivate this domain?", 0)}
            />
          ) : (
            <MdOutlineDoNotDisturbAlt
              className="cursor-pointer text-gray-400"
              size={18}
              title="Inactive"
              onClick={() => handleDeleteTrigger(params.data, "Activate this domain?", 1)}
            />
          )}
        </div>
      ),
      width: 90,
      maxWidth: 100,
      cellStyle: { textAlign: "center" as const },
      filter: false,
      editable: false,
      sortable: false,
    }
  ], [handleEdit, handleDeleteTrigger]);

  return (
    <>
      <style>{`
        .ag-body-horizontal-scroll, .ag-body-vertical-scroll { display: none !important; }
        .ag-body-viewport { overflow-x: hidden !important; overflow-y: auto !important; -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .ag-body-viewport::-webkit-scrollbar { display: none !important; }
        .ag-row:hover, .ag-row-selected { background-color: transparent !important; }
      `}</style>
      <div className="">
        <div className="flex justify-between items-center pb-5">
          <h3 className="text-lg leading-6 font-medium">Bloom's Domain Details</h3>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isModalOpen && (
          <ModalWithForm
            title="Bloom's Domain"
            isOpen={isModalOpen}
            onSubmit={handleFormSubmit}
            onClose={closeModalHandler}
            formFields={SchemaFields}
            schema={Schema}
            size="lg"
            columnLayout={1}
            initialValues={editingData || {}}
          />
        )}

        <DataTable
          columnDefs={columnDefs}
          rowData={filteredData}
          showAddButton={true}
          showExportButton={false}
          addButtonHandler={OpenModalHandler}
          headerFilter={false}
          pageSize={filteredData.length || 3}
        />

        <ConfirmDialog
          isOpen={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title="Confirm"
          message={confirmMessage}
        />
      </div>
    </>
  );
};

export default BloomDomainPage;
