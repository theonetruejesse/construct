import React, { createContext, useContext, useState, useCallback } from "react";

interface VTableContextType {
  refreshCounter: number;
  refreshTable: () => void;
}

const defaultContext: VTableContextType = {
  refreshCounter: 0,
  refreshTable: () => {},
};

const VTableContext = createContext<VTableContextType>(defaultContext);

export function VTableProvider({ children }: { children: React.ReactNode }) {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refreshTable = useCallback(() => {
    setRefreshCounter((prev) => prev + 1);
  }, []);

  return (
    <VTableContext.Provider value={{ refreshCounter, refreshTable }}>
      {children}
    </VTableContext.Provider>
  );
}

export function useVTable() {
  const context = useContext(VTableContext);
  if (!context) {
    throw new Error("useVTable must be used within a VTableProvider");
  }
  return context;
}
