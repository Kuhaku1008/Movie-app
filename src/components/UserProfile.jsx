import React, { useEffect, useState } from 'react';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=128';

const UserProfile = ({ user }) => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/user/info', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        setUserData(data);
        setFormData({ username: data.username, password: '' });
      } catch (err) {
        console.error('Lỗi khi tải thông tin:', err);
      }
    };

    if (user?.token) fetchUserInfo();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setMessage('✅ Cập nhật thành công!');
      const updated = { ...userData, username: formData.username };
      setUserData(updated);

      const updatedUser = { ...user, username: formData.username };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setEditMode(false);
    } catch (err) {
      setMessage('❌ ' + (err.message || 'Lỗi khi cập nhật.'));
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return <div className="text-white text-center pt-24">Đang tải thông tin...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 px-6">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-6">
          <img
            src={DEFAULT_AVATAR}
            alt="avatar"
            className="w-24 h-24 rounded-full border-4 border-blue-500 shadow mb-2"
          />
          <h2 className="text-3xl font-bold text-red-400 mb-1">Xin chào, {userData.username}!</h2>
          <p className="text-gray-400">Vai trò: {userData.role}</p>
        </div>

        {!editMode ? (
          <>
            <div className="space-y-3 text-lg text-center mt-4">
              <p><strong>Tên đăng nhập:</strong> {userData.username}</p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition"
              >
                ✏️ Sửa thông tin
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu mới (bỏ trống nếu không đổi)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
              />
            </div>

            {message && <p className="text-center text-sm">{message}</p>}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setMessage('');
                  setFormData(prev => ({ ...prev, password: '' }));
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                 Huỷ
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                {loading ? 'Đang cập nhật...' : ' Lưu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
