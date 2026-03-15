/**
 * UserManagement.jsx — Trang quản lý người dùng trong Admin Panel.
 *
 * Thiết kế theo Stitch "Admin - User Management":
 * - Header: tiêu đề + nút "Thêm User" màu primary
 * - Search + Filter bar
 * - Bảng đầy đủ: Avatar initials / Tên / Email / Role / Trạng thái / Ngày đăng ký / Thao tác
 * - Status badge màu xanh lá (active) / đỏ (inactive)
 * - Pagination đơn giản ở cuối
 */

import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

// ─── Dữ liệu users mẫu ───────────────────────────────────────────────────────
const USERS_DATA = [
  { id: 1,  initials: 'LH', name: 'Lê Hoàng Nam',   email: 'nam.lh@example.com',      role: 'Premium User',  status: 'active',   joined: '01/01/2024', bg: 'bg-blue-100 text-blue-700'  },
  { id: 2,  initials: 'TT', name: 'Trần Thị Thảo',  email: 'thao.tt@testmail.vn',     role: 'User',          status: 'inactive', joined: '15/01/2024', bg: 'bg-slate-200 text-slate-600'},
  { id: 3,  initials: 'QD', name: 'Quốc Duy',       email: 'duy.travel@outlook.com',  role: 'Admin Content', status: 'active',   joined: '20/01/2024', bg: 'bg-amber-100 text-amber-700'},
  { id: 4,  initials: 'MA', name: 'Minh Anh',       email: 'minhanh.ng@gmail.com',    role: 'User',          status: 'active',   joined: '22/01/2024', bg: 'bg-blue-100 text-blue-700'  },
  { id: 5,  initials: 'PT', name: 'Phạm Thùy Linh', email: 'linh.pham@gmail.com',     role: 'User',          status: 'active',   joined: '01/02/2024', bg: 'bg-pink-100 text-pink-700'  },
  { id: 6,  initials: 'HV', name: 'Hồ Văn Hiếu',   email: 'hieu.ho@company.com',     role: 'Premium User',  status: 'inactive', joined: '10/02/2024', bg: 'bg-emerald-100 text-emerald-700'},
  { id: 7,  initials: 'NK', name: 'Ngô Kim Chi',    email: 'kchi@university.edu.vn',  role: 'User',          status: 'active',   joined: '14/02/2024', bg: 'bg-purple-100 text-purple-700'},
  { id: 8,  initials: 'BD', name: 'Bùi Đức Anh',   email: 'anh.bui@startup.vn',      role: 'Admin Content', status: 'active',   joined: '28/02/2024', bg: 'bg-orange-100 text-orange-700'},
];

const ROLES = ['Tất cả', 'User', 'Premium User', 'Admin Content'];

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

const UserManagement = () => {
  const [users, setUsers]       = useState(USERS_DATA);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('Tất cả');

  // Lọc theo search + role
  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase())
      || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'Tất cả' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleDelete = (id) => setUsers((prev) => prev.filter((u) => u.id !== id));

  const toggleStatus = (id) =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u,
      ),
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý User</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} người dùng trong hệ thống</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20 w-fit">
          <Plus size={18} />
          Thêm User mới
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tên, email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600/20 outline-none transition-all appearance-none cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Bảng users */}
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
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${user.bg} flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                        {user.initials}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{user.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className={`p-1.5 rounded-lg transition-colors text-xs ${
                          user.status === 'active'
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={user.status === 'active' ? 'Vô hiệu hoá' : 'Kích hoạt'}
                      >
                        {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Không tìm thấy người dùng phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination đơn giản */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Hiển thị {filtered.length} / {users.length} người dùng
          </p>
          <div className="flex gap-2">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === 1 ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
