'use client';
import { Button } from '@heroui/react';
import React from 'react';
import { FiShield } from 'react-icons/fi';

const BuyCourse= () => {
    const handlePayment = async()=>{
          const response = await fetch('/api/checkout_sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
         
        if (!response.ok) {
             console.error('Failed to create checkout session. Please try again.');
             return;
        }
        const data = await response.json();
        window.location.href = data.url;
    }
    return (
         <Button variant="outline" onClick={handlePayment} className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#35858E] border-[#35858E] rounded-xl hover:bg-[#35858E]/10 transition-colors duration-200">
            <FiShield />
            Buy Now
        </Button>
    );
};

export default BuyCourse;