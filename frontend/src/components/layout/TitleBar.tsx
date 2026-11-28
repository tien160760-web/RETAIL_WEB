interface TitleBarProps {
  title: string;
  contextBadge: string;
}

export function TitleBar({ title, contextBadge }: TitleBarProps) {
  return (
    <header className="h-[44px] w-full shrink-0 bg-gradient-to-r from-[#0B1736] via-[#102556] to-[#163A84] border-b border-[#60A5FA]/25 px-3 sm:px-[24px] flex items-center justify-between gap-2 select-none relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[320px] bg-[radial-gradient(ellipse_at_left,rgba(59,130,246,0.28),transparent_70%)]" />
      <div className="flex items-center gap-2.5 min-w-0 relative">
        <span className="w-2 h-2 rounded-full bg-[#60A5FA] shadow-[0_0_10px_rgba(96,165,250,0.95)] shrink-0" />
        <h1 className="text-[13.5px] sm:text-[14px] font-bold text-white tracking-[-0.01em] truncate">
          {title}
        </h1>
      </div>
      <span className="hidden sm:inline-flex relative px-3.5 h-[26px] rounded-full bg-white/10 backdrop-blur-md border border-[#93C5FD]/30 items-center justify-center text-[11px] font-semibold text-[#EFF6FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] shrink-0">
        {contextBadge}
      </span>
    </header>
  );
}
