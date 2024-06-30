import React, { createContext, useContext, useState } from 'react';

type GlobalStateContextType = {
    unsavedChanges: boolean;
    userUid: string;
    businessUid: string;
    businessPlanUid: number;
    setUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
    setUserUid: React.Dispatch<React.SetStateAction<string>>;
    setBusinessUid: React.Dispatch<React.SetStateAction<string>>;
    setBusinessPlanUid: React.Dispatch<React.SetStateAction<number>>;
};

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
    const [userUid, setUserUid] = useState<string>('');
    const [businessUid, setBusinessUid] = useState<string>('');
    const [businessPlanUid, setBusinessPlanUid] = useState<number>(0);

    const contextValue: GlobalStateContextType = {
        unsavedChanges: unsavedChanges,
        userUid: userUid,
        businessUid: businessUid,
        businessPlanUid: businessPlanUid,
        setUnsavedChanges: setUnsavedChanges,
        setUserUid: setUserUid,
        setBusinessUid: setBusinessUid,
        setBusinessPlanUid: setBusinessPlanUid,
    };
    return <GlobalStateContext.Provider value={contextValue}>{children}</GlobalStateContext.Provider>;
};

export const useGlobalState = () => {
    const context = useContext(GlobalStateContext);
    if (!context) {
        throw new Error('useGlobalState must be used within a GlobalStateProvider');
    }
    return context;
};
