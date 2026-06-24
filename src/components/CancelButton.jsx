import { Button } from '@heroui/react';
import React from 'react';

const CancelButton = ({transactionId}) => {
    const handleCancelAction = async () => {
        'use server';
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/cancel/${transactionId}`, { 
                method: 'PATCH', 
                headers:{
                    'Content-Type': 'application/json'
                }
            });
            revalidatePath('/user/transaction'); 
        } catch (error) {
            console.error("Failed to cancel transaction:", error);
        }
    };
    return (
        <Button onClick={handleCancelAction} variant='danger'>Cancel</Button>
    );
};

export default CancelButton;