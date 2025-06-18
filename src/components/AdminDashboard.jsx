import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="text-white p-10 pt-24 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-red-500">Bảng Điều Khiển Quản Trị</h2>

        <p className="text-lg mb-8">Chào mừng bạn đến khu vực quản trị. Chọn một mục dưới đây để bắt đầu quản lý:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            to="/admin/movies" 
            className="block p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <h3 className="text-2xl font-semibold mb-2 text-white">Quản Lý Phim</h3>
            <p className="text-gray-400">Thêm, sửa, xóa và xem danh sách các bộ phim.</p>
          </Link>

          <Link 
            to="/admin/users" 
            className="block p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <h3 className="text-2xl font-semibold mb-2 text-white">Quản Lý Người Dùng</h3>
            <p className="text-gray-400">Xem, chỉnh sửa vai trò, và quản lý tài khoản người dùng.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;