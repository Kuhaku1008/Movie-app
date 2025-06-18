import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

function Register({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    username: "", 
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = "Vui lòng nhập tên người dùng";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      onRegisterSuccess(data);
      navigate("/login");
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra khi đăng ký";
      if (error.message.includes("Tên người dùng đã tồn tại")) {
        errorMessage = "Tên người dùng này đã được đăng ký";
      } else if (error.message.includes("validation failed")) {
        errorMessage = "Dữ liệu không hợp lệ";
      }

      setErrors({ apiError: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-red-500">
              ĐĂNG KÝ TÀI KHOẢN
            </h2>

            {errors.apiError && (
              <div className="mb-4 p-3 bg-red-900 text-red-200 rounded text-sm">
                {errors.apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Tên người dùng (Email)
                </label>
                <input
                  id="username" 
                  name="username" 
                  type="text" 
                  className={`w-full p-3 rounded bg-gray-700 border ${
                    errors.username ? "border-red-500" : "border-gray-600"
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="Tên người dùng của bạn"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={`w-full p-3 rounded bg-gray-700 border ${
                    errors.password ? "border-red-500" : "border-gray-600"
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="Ít nhất 6 ký tự"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-1"
                >
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className={`w-full p-3 rounded bg-gray-700 border ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-600"
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded font-semibold ${
                  isLoading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 transition"
                }`}
              >
                {isLoading ? "Đang xử lý..." : "ĐĂNG KÝ"}
              </button>
            </form>
          </div>

          <div className="px-6 py-4 bg-gray-700 text-center">
            <p className="text-gray-300 text-sm">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-red-400 hover:underline font-medium"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

Register.propTypes = {
  onRegisterSuccess: PropTypes.func.isRequired,
};

export default Register;