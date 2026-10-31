"use client";

import { useState } from "react";
import ShareCard from "./ShareCard";

type Props = {
  balance: number;
  income: number;
  expense: number;
  monthLabel: string;
};

export default function ShareDashboardButton({ balance, income, expense, monthLabel }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full text-white transition z-20">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
      </button>

      {isOpen && (
        <ShareCard 
          type="dashboard" 
          data={{ balance, income, expense, monthLabel }} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}