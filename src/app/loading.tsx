"use client";

export default function Loading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 p-6">
      {/* Tactical Spinner */}
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-8 h-8 bg-indigo-600/10 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] animate-pulse">
          Synchronizing Node
        </p>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          Retrieving Grid Telemetry...
        </p>
      </div>

      {/* Skeleton Blocks */}
      <div className="w-full max-w-2xl space-y-4 pt-10">
         <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse" />
         <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
         <div className="h-4 bg-slate-100 rounded-full w-5/6 animate-pulse" />
      </div>
    </div>
  );
}
