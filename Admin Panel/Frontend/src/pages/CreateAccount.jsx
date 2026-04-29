import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import "../App.css";
import logo from "../assets/watchlogo.png";
import { getApiBaseUrl } from "../utils/api";

export default function CreateAccount() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create account");
      } else {
        setMessage(data.message || "Account created successfully.");
        setTimeout(() => navigate("/"), 800);
      }
    } catch {
      setErrorMsg("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-card">
        <div className="left-panel">
          <div className="left-content">
            <h1>Create Admin Account</h1>
            <p>Set up secure administrative access for authorized staff.</p>
          </div>
          <div className="brand">
            <img src={logo} alt="Chronos Logo" className="logo-img" />
          </div>
        </div>

        <div className="right-panel">
          <form className="login-wrapper" onSubmit={handleCreateAccount}>
            <div className="lock-icon"><UserPlus size={20} strokeWidth={1.5} /></div>
            <h2>Admin Create Account</h2>
            <p className="subtitle">Enter new admin details</p>

            {errorMsg && <div className="alert error-alert">{errorMsg}</div>}
            {message && <div className="alert success-alert">{message}</div>}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={onChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={onChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={formData.password} onChange={onChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={onChange}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="subtitle" style={{ marginTop: "14px", textAlign: "center" }}>
              Already have an account?{" "}
              <span style={{ color: "#d4af37", cursor: "pointer" }} onClick={() => navigate("/")}>
                Back to Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
