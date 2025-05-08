// Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import PropTypes from 'prop-types';

function Login({ onLoginSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            onLoginSuccess(data.token); // Pass the token to the parent
            navigate('/'); // Redirect to home on successful login
        } catch (err) {
            setError(err.message || 'Lỗi kết nối server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md"
            >
                <h2 className="text-2xl font-bold text-center mb-6 text-red-500">ĐĂNG NHẬP</h2>

                {error && (
                    <div className="mb-4 p-2 bg-red-900 text-red-200 rounded text-sm">{error}</div>
                )}

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                        Mật khẩu
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength="6"
                        className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded font-medium ${
                        isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                    {isLoading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                </button>

                <div className="mt-4 text-center text-sm">
                    <span className="text-gray-400">Chưa có tài khoản? </span>
                    <Link to="/register" className="text-red-400 hover:underline">
                        Đăng ký ngay
                    </Link>
                </div>
            </form>
        </div>
    );
}

Login.propTypes = {
    onLoginSuccess: PropTypes.func.isRequired,
};

export default Login;