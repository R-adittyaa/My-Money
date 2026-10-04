"use client";

import { useState } from "react";

type Props = {
  name: string;
  defaultValue?: number;
  required?: boolean;
};

export default function AmountInput({ name, defaultValue, required }: Props) {
  const [display, setDisplay] = useState(
    defaultValue ? defaultValue.toLocaleString("id-ID") : ""
  );

  const rawValue = display.replace(/\./g, "").replace(/\D/g, "");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length > 15) return;
    const formatted = digits ? Number(digits).toLocaleString("id-ID") : "";
    setDisplay(formatted);
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400 pointer-events-none z-10">
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        required={required}
        placeholder="0"
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 tabular-nums font-medium"
      />
      <input type="hidden" name={name} value={rawValue} />
    </div>
  );
}