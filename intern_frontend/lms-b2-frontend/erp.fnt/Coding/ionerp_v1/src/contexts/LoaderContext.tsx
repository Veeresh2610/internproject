import React, { useState, useContext, createContext } from "react";

interface LoaderContextProps {
  loading: boolean;
  loadingText?: string;
  setLoading: (loading: boolean, loadingText?: string) => void;
}

const LoaderContext = createContext<LoaderContextProps | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string>('Please wait...');

  const setLoadingWithText = (isLoading: boolean, text?: string) => {
    setLoading(isLoading);
    setLoadingText(text ?? 'Please wait...');
  };

  return <LoaderContext.Provider value={{ loading, loadingText, setLoading: setLoadingWithText }}>{children}</LoaderContext.Provider>;
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};
