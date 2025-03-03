import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import API from "../api/api";
import "../styles/Login.css"; // ✅ Importing the CSS file

const Login = () => {
  const { login } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const { data } = await API.post("/auth/login", credentials);

      // ✅ Store token, role, and user name in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userName", data.name); // ✅ Store user name

      login(data.token); // ✅ AuthContext handles role-based redirection
      setMessage("✅ Login successful! Redirecting...");
    } catch (err) {
      setError("❌ Invalid email or password!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Left Side Image Section */}
        <div className="login-image-container">
          <img src="login-page.png" alt="Login" className="login-image" />
        </div>

        {/* Right Side Form Section */}
        <div className="login-form">
          <h2>Login</h2>
          <p>Welcome back! Please log in to your account.</p>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {message && <p style={{ color: "green" }}>{message}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
            <button type="submit">Login</button>
          </form>

          <p>Don't have an account? <a href="/register">Sign up</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
