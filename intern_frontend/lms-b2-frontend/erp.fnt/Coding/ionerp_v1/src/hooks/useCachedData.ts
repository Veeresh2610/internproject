import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useAxios } from "../hooks/useAxios";
import { LocalStorageHelper } from "../utils/localStorageHelper";
import { ApiEndpoint } from "../utils/ApiEndpoint/emsapiEndpoint";

interface CachedItem<T> {
  data: T;
  timestamp: number;
}

interface TResponse {}

interface CachedDataContextType<T> {
  responseData: T | null;
  error: any;
  loading: boolean;
  refetch: () => void;
  clearCache: () => void;
  addItem: (item: Partial<T>) => void;
  editItem: (key: string, updatedItem: Partial<T>) => void;
  deleteItem: (key: string) => void;
}

const CachedDataContext = createContext<CachedDataContextType<TResponse> | null>(null);

export const useCachedData = (options: {
  cacheKey?: string;
  cacheOptions?: { expirationTime?: number };
}): CachedDataContextType<TResponse> => {
  const [cachedData, setCachedData] = useState<TResponse | null>(() => {
    const cachedItem = LocalStorageHelper.getObject<CachedItem<TResponse>>(options.cacheKey || ApiEndpoint.allMaster.get_all_org_info);
    if (cachedItem) {
      const expirationTime = options.cacheOptions?.expirationTime || 5 * 60 * 1000; // Default to 5 minutes
      if (Date.now() - cachedItem.timestamp < expirationTime) {
        return cachedItem.data;
      }
    }
    return null;
  });

  const { responseData, error, loading, refetch } = useAxios<{}, TResponse>(ApiEndpoint.allMaster.get_all_org_info, {
    method: "post",
    loader: true,
    shouldFetch: cachedData === null,
  });

  const cacheKey = options.cacheKey || ApiEndpoint.allMaster.get_all_org_info;

  const setCachedDataToStorage = useCallback(
    (data: TResponse) => {
      const itemToCache: CachedItem<TResponse> = { data, timestamp: Date.now() };
      LocalStorageHelper.setObject(cacheKey, itemToCache);
      setCachedData(data);
    },
    [cacheKey],
  );

  const clearCache = useCallback(() => {
    LocalStorageHelper.removeItem(cacheKey);
    setCachedData(null);
  }, [cacheKey]);

  const addItem = useCallback(
    (item: Partial<TResponse>) => {
      if (cachedData && Array.isArray(cachedData)) {
        const updatedData = [...cachedData, item] as TResponse;
        setCachedData(updatedData);
        setCachedDataToStorage(updatedData);
      }
    },
    [cachedData, setCachedDataToStorage],
  );

  const editItem = useCallback(
    (key: string, updatedItem: Partial<TResponse>) => {
      if (cachedData && Array.isArray(cachedData)) {
        const updatedData = cachedData.map((item: any) =>
          item.key === key ? { ...item, ...updatedItem } : item
        ) as TResponse;
        setCachedData(updatedData);
        setCachedDataToStorage(updatedData);
      }
    },
    [cachedData, setCachedDataToStorage],
  );

  const deleteItem = useCallback(
    (key: string) => {
      if (cachedData && Array.isArray(cachedData)) {
        const updatedData = cachedData.filter((item: any) => item.key !== key) as TResponse;
        setCachedData(updatedData);
        setCachedDataToStorage(updatedData);
      }
    },
    [cachedData, setCachedDataToStorage],
  );

  useEffect(() => {
    if (responseData && cachedData === null) {
      setCachedDataToStorage(responseData);
    }
  }, [responseData, cachedData, setCachedDataToStorage]);

  return {
    responseData: cachedData,
    error,
    loading,
    refetch,
    clearCache,
    addItem,
    editItem,
    deleteItem,
  };
};

export const CachedDataProvider = CachedDataContext.Provider;

export const useCachedDataContext = () => {
  const context = useContext(CachedDataContext);
  if (context === null) {
    throw new Error("useCachedDataContext must be used within a CachedDataProvider");
  }
  return context;
};