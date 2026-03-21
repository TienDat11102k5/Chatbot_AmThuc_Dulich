/**
 * AiTrainingData.jsx — Trang Dữ liệu Huấn luyện AI (Admin).
 *
 * Hiển thị:
 * - Card insight: số liệu tổng quan (total intents, total samples)
 * - Bảng intents: tag + số mẫu + câu ví dụ
 * - Form thêm intent: UI giữ, nút "Lưu" → toast thông báo đang phát triển
 * - Skeleton loading + Error state + Retry
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Database, BookOpen, Plus, X, Save,
  AlertCircle, RefreshCw, Tag, FileText, Info
} from 'lucide-react';
import aiAdminService from '../../../lib/aiAdminService';

// ─── Skeleton Loading ────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-200" />
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-28 mb-2" />
        <div className="h-7 bg-slate-200 rounded w-14" />
      </div>
    </div>
  </div>
);

const IntentRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-6" /></td>
    <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-28" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12" /></td>
    <td className="px-6 py-4">
      <div className="flex gap-2">
        <div className="h-6 bg-slate-200 rounded-lg w-32" />
        <div className="h-6 bg-slate-200 rounded-lg w-28" />
      </div>
    </td>
  </tr>
);

// ─── Error State ─────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-500">
      <AlertCircle size={32} />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">Không thể tải dữ liệu</h3>
    <p className="text-slate-500 mb-6 max-w-md">{message || 'Có lỗi xảy ra khi kết nối đến AI Service.'}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition"
    >
      <RefreshCw size={16} /> Thử lại
    </button>
  </div>
);

// ─── Intent Color Map ────────────────────────────────────────────────────────
const INTENT_COLORS = {
  tim_mon_an: 'bg-orange-100 text-orange-700 border-orange-200',
  tim_dia_diem: 'bg-blue-100 text-blue-700 border-blue-200',
  hoi_thoi_tiet: 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

const getIntentColor = (tag) => INTENT_COLORS[tag] || 'bg-slate-100 text-slate-700 border-slate-200';

// ─── Component chính ─────────────────────────────────────────────────────────
const AiTrainingData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch intents
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiAdminService.getIntents();
      setData(res);
    } catch (err) {
      console.error('[AiTrainingData] Lỗi fetch:', err);
      setError(err.response?.data?.message || err.message || 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Show toast
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle save (tính năng đang phát triển)
  const handleSave = () => {
    showToast('🚧 Tính năng thêm intent đang được phát triển. Cần retrain model AI sau khi thêm dữ liệu mới.', 'warning');
  };

  // ─── Render Error ──────────────────────────────────────────────────────────
  if (error && !data) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Dữ liệu Huấn luyện</h1>
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border flex items-center gap-3 transition-all animate-slide-in ${
          toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <Info size={16} className={toast.type === 'warning' ? 'text-amber-500' : 'text-blue-500'} />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dữ liệu Huấn luyện</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý bộ dữ liệu intent cho AI chatbot</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Đóng' : 'Thêm Intent'}
          </button>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {loading && !data ? (
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                  <Tag size={22} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Tổng Intents</p>
                  <p className="text-2xl font-bold text-slate-900">{data?.total_intents || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileText size={22} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Tổng Mẫu câu</p>
                  <p className="text-2xl font-bold text-slate-900">{data?.total_samples || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <BookOpen size={22} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Trung bình/Intent</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {data?.total_intents > 0 ? Math.round(data.total_samples / data.total_intents) : 0}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Intent Form (collapsible) */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Thêm Intent mới</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên Intent</label>
              <input
                type="text"
                placeholder="VD: tim_khach_san"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số mẫu câu</label>
              <input
                type="number"
                placeholder="20"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Câu mẫu (mỗi dòng 1 câu)</label>
            <textarea
              rows={3}
              placeholder={"Khách sạn 5 sao ở Đà Nẵng\nTìm phòng nghỉ gần biển\nHotel giá rẻ Hội An"}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition"
            >
              <Save size={14} /> Lưu Intent
            </button>
          </div>
          {/* Info banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
            <Info size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Để thêm intent mới cần retrain model SVM. Tính năng này đang được phát triển và sẽ sớm hoàn thiện.
            </p>
          </div>
        </div>
      )}

      {/* Intents Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <Database size={18} className="text-slate-500" />
          <h2 className="text-lg font-bold text-slate-900">Bảng Intents</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">STT</th>
                <th className="px-6 py-3 font-semibold">Intent</th>
                <th className="px-6 py-3 font-semibold">Số mẫu</th>
                <th className="px-6 py-3 font-semibold">Câu ví dụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !data
                ? Array.from({ length: 3 }).map((_, i) => <IntentRowSkeleton key={i} />)
                : data?.intents?.length > 0
                ? data.intents.map((intent, idx) => (
                    <tr key={intent.tag} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getIntentColor(intent.tag)}`}>
                          {intent.tag}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">{intent.sample_count}</span>
                        <span className="text-xs text-slate-400 ml-1">mẫu</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {intent.examples.slice(0, 3).map((ex, i) => (
                            <span
                              key={i}
                              className="inline-block px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 max-w-[200px] truncate"
                              title={ex}
                            >
                              {ex}
                            </span>
                          ))}
                          {intent.examples.length > 3 && (
                            <span className="text-xs text-slate-400 self-center">
                              +{intent.examples.length - 3} khác
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        Chưa có dữ liệu intent nào
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Banner */}
      {error && data && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">{error}</p>
          <button onClick={fetchData} className="text-sm font-semibold text-amber-700 hover:text-amber-900 ml-auto">
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};

export default AiTrainingData;
