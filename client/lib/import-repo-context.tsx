'use client';

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import { ImportRepoModal } from '@/components/modals/ImportRepoModal';

interface ImportRepoContextValue {
  openImportRepo: () => void;
}

const ImportRepoContext = createContext<ImportRepoContextValue>({
  openImportRepo: () => {},
});

export function useImportRepo() {
  return useContext(ImportRepoContext);
}

export function ImportRepoProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openImportRepo = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <ImportRepoContext.Provider value={{ openImportRepo }}>
      {children}
      <ImportRepoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </ImportRepoContext.Provider>
  );
}
