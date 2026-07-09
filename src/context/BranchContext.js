"use client";

import { createContext, useContext, useState } from "react";

const BranchContext = createContext(null);

export function BranchProvider({ children, branches = [] }) {
  const [selectedBranch, setSelectedBranch] = useState("all");

  return (
    <BranchContext.Provider value={{ branches, selectedBranch, setSelectedBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);

  if (!context) {
    return {
      branches: [],
      selectedBranch: "all",
      setSelectedBranch: () => {},
    };
  }

  return context;
}