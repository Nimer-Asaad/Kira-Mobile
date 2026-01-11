import React, { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../utils/constants";
import { storage } from "../utils/storage";

type Mode = "company" | "personal" | null;

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => Promise<void>;
  isCompany: boolean;
  isPersonal: boolean;
  isLoading: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<Mode>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load mode from storage on mount
  useEffect(() => {
    const loadMode = async () => {
      try {
        const savedMode = await storage.getItem(STORAGE_KEYS.KIRA_MODE);
        if (savedMode === "company" || savedMode === "personal") {
          setModeState(savedMode);
        }
      } catch (error) {
        console.error("Error loading mode:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMode();
  }, []);

  // Save mode to storage when it changes
  const setMode = async (newMode: Mode) => {
    try {
      if (newMode) {
        await storage.setItem(STORAGE_KEYS.KIRA_MODE, newMode);
      } else {
        await storage.removeItem(STORAGE_KEYS.KIRA_MODE);
      }
      setModeState(newMode);
    } catch (error) {
      console.error("Error saving mode:", error);
      throw error;
    }
  };

  const value: ModeContextType = {
    mode,
    setMode,
    isCompany: mode === "company",
    isPersonal: mode === "personal",
    isLoading,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};

export const useMode = (): ModeContextType => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within ModeProvider");
  }
  return context;
};
