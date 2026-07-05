import { useState } from 'react';
import { toast } from 'react-toastify';
// import Loader from '../components/Loader';

const useLoaderAndToast = <T extends any>(apiCall: () => Promise<T>) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeApiCall = async () => {
    setLoading(true);
    setError(null); // Clear previous error
    try {
      const result = await apiCall(); // Execute API call
      setData(result); // Save data
      toast.success('Request was successful!');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast.error(`Error: ${err.message || 'Failed to load data'}`);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return { loading, data, error, executeApiCall };
};

export default useLoaderAndToast;
