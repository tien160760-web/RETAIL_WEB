export function formatVND(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} ₫`;
}

export function formatCompactVND(amount: number): string {
  if (amount >= 1_000_000_000) {
    const val = (amount / 1_000_000_000).toFixed(1).replace('.', ',');
    return `${val.endsWith(',0') ? val.slice(0, -2) : val} tỷ`;
  }
  if (amount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(0);
    return `${val} tr`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)}k`;
  }
  return `${amount}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(value));
}

export function formatDateVN(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatPercent(value: number): string {
  const abs = Math.abs(value).toFixed(1).replace('.', ',');
  return `${abs}%`;
}

export function getPresetDateRange(preset: 'today' | '7d' | '30d' | 'month'): {
  startDate: string;
  endDate: string;
} {
  // Reference date matching project timeline (19/11/2026)
  const end = new Date(2026, 10, 19);
  const start = new Date(end);

  if (preset === '7d') {
    start.setDate(end.getDate() - 6);
  } else if (preset === '30d') {
    start.setDate(end.getDate() - 29);
  } else if (preset === 'month') {
    start.setDate(1);
  }

  const toISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return {
    startDate: toISO(start),
    endDate: toISO(end),
  };
}
