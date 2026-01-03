'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Este archivo existe solo para mantener la estructura
// La lógica principal está en page.tsx (raíz)
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página principal
    router.replace('/');
  }, [router]);

  return null;
}

