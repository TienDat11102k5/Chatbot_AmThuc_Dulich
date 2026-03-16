/**
 * UserManagement.jsx — Admin Panel: Quản lý người dùng (full-featured).
 *
 * Features:
 * - Bảng danh sách user với search + filter theo role
 * - Modal "Thêm User mới" (based on Stitch design)
 * - Modal "Chỉnh sửa User"
 * - Toggle active/inactive status
 * - Xóa user với confirm dialog
 * - Pagination
 */

import { useState } from 'react';
import {
  Plus, Search, Filter, Edit, Trash2,
  UserCheck, UserX, X, Eye, EyeOff, User
} from 'lucide-react';

// ─── Sample data ───────────────────────────────────────────────────────────────
const USERS_INITIAL = [
  { id: 1,  initials: 'LH', name: 'Lê Hoàng Nam',   email: 'nam.lh@example.com',      role: 'user',    status: 'active',   joined: '01/01/2024', bg: 'bg-blue-100 text-blue-700'   },
  { id: 2,  initials: 'TT', name: 'Trần Thị Thảo',  email: 'thao.tt@testmail.vn',     role: 'user',    status: 'inactive', joined: '15/01/2024', bg: 'bg-slate-200 text-slate-600' },
  { id: 3,  initials: 'QD', name: 'Quốc Duy',       email: 'duy.travel@outlook.com',  role: 'editor',  status: 'active',   joined: '20/01/2024', bg: 'bg-amber-100 text-amber-700' },
  { id: 4,  initials: 'MA', name: 'Minh Anh',       email: 'minhanh.ng@gmail.com',    role: 'user',    status: 'active',   joined: '22/01/2024', bg: 'bg-blue-100 text-blue-700'   },
  { id: 5,  initials: 'PT', name: 'Phạm Thùy Linh', email: 'linh.pham@gmail.com',     role: 'user',    status: 'active',   joined: '01/02/2024', bg: 'bg-pink-100 text-pink-700'   },
  { id: 6,  initials: 'HV', name: 'Hồ Văn Hiếu',   email: 'hieu.ho@company.com',     role: 'user',    status: 'inactive', joined: '10/02/2024', bg: 'bg-emerald-100 text-emerald-700' },
  { id: 7,  initials: 'NK', name: 'Ngô Kim Chi',    email: 'kchi@university.edu.vn',  role: 'user',    status: 'active',   joined: '14/02/2024', bg: 'bg-purple-100 text-purple-700'},
  { id: 8,  initials: 'BD', name: 'Bùi Đức Anh',   email: 'anh.bui@startup.vn',      role: 'editor',  status: 'active',   joined: '28/02/2024', bg: 'bg-orange-100 text-orange-700'},
];

const ROLES = ['Tất cả', 'user', 'editor', 'admin'];

const ROLE_LABEL = {
  user:   'Member',
  editor: 'Editor',
  admin:  'Admin',
};

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name) =>
  name.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase();

const randomAvatarColor = () =>
  AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

// ─── Sub-components ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
    status === 'active'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-red-100 text-red-700'
  }`}>
    {status === 'active' ? <UserCheck size={11} /> : <UserX size={11} />}
    {status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
  </span>
);

const RoleBadge = ({ role }) => {
  const colors = {
    admin:  'bg-violet-100 text-violet-700',
    editor: 'bg-amber-100 text-amber-700',
    user:   'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[role] || colors.user}`}>
      {ROLE_LABEL[role] || role}
    </span>
  );
};

// ─── Add/Edit User Modal ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', email: '', password: '', role: 'user', status: 'active',
};

const UserFormModal = ({ mode, initialData, onClose, onSave }) => {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (mode === 'add' && !form.password.trim()) errs.password = 'Vui lòng nhập mật khẩu';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
        {/* Modal Header */}
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
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Đóng"
          >
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
            <input
              type="text"
              placeholder="Nhập họ và tên đầy đủ"
              value={form.name}
              onChange={set('name')}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                errors.name
                  ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                  : 'border-slate-200 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={set('email')}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                errors.email
                  ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                  : 'border-slate-200 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Mật khẩu — chỉ hiện khi thêm mới */}
          {isAdd && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Tối thiểu 8 ký tự"
                  value={form.password}
                  onChange={set('password')}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm outline-none transition-all ${
                    errors.password
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vai trò</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'user',   label: 'Member',  desc: 'Người dùng thông thường' },
                { value: 'editor', label: 'Editor',  desc: 'Quản lý nội dung bài viết' },
                { value: 'admin',  label: 'Admin',   desc: 'Toàn quyền quản trị' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`relative flex flex-col gap-1 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    form.role === opt.value
                      ? 'border-primary-600 bg-primary-600/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={form.role === opt.value}
                    onChange={set('role')}
                    className="sr-only"
                  />
                  <span className={`text-sm font-bold ${form.role === opt.value ? 'text-primary-700' : 'text-slate-700'}`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-slate-500 leading-tight">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái tài khoản</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, status: 'active' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.status === 'active'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <UserCheck size={15} /> Hoạt động
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, status: 'inactive' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.status === 'inactive'
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <UserX size={15} /> Vô hiệu
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20"
          >
            {isAdd ? 'Tạo tài khoản' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete confirm mini-modal ─────────────────────────────────────────────────
const DeleteConfirm = ({ user, onClose, onConfirm }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(15,23,42,0.55)' }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <Trash2 size={22} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">Xoá người dùng?</h3>
      <p className="text-slate-500 text-sm mb-6">
        Bạn sắp xoá <span className="font-semibold text-slate-800">{user.name}</span>.
        Hành động này không thể hoàn tác.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Huỷ
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all"
        >
          Xoá
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
const UserManagement = () => {
  const [users, setUsers]         = useState(USERS_INITIAL);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRole]     = useState('Tất cả');
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState(null); // null | 'add' | { mode:'edit', user }
  const [deleteTarget, setDelete] = useState(null); // user to delete

  const PAGE_SIZE = 5;

  // Filter
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole   = roleFilter === 'Tất cả' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Handlers
  const toggleStatus = (id) =>
    setUsers((prev) =>
      prev.map((u) => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)
    );

  const handleDelete = () => {
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDelete(null);
  };

  const handleSave = (formData) => {
    if (modal === 'add') {
      const newUser = {
        id:       Date.now(),
        initials: getInitials(formData.name),
        name:     formData.name,
        email:    formData.email,
        role:     formData.role,
        status:   formData.status,
        joined:   new Date().toLocaleDateString('vi-VN'),
        bg:       randomAvatarColor(),
      };
      setUsers((prev) => [newUser, ...prev]);
    } else {
      // Edit mode
      setUsers((prev) =>
        prev.map((u) =>
          u.id === modal.user.id
            ? {
                ...u,
                name:     formData.name,
                email:    formData.email,
                role:     formData.role,
                status:   formData.status,
                initials: getInitials(formData.name),
              }
            : u
        )
      );
    }
    setModal(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý User</h1>
            <p className="text-slate-500 text-sm mt-1">{users.length} người dùng trong hệ thống</p>
          </div>
          <button
            id="btn-add-user"
            onClick={() => setModal('add')}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-700 active:scale-95 transition-all shadow-md shadow-primary-600/20 w-fit"
          >
            <Plus size={18} />
            Thêm User mới
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="user-search"
              type="text"
              placeholder="Tìm kiếm tên, email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-all"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              id="user-role-filter"
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600/20 outline-none transition-all appearance-none cursor-pointer"
              value={roleFilter}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r === 'Tất cả' ? 'Tất cả vai trò' : ROLE_LABEL[r] || r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Người dùng', 'Email', 'Vai trò', 'Trạng thái', 'Ngày đăng ký', 'Thao tác'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${user.bg} flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                          {user.initials}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{user.joined}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle status */}
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.status === 'active'
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.status === 'active' ? 'Vô hiệu hoá' : 'Kích hoạt'}
                        >
                          {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() =>
                            setModal({
                              mode: 'edit',
                              user,
                              initialData: {
                                name:     user.name,
                                email:    user.email,
                                role:     user.role,
                                status:   user.status,
                                password: '',
                              },
                            })
                          }
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDelete(user)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                          title="Xoá"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paged.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                      Không tìm thấy người dùng phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị {paged.length} / {filtered.length} người dùng
            </p>
            {totalPages > 1 && (
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add modal */}
      {modal === 'add' && (
        <UserFormModal mode="add" onClose={() => setModal(null)} onSave={handleSave} />
      )}

      {/* Edit modal */}
      {modal && modal.mode === 'edit' && (
        <UserFormModal
          mode="edit"
          initialData={modal.initialData}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm
          user={deleteTarget}
          onClose={() => setDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

export default UserManagement;
