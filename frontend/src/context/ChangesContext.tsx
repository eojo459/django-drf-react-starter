import React, { createContext, useContext } from 'react';

// Define the type for the context
type ChangesContextType = {
    handleNewChanges: (changes: boolean) => void;
};

// Create the context
const ChangesContext = createContext<ChangesContextType | undefined>(undefined);

// Create a provider component
export const ChangesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Your state or any other logic for the context
    const handleNewChanges = (changes: boolean) => {
        // Your implementation here
        console.log('Handling changes:', changes);
    };

    // Provide the context value
    const contextValue: ChangesContextType = {
        handleNewChanges,
    };

    return <ChangesContext.Provider value={contextValue}>{children}</ChangesContext.Provider>;
};

// Create a custom hook for accessing the context
export const useChangesContext = () => {
    const context = useContext(ChangesContext);
    if (!context) {
        throw new Error('useChangesContext must be used within a ChangesProvider');
    }
    return context;
};
