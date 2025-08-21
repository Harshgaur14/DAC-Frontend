'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/Component/Navbar';



export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const loggedIn = localStorage.getItem('loggedIn');

    if (!token || loggedIn !== 'true') {
      router.push('/');
    } else {
      // In future, decode token here to get username
      setUsername('User'); // Placeholder
      setIsLoading(false);
    }
  }, [router]);

 

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-800 text-white">
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div>
 <Navbar />
<div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-gray-50 text-gray-800 p-2">
    
      <div className="max-w-4xl mx-auto">
  

        
      </div>
    </div>
    </div>
  );
}
