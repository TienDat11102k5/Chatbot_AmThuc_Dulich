/**
 * UserManagement.jsx — Admin Panel: Quản lý người dùng (API thật).
 *
 * Features:
 * - Bảng danh sách user với search + filter theo role (từ API)
 * - Modal "Thêm User mới"
 * - Modal "Chỉnh sửa User"
 * - Toggle active/inactive status (PATCH API)
 * - Xóa user với confirm dialog (DELETE API)
 * - Pagination từ backend
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Filter, Edit, Trash2,
  UserCheck, UserX, X, Eye, EyeOff, User, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminService from '../../lib/adminService';

// ─── Constants ──────────────────────────────────────────────────────────────────
const ROLES = ['Tất cả', 'USER', 'ADMIN'];
const ROLE_LABEL = { USER: 'Member', ADMIN: 'Admin' };
const PAGE_SIZE = 8;

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
];

// ─── Helpers ────────────────────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase();
};

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

// ─── Sub-components ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
    status === 'ACTIVE'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-red-100 text-red-700'
  }`}>
    {status === 'ACTIVE' ? <UserCheck size={11} /> : <UserX size={11} />}
    {status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
  </span>
);

const RoleBadge = ({ role }) => {
  const colors = {
    ADMIN: 'bg-violet-100 text-violet-700',
    USER:  'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[role] || colors.USER}`}>
      {ROLE_LABEL[role] || role}
    </span>
  );
};

// ─── Add/Edit User Modal ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  fullName: '', email: '', username: '', password: '', role: 'USER', status: 'ACTIVE',
};

const UserFormModal = ({ mode, initialData, onClose, onSave, loading }) => {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.username.trim()) errs.username = 'Vui lòng nhập username';
    if (mode === 'add' && !form.password.trim()) errs.password = 'Vui lòng nhập mật khẩu';
    return errs;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  const isAdd = mode === 'add';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600/10 flex items-center justify-center">
              <User size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isAdd ? 'Thêm Người dùng mới' : 'Chỉnh sửa Người dùng'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAdd ? 'Điền thông tin để tạo tài khoản mới' : 'Cập nhật thông tin tài khoản'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="Nhập họ và tên đầy đủ" value={form.fullName} onChange={set('fullName')}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                errors.fullName ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' : 'border-slate-200 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600'
              }`} />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Username <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="Nhập tên đăng nhập" value={form.username} onChange={set('username')}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                errors.username ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' : 'border-slate-200 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600'
              }`} />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input type="email" placeholder="example@email.com" value={form.email} onChange={set('email')}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                errors.email ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' : 'border-slate-200 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600'
              }`} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mật khẩu {isAdd && <span className="text-red-500">*</span>}
              {!isAdd && <span className="text-slate-400 text-xs ml-1">(để trống nếu không đổi)</span>}
            </label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} placeholder={isAdd ? 'Tối thiểu 8 ký tự' : 'Nhập mật khẩu mới (nếu muốn đổi)'}
                value={form.password} onChange={set('password')}
                className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm outline-none transition-all ${
                  errors.password ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' : 'border-slate-200 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600'
                }`} />
              <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vai trò</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'USER',  label: 'Member', desc: 'Người dùng thông thường' },
                { value: 'ADMIN', label: 'Admin',  desc: 'Toàn quyền quản trị' },
              ].map((opt) => (
                <label key={opt.value}
                  className={`relative flex flex-col gap-1 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    form.role === opt.value ? 'border-primary-600 bg-primary-600/5' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <input type="radio" name="role" value={opt.value} checked={form.role === opt.value} onChange={set('role')} className="sr-only" />
                  <span className={`text-sm font-bold ${form.role === opt.value ? 'text-primary-700' : 'text-slate-700'}`}>{opt.label}</span>
                  <span className="text-xs text-slate-500 leading-tight">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái tài khoản</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setForm((p) => ({ ...p, status: 'ACTIVE' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.status === 'ACTIVE' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
                <UserCheck size={15} /> Hoạt động
              </button>
              <button type="button" onClick={() => setForm((p) => ({ ...p, status: 'INACTIVE' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.status === 'INACTIVE' ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
                <UserX size={15} /> Vô hiệu
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Huỷ
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20 disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isAdd ? 'Tạo tài khoản' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete confirm modal ───────────────────────────────────────────────────────
const DeleteConfirm = ({ user, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(15,23,42,0.55)' }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <Trash2 size={22} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">Xoá người dùng?</h3>
      <p className="text-slate-500 text-sm mb-6">
        Bạn sắp xoá <span className="font-semibold text-slate-800">{user.fullName || user.username}</span>.
        Hành động này không thể hoàn tác.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Huỷ
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          Xoá
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
const UserManagement = () => {
  const [users, setUsers]           = useState([]);
  const [totalElements, setTotal]   = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRole]       = useState('Tất cả');
  const [page, setPage]             = useState(0); // 0-indexed for backend
  const [loading, setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal]           = useState(null);
  const [deleteTarget, setDelete]   = useState(null);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(page, PAGE_SIZE, search);
      let content = data.content || [];
      // Client-side role filter (backend search only filters by keyword)
      if (roleFilter !== 'Tất cả') {
        content = content.filter(u => u.role === roleFilter);
      }
      setUsers(content);
      setTotal(data.totalElements || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('[Admin] Lỗi tải danh sách users:', err);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handlers
  const handleToggleStatus = async (id) => {
    try {
      await adminService.toggleUserStatus(id);
      toast.success('Đã cập nhật trạng thái');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await adminService.deleteUser(deleteTarget.id);
      toast.success('Đã xóa người dùng');
      setDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async (formData) => {
    setActionLoading(true);
    try {
      if (modal === 'add') {
        await adminService.createUser(formData);
        toast.success('Đã tạo tài khoản thành công');
      } else {
        // Edit mode — remove empty password
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await adminService.updateUser(modal.user.id, payload);
        toast.success('Đã cập nhật thành công');
      }
      setModal(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý User</h1>
            <p className="text-slate-500 text-sm mt-1">{totalElements} người dùng trong hệ thống</p>
          </div>
          <button id="btn-add-user" onClick={() => setModal('add')}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-700 active:scale-95 transition-all shadow-md shadow-primary-600/20 w-fit">
            <Plus size={18} /> Thêm User mới
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="user-search" type="text" placeholder="Tìm kiếm tên, email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-all"
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select id="user-role-filter"
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600/20 outline-none transition-all appearance-none cursor-pointer"
              value={roleFilter} onChange={(e) => { setRole(e.target.value); setPage(0); }}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r === 'Tất cả' ? 'Tất cả vai trò' : ROLE_LABEL[r] || r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['STT', 'Người dùng', 'Email', 'Vai trò', 'Trạng thái', 'Ngày đăng ký', 'Thao tác'].map((h, i) => (
                      <th key={h} className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 6 ? 'text-right' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user, index) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">
                        {page * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${getAvatarColor(user.fullName || user.username)} flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                            {getInitials(user.fullName || user.username)}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-900 block">{user.fullName || user.username}</span>
                            <span className="text-xs text-slate-400">@{user.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                      <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleToggleStatus(user.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.status === 'ACTIVE' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={user.status === 'ACTIVE' ? 'Vô hiệu hoá' : 'Kích hoạt'}>
                            {user.status === 'ACTIVE' ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button onClick={() => setModal({
                            mode: 'edit', user,
                            initialData: {
                              fullName: user.fullName || '', username: user.username || '',
                              email: user.email || '', role: user.role, status: user.status, password: '',
                            },
                          })}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors" title="Chỉnh sửa">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => setDelete(user)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Xoá">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                        Không tìm thấy người dùng phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Trang {page + 1} / {totalPages} — {totalElements} người dùng
            </p>
            {totalPages > 1 && (
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}>
                    {p + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add modal */}
      {modal === 'add' && (
        <UserFormModal mode="add" onClose={() => setModal(null)} onSave={handleSave} loading={actionLoading} />
      )}

      {/* Edit modal */}
      {modal && modal.mode === 'edit' && (
        <UserFormModal mode="edit" initialData={modal.initialData} onClose={() => setModal(null)} onSave={handleSave} loading={actionLoading} />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm user={deleteTarget} onClose={() => setDelete(null)} onConfirm={handleDelete} loading={actionLoading} />
      )}
    </>
  );
};

export default UserManagement;
