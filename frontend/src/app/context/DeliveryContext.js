// app/context/DeliveryContext.js
'use client';
import { createContext, useContext, useState } from 'react';

// Create context
const DeliveryContext = createContext();

// Create a provider component
export const DeliveryProvider = ({ children }) => {
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [employee, setEmployee] = useState('');
  const [role, setRole] = useState('');

  return (
    <DeliveryContext.Provider value={{ selectedDelivery, setSelectedDelivery, employee, setEmployee, role, setRole }}>
      {children}
    </DeliveryContext.Provider>
  );
};

// Create a custom hook to use the context
export const useDelivery = () => useContext(DeliveryContext);
