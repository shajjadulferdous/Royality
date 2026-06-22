'use client';
import { Button } from '@heroui/react';
import React from 'react';
import toast from 'react-hot-toast';

const ApproveButton = ({ productId }) => {
     const handleApprove = async()=>{
          const data = { status: 'approved' };
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${productId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
         
        if (!response.ok) {
             toast.error('Failed to approve product. Please try again.');
             return;
        }
        return await response.json();
    }
    return (
       <Button
            onClick={handleApprove}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors duration-200 shadow-sm shadow-green-100"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Approve
        </Button>
);
};

export default ApproveButton;