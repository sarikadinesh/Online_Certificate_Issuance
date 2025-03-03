import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/Register.css"; // ✅ Importing CSS

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "applicant",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/register", formData);
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card shadow">
        {/* Left Section (Illustration) */}
        <div className="register-left">
          <img src="register-illustration.png" alt="Register" className="register-image" />
        </div>

        {/* Right Section (Form) */}
        <div className="register-right">
          <h2 className="text-dark fw-bold">Registration</h2>
          <p className="text-muted">Join the world's top security team and be a part of internet guardian leads!</p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-success btn-block">REGISTER</button>
          </form>

          {/* Message */}
          {message && <p className="text-danger mt-2">{message}</p>}

          {/* Login Link */}
          <p className="mt-3 text-muted">
            Have an account? <a href="/login" className="text-primary">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;