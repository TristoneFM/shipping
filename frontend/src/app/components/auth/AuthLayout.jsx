// components/AuthLayout.js
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDelivery } from '@/app/context/DeliveryContext';

export default function AuthLayout({ children }) {
  const { employee } = useDelivery();
  const router = useRouter();

  useEffect(() => {
    if (!employee) {
      router.push('/'); 
    }
  }, [employee, router]);

  if (!employee) return null; 

  return <>{children}</>;
}
