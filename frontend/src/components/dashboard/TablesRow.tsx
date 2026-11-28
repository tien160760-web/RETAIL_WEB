import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Package } from 'lucide-react';
import {
  BranchInventoryRow,
  ProductSalesRow,
  SkuBranchMatrixRow,
  StockStatus,
} from '../../types/dashboard';
import { formatCompactVND, formatNumber } from '../../utils/format';
import {
  EXPO_EASE,
  SpotlightGlassCard,
  SPRING_PILL,
} from '../ui/MotionPrimitives';

interface TablesRowProps {
  topProducts: ProductSalesRow[];
  slowProducts: ProductSalesRow[];
  branchInventory: BranchInventoryRow[];
  skuMatrix: SkuBranchMatrixRow[];
  isLoading: boolean;
}

const STOCK_BADGE: Record<
  StockStatus,
  { label: string; className: string }
> = {
  in_stock: {
    label: 'Còn hàng',
    className: 'bg-[#DCFCE7]/90 text-[#15803D] border-[#BBF7D0]',
  },
  low_stock: {
    label: 'Sắp hết',
    className: 'bg-[#FEF3C7]/90 text-[#B45309] border-[#FDE68A]',
  },
  out_of_stock: {
    label: 'Hết hàng',
    className: 'bg-[#FEE2E2]/90 text-[#B91C1C] border-[#FECACA]',
  },
};

export function TablesRow({
  topProducts,
  slowProducts,
  branchInventory,
  skuMatrix,
  isLoading,
}: TablesRowProps) {
  const navigate = useNavigate();
  const [productTab, setProductTab] = useState<'top' | 'slow'>('top');
  const [inventoryTab, setInventoryTab] = useState<'summary' | 'matrix'>('summary');

  const activeProducts = productTab === 'top' ? topProducts : slowProducts;

  const totalOnHand = branchInventory.reduce((s, b) => s + b.onHand, 0);
  const totalReserved = branchInventory.reduce((s, b) => s + b.reserved, 0);
  const totalAvailable = branchInventory.reduce((s, b) => s + b.available, 0);

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 w-full">
        <div className="min-h-[330px] glass-card rounded-[16px] p-4 space-y-3">
          <div className="h-5 w-56 bg-[#DBEAFE] rounded-full animate-pulse" />
          <div className="h-[250px] w-full bg-[#EFF6FF]/70 rounded-xl animate-pulse" />
        </div>
        <div className="min-h-[330px] glass-card rounded-[16px] p-4 space-y-3">
          <div className="h-5 w-56 bg-[#DBEAFE] rounded-full animate-pulse" />
          <div className="h-[250px] w-full bg-[#EFF6FF]/70 rounded-xl animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 w-full">
      {/* Left Card: Best & Slow Selling Products */}
      <SpotlightGlassCard
        lift={-3}
        className="w-full min-w-0 rounded-[16px] px-4 py-3.5 flex flex-col"
      >
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3 shrink-0">
          <h3 className="text-[13.5px] xl:text-[14.5px] font-bold text-[#0F172A] tracking-[-0.01em] truncate">
            Sản phẩm Bán chạy &amp; Bán chậm
          </h3>

          <div className="h-[28px] rounded-[9px] border border-[#DBEAFE] bg-[#EFF6FF]/90 p-[2px] flex items-center gap-[2px] shrink-0">
            <button
              type="button"
              onClick={() => setProductTab('top')}
              className={`relative px-2.5 h-[22px] rounded-[6px] text-[11px] font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                productTab === 'top'
                  ? 'text-white'
                  : 'text-[#475569] hover:text-[#1D4ED8]'
              }`}
            >
              {productTab === 'top' && (
                <motion.div
                  layoutId="product-tab-pill"
                  transition={SPRING_PILL}
                  className="absolute inset-0 rounded-[6px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_2px_8px_rgba(37,99,235,0.42)]"
                />
              )}
              <span className="relative z-10">Bán chạy</span>
            </button>
            <button
              type="button"
              onClick={() => setProductTab('slow')}
              className={`relative px-2.5 h-[22px] rounded-[6px] text-[11px] font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                productTab === 'slow'
                  ? 'text-white'
                  : 'text-[#475569] hover:text-[#1D4ED8]'
              }`}
            >
              {productTab === 'slow' && (
                <motion.div
                  layoutId="product-tab-pill"
                  transition={SPRING_PILL}
                  className="absolute inset-0 rounded-[6px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_2px_8px_rgba(37,99,235,0.42)]"
                />
              )}
              <span className="relative z-10">Bán chậm</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 flex-1 min-h-0 border border-[#DBEAFE] rounded-[12px] overflow-x-auto bg-white/75">
          <AnimatePresence mode="wait">
            <motion.div
              key={productTab}
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
              transition={{ duration: 0.24, ease: EXPO_EASE }}
            >
              <table className="w-full border-collapse table-fixed min-w-[440px]">
                <thead>
                  <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[11px] font-bold text-[#1E3A8A] h-[38px]">
                    <th className="px-2.5 w-[40%]">Sản phẩm / SKU</th>
                    <th className="px-2 w-[12%] text-right">SL</th>
                    <th className="px-2 w-[24%]">Doanh thu</th>
                    <th className="px-2 w-[24%]">Tồn khả dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFF6FF] text-[11.5px]">
                  {activeProducts.map((item, idx) => {
                    const badge = STOCK_BADGE[item.stockStatus];
                    return (
                      <motion.tr
                        key={item.sku}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.045, duration: 0.32, ease: EXPO_EASE }}
                        className="hover:bg-[#EFF6FF]/70 transition-colors h-[54px]"
                      >
                        <td className="px-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-6 h-6 rounded-[7px] shrink-0 flex items-center justify-center text-white shadow-[0_3px_8px_rgba(37,99,235,0.2)]"
                              style={{ backgroundColor: item.colorHex }}
                            >
                              <Package className="w-3 h-3" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#0F172A] truncate leading-tight">
                                {item.name}
                              </p>
                              <p className="text-[10px] font-mono text-[#64748B] truncate mt-0.5">
                                {item.sku} · {item.variantLabel}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-2 text-right font-semibold text-[#334155] tabular-nums">
                          {formatNumber(item.soldQty)}
                        </td>

                        <td className="px-2">
                          <div className="flex items-center justify-between text-[10.5px] mb-1 tabular-nums">
                            <span className="font-semibold text-[#0F172A]">
                              {formatCompactVND(item.revenue)}
                            </span>
                            <span className="font-bold text-[#2563EB]">
                              {item.revenueSharePct}%
                            </span>
                          </div>
                          <div className="w-full h-[5px] rounded-full bg-[#DBEAFE]/80 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, item.revenueSharePct)}%` }}
                              transition={{ delay: 0.15 + idx * 0.06, duration: 0.7, ease: EXPO_EASE }}
                              className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA]"
                            />
                          </div>
                        </td>

                        <td className="px-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10.5px] font-semibold whitespace-nowrap ${badge.className}`}
                          >
                            <span>{badge.label}</span>
                            <span className="tabular-nums">({item.availableStock})</span>
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>
        </div>
      </SpotlightGlassCard>

      {/* Right Card: Branch Inventory & SKU Matrix */}
      <SpotlightGlassCard
        lift={-3}
        className="w-full min-w-0 rounded-[16px] px-4 py-3.5 flex flex-col"
      >
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3 shrink-0">
          <h3 className="text-[13.5px] xl:text-[14.5px] font-bold text-[#0F172A] tracking-[-0.01em] truncate">
            Báo cáo Tồn kho theo Chi nhánh
          </h3>

          <div className="h-[28px] rounded-[9px] border border-[#DBEAFE] bg-[#EFF6FF]/90 p-[2px] flex items-center gap-[2px] shrink-0">
            <button
              type="button"
              onClick={() => setInventoryTab('summary')}
              className={`relative px-2.5 h-[22px] rounded-[6px] text-[11px] font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                inventoryTab === 'summary'
                  ? 'text-white'
                  : 'text-[#475569] hover:text-[#1D4ED8]'
              }`}
            >
              {inventoryTab === 'summary' && (
                <motion.div
                  layoutId="inventory-tab-pill"
                  transition={SPRING_PILL}
                  className="absolute inset-0 rounded-[6px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_2px_8px_rgba(37,99,235,0.42)]"
                />
              )}
              <span className="relative z-10">Tổng hợp CN</span>
            </button>
            <button
              type="button"
              onClick={() => setInventoryTab('matrix')}
              className={`relative px-2.5 h-[22px] rounded-[6px] text-[11px] font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                inventoryTab === 'matrix'
                  ? 'text-white'
                  : 'text-[#475569] hover:text-[#1D4ED8]'
              }`}
            >
              {inventoryTab === 'matrix' && (
                <motion.div
                  layoutId="inventory-tab-pill"
                  transition={SPRING_PILL}
                  className="absolute inset-0 rounded-[6px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_2px_8px_rgba(37,99,235,0.42)]"
                />
              )}
              <span className="relative z-10">Ma trận SKU</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 flex-1 min-h-0 border border-[#DBEAFE] rounded-[12px] overflow-x-auto bg-white/75">
          <AnimatePresence mode="wait">
            {inventoryTab === 'summary' ? (
              <motion.div
                key="inv-summary"
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                transition={{ duration: 0.24, ease: EXPO_EASE }}
              >
                <table className="w-full border-collapse table-fixed min-w-[440px]">
                  <thead>
                    <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[11px] font-bold text-[#1E3A8A] h-[38px]">
                      <th className="px-2.5 w-[31%]">Chi nhánh</th>
                      <th className="px-1.5 w-[14%] text-right">Thực tế</th>
                      <th className="px-1.5 w-[14%] text-right">Đang giữ</th>
                      <th className="px-1.5 w-[15%] text-right">Khả dụng</th>
                      <th className="px-2.5 w-[26%]">Cảnh báo tồn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFF6FF] text-[11.5px]">
                    {branchInventory.map((row, idx) => (
                      <motion.tr
                        key={row.branchId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.045, duration: 0.32, ease: EXPO_EASE }}
                        className="hover:bg-[#EFF6FF]/70 transition-colors h-[54px]"
                      >
                        <td className="px-2.5 font-semibold text-[#0F172A] truncate">
                          {row.branchName}
                        </td>
                        <td className="px-1.5 text-right text-[#334155] tabular-nums">
                          {formatNumber(row.onHand)}
                        </td>
                        <td className="px-1.5 text-right text-[#64748B] tabular-nums">
                          {formatNumber(row.reserved)}
                        </td>
                        <td className="px-1.5 text-right font-bold text-[#0F172A] tabular-nums">
                          {formatNumber(row.available)}
                        </td>
                        <td className="px-2.5">
                          {row.warningType === 'low' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF3C7]/90 text-[#B45309] border border-[#FDE68A] text-[10.5px] font-semibold whitespace-nowrap">
                              {row.warningLabel}
                            </span>
                          )}
                          {row.warningType === 'out' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEE2E2]/90 text-[#B91C1C] border border-[#FECACA] text-[10.5px] font-semibold whitespace-nowrap">
                              {row.warningLabel}
                            </span>
                          )}
                          {row.warningType === 'normal' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#DCFCE7]/90 text-[#15803D] border border-[#BBF7D0] text-[10.5px] font-semibold whitespace-nowrap">
                              {row.warningLabel}
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}

                    {/* Total Row */}
                    <tr className="bg-[#EFF6FF]/75 font-bold text-[#0F172A] h-[54px]">
                      <td className="px-2.5 text-[#1E3A8A] truncate">Tổng hệ thống</td>
                      <td className="px-1.5 text-right tabular-nums">
                        {formatNumber(totalOnHand)}
                      </td>
                      <td className="px-1.5 text-right tabular-nums">
                        {formatNumber(totalReserved)}
                      </td>
                      <td className="px-1.5 text-right text-[#2563EB] tabular-nums">
                        {formatNumber(totalAvailable)}
                      </td>
                      <td className="px-2.5">
                        <button
                          type="button"
                          onClick={() => navigate('/warehouse-tickets')}
                          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:translate-x-1 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <span>Chuyển kho</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <motion.div
                key="inv-matrix"
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                transition={{ duration: 0.24, ease: EXPO_EASE }}
              >
                <table className="w-full border-collapse table-fixed min-w-[440px]">
                  <thead>
                    <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[11px] font-bold text-[#1E3A8A] h-[38px]">
                      <th className="px-2.5 w-[38%]">Biến thể SKU</th>
                      <th className="px-1.5 w-[15%] text-center">CN HN</th>
                      <th className="px-1.5 w-[15%] text-center">CN ĐN</th>
                      <th className="px-1.5 w-[15%] text-center">CN HCM</th>
                      <th className="px-2.5 w-[17%] text-right">Tổng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFF6FF] text-[11.5px]">
                    {skuMatrix.slice(0, 4).map((row, idx) => (
                      <motion.tr
                        key={row.sku}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.045, duration: 0.32, ease: EXPO_EASE }}
                        className="hover:bg-[#EFF6FF]/70 transition-colors h-[54px]"
                      >
                        <td className="px-2.5">
                          <p className="font-semibold text-[#0F172A] truncate leading-tight">
                            {row.productName}
                          </p>
                          <p className="text-[10px] font-mono text-[#64748B] truncate mt-0.5">
                            {row.sku} · {row.variantLabel}
                          </p>
                        </td>
                        {(['cn-hn', 'cn-dn', 'cn-hcm'] as const).map((bId) => {
                          const qty = row.stockByBranch[bId];
                          const pillStyle =
                            qty === 0
                              ? 'bg-[#FEE2E2]/90 text-[#B91C1C]'
                              : qty < 15
                                ? 'bg-[#FEF3C7]/90 text-[#B45309]'
                                : 'bg-[#EFF6FF] text-[#1D4ED8]';
                          return (
                            <td
                              key={bId}
                              className="px-1.5 text-center tabular-nums"
                            >
                              <span
                                className={`inline-block min-w-[32px] px-1.5 py-0.5 rounded-full font-semibold text-[11px] ${pillStyle}`}
                              >
                                {qty}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-2.5 text-right font-bold text-[#0F172A] tabular-nums">
                          {formatNumber(row.totalAvailable)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SpotlightGlassCard>
    </section>
  );
}
