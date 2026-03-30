"use client";

import React from "react";
import { X } from "lucide-react";
import SettingsPage from "@/app/dashboard/settings/page"; // reuse your file

export default function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      
      {/* Modal Box */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">

        {/* Close Button */}
        <button
        title="setting"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
        >
          <X size={18} />
        </button>

        {/* Your FULL Settings UI */}
        <SettingsPage />
      </div>
    </div>
  );
}