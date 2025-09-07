import React, { createContext, useContext, useState } from "react";

interface CashierContextType {
  openTabsModalVisible: boolean;
  setOpenTabsModalVisible: (visible: boolean) => void;
}

const CashierContext = createContext<CashierContextType>(
  {} as CashierContextType
);

export const CashierProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [openTabsModalVisible, setOpenTabsModalVisible] = useState(false);
  return (
    <CashierContext.Provider
      value={{ openTabsModalVisible, setOpenTabsModalVisible }}
    >
      {children}
    </CashierContext.Provider>
  );
};

export const useCashier = () => useContext(CashierContext);
