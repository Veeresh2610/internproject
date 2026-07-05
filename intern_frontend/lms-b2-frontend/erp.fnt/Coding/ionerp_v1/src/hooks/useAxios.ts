import { useState, useCallback, useEffect } from "react";
import axiosInstance from "../utils/api";
import { useLoader } from "../contexts/LoaderContext";
import { toast } from "react-toastify";

export interface ApiResponse<T> {
  history: any;
  data: T;
  status: number;
  message?: string;
}

export const useAxios = <TPayload, TResponse>(
  url: string,
  options: {
    method?: "get" | "post" | "put" | "delete";
    payload?: TPayload;
    loader?: boolean;
    shouldFetch?: boolean; // Added this option to control useEffect
    [key: string]: any;
  } = {},
) => {
  const [responseData, setResponseData] = useState<TResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { loading, setLoading } = useLoader();

  const fetchData = useCallback(
    async (
      overrideOptions: Partial<typeof options> = {},
      abortController?: AbortController,
    ): Promise<ApiResponse<TResponse> | null> => {
      const mergedOptions = { ...options, ...overrideOptions };
      const controller = abortController || new AbortController();

      if (mergedOptions.loader !== false) {
        setResponseData(null);
        setLoading(true);
      }
      setError(null);
      try {
        const response = await axiosInstance.request<ApiResponse<TResponse>>({
          url,
          method: mergedOptions.method || "get",
          data: mergedOptions.payload as any,
          ...mergedOptions,
        });

        // console.log("response", response);

        if (!response || !response.data) {
          toast.error("Server is busy, please try again later");
          return null;
        }

        if (!response.status && response.data.data === null) {
          return (response.data as ApiResponse<TResponse>) ?? null;
        }

        if (!response.status) {
          toast.error(response.data.message);
          return (response.data as ApiResponse<TResponse>) ?? null;
        }

        // console.log('asdas', response)
        if (
          response.status &&
          response.data.status &&
          response.data.message === "Completed" &&
          typeof response.data.data === "string"
        ) {
          // toast.success(response.data.data);
          const res = {
            data: response.data.data,
            message: response.data.data,
            status: response.data.status,
            history: [],
          };
          setResponseData((response.data.data as TResponse) ?? null);
          return (res as ApiResponse<TResponse>) ?? null;
        }
        setResponseData((response.data.data as TResponse) ?? null);
        return (response.data as ApiResponse<TResponse>) ?? null;
      } catch (err: any) {
        if (err && !controller.signal.aborted) {
          const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
          setError(errorMessage);
          // console.log("errrrrr =======>", err.response.data.message);
          toast.error(errorMessage);
        }
        return null;
      } finally {
        if (mergedOptions.loader !== false) {
          setLoading(false);
        }
      }
    },
    [setLoading, url, options],
  );

  useEffect(() => {
    const shouldFetch = options.shouldFetch ?? true; // Default to true if shouldFetch is not provided
    if (shouldFetch) {
      const abortController = new AbortController();
      fetchData({}, abortController);

      return () => {
        abortController.abort();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.shouldFetch]);

  const refetch = useCallback(
    (overrideOptions?: Partial<typeof options>): Promise<ApiResponse<TResponse> | null> =>
      fetchData(overrideOptions, new AbortController()),
    [fetchData],
  );

  const addStateItem = useCallback(
    (item: TResponse) => {
      if (responseData && Array.isArray(responseData)) {
        const updatedData = [...responseData, item] as TResponse;
        setResponseData(updatedData);
      } else if (responseData && typeof responseData === "object") {
        const updatedData = { ...responseData, ...item } as TResponse;
        setResponseData(updatedData);
      }
    },
    [responseData],
  );

  const editStateItem = useCallback(
    (keyName: string, id: number, updatedItem: TResponse) => {
      // console.log("editStateItem", id, updatedItem);
      if (responseData && Array.isArray(responseData)) {
        const updatedData = responseData.map((item: any) =>
          item[keyName] === id ? { ...item, ...updatedItem } : item,
        ) as TResponse;
        // console.log("editStateItem === 1", updatedData);
        setResponseData(updatedData);
      } else if (responseData && typeof responseData === "object" && id in responseData) {
        const updatedData = { ...responseData, [id]: updatedItem } as TResponse;
        // console.log("editStateItem === 2", updatedData);
        setResponseData(updatedData);
      }
    },
    [responseData],
  );

  const deleteStateItem = useCallback(
    (key: number) => {
      if (responseData && Array.isArray(responseData)) {
        const updatedData = responseData.filter((item: any) => item.key !== key) as TResponse;
        setResponseData(updatedData);
      } else if (responseData && typeof responseData === "object" && key in responseData) {
        const { [key]: _, ...rest } = responseData as any;
        setResponseData(rest as TResponse);
      }
    },
    [responseData],
  );

  const addItem = useCallback(
    async (item: TPayload | any, endpoint: string): Promise<TResponse | null> => {
      try {
        const response = await axiosInstance.request<ApiResponse<any>>({
          method: "post",
          url: endpoint,
          data: item,
        });

        if (!response?.status || !response?.data?.status) {
          return null;
        }

        if (
          response.status &&
          response.data.status &&
          response.data.message === "Completed" &&
          typeof response.data.data === "string"
        ) {
          toast.success(response?.data.data);
          return response.data as unknown as TResponse;
        }

        toast.success(response?.data?.message === "Completed" ? "Saved Successfully" : response?.data?.message);
        return response.data.data ?? null;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "An error occurred while adding the item";
        toast.error(errorMessage);
        console.error("Add item error:", error);
        return null;
      }
    },
    [],
  );

  const editItem = useCallback(
    async (id: number | null, updatedItem: TPayload, endpoint: string): Promise<TResponse | null> => {
      const response = await fetchData({
        method: "put",
        url: `${endpoint}/${id}`,
        payload: updatedItem,
      });
      if (!response?.status) {
        toast.error(response?.message);
        return null;
      }
      if (response.status && response.message === "Completed" && typeof response.data === "string") {
        // toast.success(response.data.data);
        toast.success(response.data);
        return response?.data || null;
      }
      toast.success(response?.message === "Completed" ? "Saved Successfully" : response?.message);
      return response?.data || null;
    },
    [fetchData],
  );

  const deleteItem = useCallback(
    async (id: number | null, endpoint: string): Promise<TResponse | null> => {
      const response = await fetchData({
        method: "delete",
        url: `${endpoint}/${id}`,
      });
      if (!response?.status) {
        toast.error(response?.message);
        return null;
      }
      if (response.status && response.message === "Completed" && typeof response.data === "string") {
        // toast.success(response.data.data);
        toast.success(response.data);
        return response?.data || null;
      }
      toast.success(response?.message === "Completed" ? "Saved Successfully" : response?.message);
      return response?.data || null;
    },
    [fetchData],
  );

  const customApiCall = useCallback(
    async <CustomPayload, CustomResponse>(
      endpoint: string,
      method: "get" | "post" | "put" | "delete",
      payload?: CustomPayload,
      showMessage?: true | false,
      customOptions: Partial<typeof options> = {},
    ): Promise<CustomResponse | null> => {
      setLoading(true);
      try {
        const response = await axiosInstance.request<ApiResponse<CustomResponse>>({
          method,
          url: endpoint,
          data: payload as any,
          ...customOptions,
        });

        if (!response) {
          toast.error("Server is busy, please try again later");
          return null;
        }
        if (!response.status && showMessage) {
          toast.error(response.data.message);
          return null;
        }
        if (response.status && showMessage) {
          toast.success(
            response.data.message === "Completed" && typeof response.data.data === "string"
              ? response.data.data
              : response.data.message,
          );
        }
        return response.data.data as CustomResponse | null;
        // return null;
      } catch (error) {
        console.error("Error during API call:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading],
  );

  const custompdfApiCall = useCallback(
    async <CustomPayload, CustomResponse>(
      endpoint: string,
      method: "get" | "post",
      payload?: CustomPayload,
      showMessage?: true | false,
      fileType: "pdf" | "excel" | "document" = "pdf", // Add fileType to specify the type of file
      fileName?: string,
    ): Promise<CustomResponse | null> => {
      setLoading(true);

      try {
        const response = await axiosInstance.request({
          method,
          url: endpoint,
          data: payload as any,
          responseType: "blob", // We expect a Blob (PDF, Excel, or Word) as the response
          headers: {
            "Content-Type": "application/json", // Usually JSON for POST requests
            Accept:
              fileType === "pdf"
                ? "application/pdf"
                : fileType === "excel"
                  ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  : "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Add Word document MIME type
          },
        });

        if (!response) {
          toast.error("Server is busy, please try again later");
          return null;
        }

        // If a success message is to be shown
        if (response.status && showMessage) {
          toast.success(response.data.message);
        }

        // Create a Blob from the response
        const blob = new Blob([response.data], {
          type:
            fileType === "pdf"
              ? "application/pdf"
              : fileType === "excel"
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Add Word document MIME type
        });

        // Check if the Blob is valid and handle download
        if (blob.size > 0) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;

          // Set the default file name based on the file type
          link.download =
            fileType === "pdf"
              ? `${fileName}.pdf`
              : fileType === "excel"
                ? `${fileName}.xlsx`
                : `${fileName}.docx`; // Handle Word documents
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Cleanup the Blob URL
          window.URL.revokeObjectURL(url);
        } else {
          toast.error(
            `Failed to generate ${fileType === "pdf" ? "PDF" : fileType === "excel" ? "Excel" : "Word Document"
            }`,
          );
          return null;
        }

        return null; // We return null because the file is directly downloaded
      } catch (error) {
        console.error("Error during file download:", error);
        toast.error(
          `Failed to fetch ${fileType === "pdf" ? "PDF" : fileType === "excel" ? "Excel" : "Word Document"}`,
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading],
  );

  const uploadFileWithData = useCallback(
    async (data: Record<string, any>, endpoint: string): Promise<TResponse | null> => {
      const formData = new FormData();

      // Append additional data
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      try {
        const response = await axiosInstance.post<ApiResponse<TResponse>>(endpoint, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (!response?.data?.status) {
          toast.error(response?.data?.message);
          return null;
        }

        toast.success(response?.data?.message);
        return response.data.data || null;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("File upload error:", error);
        return null;
      }
    },
    [],
  );

  return {
    responseData,
    setResponseData,
    error,
    loading,
    refetch,
    customApiCall,
    addItem,
    editItem,
    deleteItem,
    addStateItem,
    editStateItem,
    deleteStateItem,
    uploadFileWithData,
    custompdfApiCall,
  };
};
