import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTheme } from './ThemeContext';

interface LayoutContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  layout: 'VERTICAL' | 'HORIZONTAL';
  setLayout: (layout: 'VERTICAL' | 'HORIZONTAL') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize layout from localStorage, default to VERTICAL
  const [layout, setLayout] = useState<'VERTICAL' | 'HORIZONTAL'>(() => {
    const savedLayout = localStorage.getItem('layoutMode');
    return savedLayout ? JSON.parse(savedLayout) : 'VERTICAL';
  });

  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Update localStorage when layout changes
  useEffect(() => {
    localStorage.setItem('layoutMode', JSON.stringify(layout));
  }, [layout]);

  return (
    <LayoutContext.Provider value={{
      sidebarOpen,
      toggleSidebar,
      layout,
      setLayout,
      theme,
      toggleTheme
    }}>
      {children}
    </LayoutContext.Provider>
  );
};