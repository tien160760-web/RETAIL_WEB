import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  heightClass?: string;
  disabled?: boolean;
}

export function SelectField({
  value,
  options,
  onChange,
  placeholder = 'Chọn...',
  className = 'w-full',
  heightClass = 'h-[36px]',
  disabled = false,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full ${heightClass} rounded-[10px] border px-3 flex items-center justify-between text-[12px] font-medium transition-all duration-200 outline-none ${
          disabled
            ? 'bg-[#F1F5F9]/80 border-[#CBD5E1] text-[#64748B] cursor-not-allowed'
            : open
              ? 'bg-white border-[#2563EB] text-[#0F172A] shadow-[0_0_0_3px_rgba(37,99,235,0.14)] cursor-pointer'
              : 'bg-white/90 border-[#CBD5E1] hover:border-[#60A5FA] text-[#0F172A] cursor-pointer'
        }`}
      >
        <span className={`truncate ${selected ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 ml-2 transition-transform duration-200 ${
            open ? 'rotate-180 text-[#2563EB]' : 'text-[#64748B]'
          }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 top-[calc(100%+6px)] min-w-full w-max max-w-[280px] glass-popover rounded-[12px] py-1.5 z-50 max-h-[220px] overflow-y-auto admin-scroll">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-3.5 py-2 text-left text-[12px] flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  active
                    ? 'font-bold text-[#1D4ED8] bg-[#EFF6FF]'
                    : 'text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {active && <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
