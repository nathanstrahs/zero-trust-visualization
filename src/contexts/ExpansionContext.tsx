import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the context type
interface ApplicableContextType {
  showIsApplicable: boolean;
  toggleApplicable: () => void;
}

// Define the context with a default value of null
const ApplicableContext = createContext<ApplicableContextType | null>(null);

// Define the provider props type
interface ApplicableProviderProps {
  children: ReactNode;
}

// Create the Provider component
export const ApplicableProvider = ({ children }: ApplicableProviderProps) => {
  const [showIsApplicable, setShowIsApplicable] = useState(false);
  
  console.log('CONTEXT: ExpansionProvider rendered, isExpanded:', showIsApplicable);

  const toggleApplicable = () => {
    console.log('CONTEXT: toggleExpanded called, current state:', showIsApplicable);
    setShowIsApplicable(prev => {
      const newValue = !prev;
      console.log('CONTEXT: Setting isExpanded from', prev, 'to', newValue);
      return newValue;
    });
  };

  const value = { showIsApplicable, toggleApplicable };

  return (
    <ApplicableContext.Provider value={value}>
      {children}
    </ApplicableContext.Provider>
  );
};

// Create the custom hook for easy consumption
export const useApplicable = () => {
  // Get the context
  const context = useContext(ApplicableContext);

  // If the context is null, it means we're using this hook outside of the provider.
  // This is a runtime check that ensures you've set up your component tree correctly.
  if (context === null) {
    throw new Error('useApplicable must be used within an ApplicableProvider');
  }

  return context;
};