import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Boxes, History, Search } from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { StockStatus } from '../types/dashboard';
import { formatNumber } from '../utils/format';
import { SelectField } from '../components/ui/SelectField';
import {
  bentoItemVariants,
  pageContainerVariants,
  SPRING_PILL,
} from '../components/ui/MotionPrimitives';

function getStockStatus(available: number): StockStatus {
  if (available <= 0) return 'out_of_stock';
  if (available <= 15) return 'low_stock';
  return 'in_stock';
}

const MOVEMENT_LABEL: Record<string, string> = {
  GRN: 'Nhập kho (GRN)',
  TRANSFER_OUT: 'Xuất điều chuyển',
  TRANSFER_IN: 'Nhận điều chuyển',
  ADJUSTMENT: 'Kiểm kê điều chỉnh',
  RETURN_RESTOCK: 'Nhập lại hàng trả',
  ORDER_RELEASE: 'Giải phóng giữ hàng',
};

export function InventoryPage() {
  const {
    selectedBranchId,
    categories,
    inventoryLevels,
    stockMovements,
    getBranchLabel,
  } = useAdminContext();

  const [activeTab, setActiveTab] = useState<'levels' | 'movements'>('levels');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StockStatus>('all');

  const filteredLevels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return inventoryLevels.filter((row) => {
      if (selectedBranchId !== 'all' && row.branchId !== selectedBranchId)
        return false;
      if (categoryFilter !== 'all' && row.categoryId !== categoryFilter)
        return false;
      const avail = Math.max(0, row.onHand - row.reserved);
      const st = getStockStatus(avail);
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (q) {
        return (
          row.sku.toLowerCase().includes(q) ||
          row.productName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inventoryLevels, selectedBranchId, categoryFilter, statusFilter, searchQuery]);

  const filteredMovements = useMemo(() => {
    if (selectedBranchId === 'all') return stockMovements;
    return stockMovements.filter((m) => m.branchId === selectedBranchId);
  }, [stockMovements, selectedBranchId]);

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full space-y-3.5"
    >
      {/* Header */}
      <motion.section
        variants={bentoItemVariants}
        className="w-full min-h-[62px] glass-card glass-card-subtle rounded-[16px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-[17px] xl:text-[19px] font-bold text-[#0F172A] tracking-[-0.02em]">
            Kiểm tra Tồn kho tại Chi nhánh
          </h2>
          <p className="text-[12px] text-[#475569] mt-0.5">
            Theo dõi chính xác số lượng thực tế, số lượng đang giữ cho đơn hàng và số lượng có thể bán theo từng biến thể SKU
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE] text-[12px] font-bold text-[#1D4ED8]">
          {getBranchLabel(selectedBranchId)}
        </span>
      </motion.section>

      {/* Tabs */}
      <motion.div
        variants={bentoItemVariants}
        className="inline-flex items-center gap-1 p-1 rounded-[12px] glass-card"
      >
        <button
          type="button"
          onClick={() => setActiveTab('levels')}
          className={`relative h-[34px] px-4 rounded-[9px] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'levels' ? 'text-white' : 'text-[#475569] hover:text-[#1D4ED8]'
          }`}
        >
          {activeTab === 'levels' && (
            <motion.div
              layoutId="inventory-page-pill"
              transition={SPRING_PILL}
              className="absolute inset-0 rounded-[9px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
            />
          )}
          <Boxes className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">
            Tồn kho chi tiết ({filteredLevels.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('movements')}
          className={`relative h-[34px] px-4 rounded-[9px] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'movements' ? 'text-white' : 'text-[#475569] hover:text-[#1D4ED8]'
          }`}
        >
          {activeTab === 'movements' && (
            <motion.div
              layoutId="inventory-page-pill"
              transition={SPRING_PILL}
              className="absolute inset-0 rounded-[9px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
            />
          )}
          <History className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">
            Lịch sử biến động kho ({filteredMovements.length})
          </span>
        </button>
      </motion.div>

      {activeTab === 'levels' ? (
        <>
          {/* Filter Bar */}
          <motion.section
            variants={bentoItemVariants}
            className="w-full min-h-[54px] glass-card rounded-[16px] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 relative z-20"
          >
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="w-full sm:w-[290px] h-[34px] rounded-[10px] border border-[#CBD5E1] focus-within:border-[#2563EB] px-3 flex items-center gap-2 bg-white/90">
                <Search className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
                  className="w-full bg-transparent text-[12px] outline-none"
                />
              </div>

              <SelectField
                value={categoryFilter}
                onChange={setCategoryFilter}
                className="w-[180px]"
                heightClass="h-[34px]"
                options={[
                  { value: 'all', label: 'Tất cả danh mục' },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />

              <SelectField
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as 'all' | StockStatus)}
                className="w-[175px]"
                heightClass="h-[34px]"
                options={[
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'in_stock', label: 'Còn hàng' },
                  { value: 'low_stock', label: 'Sắp hết (≤ 15)' },
                  { value: 'out_of_stock', label: 'Hết hàng (= 0)' },
                ]}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="h-[34px] px-3.5 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </motion.section>

          {/* Table */}
          <motion.section
            variants={bentoItemVariants}
            className="w-full glass-card rounded-[16px] overflow-x-auto"
          >
            <table className="w-full border-collapse min-w-[740px]">
              <thead>
                <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[42px]">
                  <th className="px-4 w-[155px]">Chi nhánh</th>
                  <th className="px-4 w-[130px]">Mã SKU</th>
                  <th className="px-4">Sản phẩm &amp; Biến thể</th>
                  <th className="px-4 w-[110px] text-right">Tồn thực tế</th>
                  <th className="px-4 w-[110px] text-right">Đang giữ</th>
                  <th className="px-4 w-[120px] text-right">Có thể bán</th>
                  <th className="px-4 w-[125px]">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
                {filteredLevels.map((row) => {
                  const avail = Math.max(0, row.onHand - row.reserved);
                  const st = getStockStatus(avail);
                  return (
                    <tr key={row.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[56px]">
                      <td className="px-4 font-semibold text-[#334155]">
                        {getBranchLabel(row.branchId)}
                      </td>
                      <td className="px-4 font-mono font-bold text-[#1D4ED8]">
                        {row.sku}
                      </td>
                      <td className="px-4">
                        <p className="font-semibold text-[#0F172A]">{row.productName}</p>
                        <p className="text-[11px] text-[#64748B]">{row.variantLabel}</p>
                      </td>
                      <td className="px-4 text-right font-semibold tabular-nums text-[#334155]">
                        {formatNumber(row.onHand)}
                      </td>
                      <td className="px-4 text-right tabular-nums text-[#64748B]">
                        {formatNumber(row.reserved)}
                      </td>
                      <td className="px-4 text-right font-extrabold tabular-nums text-[#0F172A]">
                        {formatNumber(avail)}
                      </td>
                      <td className="px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                            st === 'in_stock'
                              ? 'bg-[#DCFCE7]/90 text-[#15803D] border-[#BBF7D0]'
                              : st === 'low_stock'
                                ? 'bg-[#FEF3C7]/90 text-[#B45309] border-[#FDE68A]'
                                : 'bg-[#FEE2E2]/90 text-[#B91C1C] border-[#FECACA]'
                          }`}
                        >
                          {st === 'in_stock'
                            ? 'Còn hàng'
                            : st === 'low_stock'
                              ? 'Sắp hết'
                              : 'Hết hàng'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredLevels.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#64748B]">
                      Không tìm thấy sản phẩm phù hợp với điều kiện lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.section>
        </>
      ) : (
        <motion.section
          variants={bentoItemVariants}
          className="w-full glass-card rounded-[16px] overflow-x-auto"
        >
          <table className="w-full border-collapse min-w-[740px]">
            <thead>
              <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[42px]">
                <th className="px-4 w-[135px]">Thời gian</th>
                <th className="px-4 w-[150px]">Chi nhánh</th>
                <th className="px-4 w-[120px]">Mã SKU</th>
                <th className="px-4 w-[145px]">Nghiệp vụ</th>
                <th className="px-4 w-[90px] text-right">Biến động</th>
                <th className="px-4">Chứng từ &amp; Ghi chú</th>
                <th className="px-4 w-[130px]">Người thực hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
              {filteredMovements.map((m) => (
                <tr key={m.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[54px]">
                  <td className="px-4 tabular-nums text-[#64748B] text-[11.5px]">
                    {m.timestamp}
                  </td>
                  <td className="px-4 font-medium text-[#334155]">
                    {getBranchLabel(m.branchId)}
                  </td>
                  <td className="px-4 font-mono font-bold text-[#1D4ED8]">{m.sku}</td>
                  <td className="px-4 font-semibold text-[#0F172A]">
                    {MOVEMENT_LABEL[m.type] ?? m.type}
                  </td>
                  <td
                    className={`px-4 text-right font-extrabold tabular-nums ${
                      m.delta >= 0 ? 'text-[#15803D]' : 'text-[#DC2626]'
                    }`}
                  >
                    {m.delta >= 0 ? `+${m.delta}` : m.delta}
                  </td>
                  <td className="px-4">
                    <span className="font-mono text-[11px] font-bold text-[#1E3A8A] mr-2">
                      {m.referenceCode}
                    </span>
                    <span className="text-[#475569]">{m.note}</span>
                  </td>
                  <td className="px-4 text-[#475569]">{m.actorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.section>
      )}
    </motion.div>
  );
}
