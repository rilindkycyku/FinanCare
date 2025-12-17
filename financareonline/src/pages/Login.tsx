import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom"; // Added Link
import Titulli from "../components/Titulli";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = await login(username, password);
    if (success) {
      navigate("/");
    } else {
      setError("Username ose Password i gabuar!");
    }
  };

  return (
    <>
      <Titulli titulli="Kyçja" />
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Kyçja në Sistem
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            Kyçu
          </button>
        </form>

        {/* New Signup Link Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Ende pa llogari?{" "}
            <Link
              to="/signup"
              className="text-blue-600 font-semibold hover:underline hover:text-blue-700 transition"
            >
              Regjistrohu këtu
            </Link>
          </p>
          <p className="text-xs text-gray-500 mt-3">
            Kërkesa për regjistrim shqyrtohet brenda 24 orëve
          </p>
        </div>
      </div>
    </>
  );
}