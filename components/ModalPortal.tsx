"use client";

import { useEffect, useState } from "react";

export default function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  // Ngelempar modal ke paling luar body, biar ga kena efek scroll halaman
  return typeof document !== "undefined"
    ? require("react-dom").createPortal(children, document.body)
    : null;
}