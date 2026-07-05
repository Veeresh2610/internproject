import React, { useCallback } from "react";
import { GoPencil } from "react-icons/go";
import { MdOutlineDoNotDisturbAlt } from "react-icons/md";
import ModalWithForm from "../../../../components/Modal/ModalWithForm";
import ConfirmDialog from "../../../../components/Dialog/ConfirmDialog";
import DataTable from "../../../../components/Table/DataTable";
import { Schema, SchemaColumnDefs, SchemaFields } from "./departmentSchema";
import { ApiEndpoint } from "../../../../utils/ApiEndpoint/emsapiEndpoint";
import { useAxios } from "../../../../hooks/useAxios";
import { FaCheckCircle } from "react-icons/fa";
import { getDepartmentList } from "./responceinterface";
import { updateCookieCommonApiData } from "../../../../utils/commonHelper";
const DepartmentPage = () => {
  const [deleteId, setDeleteId] = React.useState<getDepartmentList | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [confirmMessage, setConfirmMessage] = React.useState<string>("");
  const [editingData, setEditingData] = React.useState<Record<string, any> | null>(null);
  const { responseData, addItem, editStateItem, addStateItem, refetch } = useAxios<
    {
      show_delete: number;
      equal_or_not_equal: number;
      no_batch: number;
    },
    any
  >(ApiEndpoint.department.department_list, {
    method: "post",
    loader: true,
    payload: {
      show_delete: 1,
      equal_or_not_equal: 0,
      no_batch: 1,
    },
    shouldFetch: true,
  });

  const closeModalHandler = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const OpenModalHandler = () => {
    setIsModalOpen(true);
  };

  const handleEdit = React.useCallback((data: Record<string, any>) => {
    setEditingData({ ...data, no_batch_dept: data.no_batch_dept === 1 ? true : false });
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((item: getDepartmentList, message: string) => {
    // Implement delete functionality
    // console.log('delete', item)
    setConfirmMessage(message);
    setDeleteId(item);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId !== null) {
      // console.log("Delete", deleteId);
      setDeleteId(null);
    }
    // console.log('deleteId', deleteId)
    const deletePayload = {
      flag: "department",
      record_id: deleteId?.department_id,
      status: deleteId?.status === 1 ? 0 : 1,
    };
    // console.log("deletePayload", deletePayload);
    const response = await addItem(deletePayload, ApiEndpoint.master_soft_delete);
    if (!response) {
      return;
    }
    if (response !== null && deleteId) {
      updateCookieCommonApiData("departments", {
        department_id: deleteId.department_id,
        dept_name: deleteId.dept_name,
        status: deleteId.status === 1 ? 0 : 1,
      });
      // console.log("response", responseData);
      refetch();
      // editStateItem("department_id", deleteId.department_id, {
      //   ...deleteId,
      //   status: deleteId.status === 1 ? 0 : 1,
      // });
    }
  }, [addItem, deleteId, refetch]);

  const columnDefs = React.useMemo(() => {
    const apiUrlInformation = SchemaColumnDefs;
    return [
      ...apiUrlInformation.map((col: any) => ({
        ...col,
        flex: 1,
        minWidth: 100,
      })),
      {
        headerName: "Action",
        field: "action",
        cellRenderer: (params: any) => {
          // const rowNode = params.node as RowNode;
          return (
            <div className='flex space-x-3 justify-left items-center h-full'>
              <GoPencil
                size={20}
                onClick={() => handleEdit(params.data)}
                className='cursor-pointer text-yellow-600'
              />
              {params.data.status === 1 ? (
                <FaCheckCircle
                  className='cursor-pointer text-green-600'
                  onClick={() => handleDelete(params.data, "Are you sure you want to Deactivate?")}
                  size={15}
                />
              ) : (
                <MdOutlineDoNotDisturbAlt
                  className='cursor-pointer text-red-600'
                  onClick={() => handleDelete(params.data, "Are you sure you want to Activate?")}
                  size={15}
                />
              )}
            </div>
          );
        },
        width: 120,
        cellStyle: { textAlign: "center" },
        filter: false,
        editable: false,
        sortable: false,
        flex: 0,
      },
    ];
  }, [handleEdit, handleDelete]);

  const handleFormSubmit = useCallback(
    async (data: any) => {
      const updatePayload = {
        ...data,
        department_id: editingData ? editingData?.department_id : null,
      };
      const response = await addItem(
        updatePayload as typeof updatePayload,
        ApiEndpoint.department.save_department,
      );
      if (!response) {
        return;
      }
      if (response !== null && editingData) {
        // Handle edit submission
        editStateItem("department_id", response["department_id"], response);
        updateCookieCommonApiData("departments", {
          department_id: response.department_id,
          dept_name: response.dept_name,
          status: response.status,
        });
      } else if (response !== null) {
        addStateItem(response);
        updateCookieCommonApiData("departments", {
          department_id: response.department_id,
          dept_name: response.dept_name,
          status: response.status,
        });
      }
      closeModalHandler();
    },
    [addItem, addStateItem, editStateItem, editingData],
  );

  return (
    <>
      <div className=''>
        <h3 className='text-lg leading-6 font-medium pb-5'>Department Details</h3>

        {isModalOpen && (
          <ModalWithForm
            title={"Department"}
            isOpen={isModalOpen}
            onSubmit={handleFormSubmit}
            onClose={closeModalHandler}
            formFields={SchemaFields}
            schema={Schema}
            size={"lg"}
            columnLayout={1}
            initialValues={editingData || {}} // Ensure initialValues is always an object
          />
        )}

        <DataTable
          columnDefs={columnDefs}
          rowData={Array.isArray(responseData) ? responseData : []}
          showAddButton={true}
          showExportButton={false}
          addButtonHandler={OpenModalHandler}
          headerFilter={true}
          pageSize={20}
        />

        <ConfirmDialog
          isOpen={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title='Confirm'
          message={confirmMessage}
        />
      </div>
    </>
  );
};
export default DepartmentPage;
