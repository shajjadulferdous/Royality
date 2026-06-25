'use client';
import { Button } from '@heroui/react';
import React from 'react';
import { FiShield } from 'react-icons/fi';

const BuyCourse= ({price , productId, productTitle}) => {

    return (
         <Button variant="outline" onClick={handlePayment} className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#35858E] border-[#35858E] rounded-xl hover:bg-[#35858E]/10 transition-colors duration-200">
            <FiShield />
            Buy Now
        </Button>
    );
};

export default BuyCourse;