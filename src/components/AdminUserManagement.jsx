import React, { useState, useEffect } from 'react';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.token : null;
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Bạn chưa đăng nhập hoặc phiên đã hết hạn.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể tải danh sách người dùng.');

      setUsers(data);
    } catch (err) {
      console.error("Lỗi khi tải người dùng admin:", err);
      setError(err.message || "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const token = getToken();
    if (!token) {
      setError('Bạn chưa đăng nhập hoặc phiên đã hết hạn.');
      return;
    }

    const response = await fetch(`http://localhost:5000/api/admin/users?search=${encodeURIComponent(searchTerm)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể tìm kiếm người dùng.');

    setUsers(data);
  } catch (err) {
    console.error("Lỗi khi tìm kiếm người dùng admin:", err);
    setError(err.message || "Không thể tìm kiếm người dùng.");
  } finally {
    setLoading(false);
  }
};


  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Bạn chưa đăng nhập hoặc phiên đã hết hạn.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: userData.role })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể cập nhật người dùng.');

      alert('Thông tin người dùng đã được cập nhật thành công!');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi lưu người dùng:", err);
      setError(err.message || "Không thể cập nhật người dùng.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    try {
      const token = getToken();
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể xóa người dùng.');

      setUsers(users.filter(u => u.id !== userId));
      alert('Đã xóa người dùng thành công!');
      setIsModalOpen(false); 
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-white text-center py-10 pt-24">Đang tải danh sách người dùng...</p>;
  if (error) return <p className="text-red-500 text-center py-10 pt-24">{error}</p>;

  return (
    <div className="text-white p-10 pt-24 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-red-500">Quản Lý Người Dùng</h2>

        <div className="flex justify-end items-center mb-6">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {users.length === 0 ? (
          <p className="text-gray-400">Không tìm thấy người dùng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-700 text-left text-gray-300 uppercase text-sm leading-normal">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Tên người dùng</th>
                  <th className="py-3 px-6">Vai trò</th>
                  <th className="py-3 px-6">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 text-sm font-light">
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-6 text-left whitespace-nowrap">{user.id}</td>
                    <td className="py-3 px-6 text-left">{user.username}</td>
                    <td className="py-3 px-6 text-left">
                      <span className={`py-1 px-3 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs mr-2"
                      >
                        Sửa Vai trò
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <UserFormModal
          user={currentUser}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  );
};

export default AdminUserManagement;

// ✅ Modal chỉnh sửa người dùng
const UserFormModal = ({ user, onClose, onSave, onDelete }) => {
  const [role, setRole] = useState(user?.role || 'user');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: user.id, role });
  };

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      onDelete(user.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <h3 className="text-2xl font-bold mb-6 text-red-500">
          Chỉnh Sửa Người Dùng: {user?.username}
        </h3>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl"
        >
          &times;
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">Vai trò</label>
            <select
              name="role"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
            >
              Xóa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
