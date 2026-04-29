import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from 'lucide-react';
import "../App.css"; // Reuse existing css for login
import logo from "../assets/watchlogo.png";
import { getApiBaseUrl } from "../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
        localStorage.setItem("adminToken", data.token);
        window.dispatchEvent(new Event("auth-changed"));
        setSuccessMsg(data.message || "Login successful!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 500); // short delay to show success
      } else {
        setErrorMsg(data.error || "Login failed");
      }
    } catch {
      setErrorMsg("Error connecting to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-card">
        <div className="left-panel">
          <div className="left-content">
            <h1>Admin Portal</h1>
            <p>Secure administrative access. Authorized personnel only.</p>
          </div>
          <div className="brand">
            <img src={logo} alt="Chronos Logo" className="logo-img" />
          </div>
        </div>

        <div className="right-panel">
          <form className="login-wrapper" onSubmit={handleLogin}>
            <div className="lock-icon"><Lock size={20} strokeWidth={1.5} /></div>

            <h2>Admin Sign In</h2>
            <p className="subtitle">Enter your credentials to continue</p>

            {errorMsg && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }} onClick={() => setErrorMsg('')}>
                <div style={{
                  background: '#171717',
                  border: '1px solid #d4af37',
                  borderRadius: '12px',
                  padding: '30px',
                  textAlign: 'center',
                  color: '#fff',
                  minWidth: '260px'
                }} onClick={e => e.stopPropagation()}>
                  <h3 style={{ margin: '0 0 10px', color: '#d4af37' }}>Invalid credentials</h3>
                  <p style={{ margin: 0 }}>{errorMsg}</p>
                  <button onClick={() => setErrorMsg('')} style={{
                    marginTop: '15px',
                    background: '#d4af37',
                    color: '#000',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}>Close</button>
                </div>
              </div>
            )}

            {successMsg && <div className="alert success-alert">{successMsg}</div>}

            <div className="form-group">
              <label htmlFor="adminEmail">Admin Id or Email</label>
              <input
                type="text"
                id="adminEmail"
                placeholder="Your name or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
              </div>
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="remember-row">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember this device</label>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login In"}
            </button>

            <div className="divider">
              <span></span>
              <p>Or</p>
              <span></span>
            </div>

            <button type="button" className="google-btn" onClick={() => navigate("/create-account")}>
              <span>Create New Admin Account</span>
            </button>

            <div className="note">
              <span className="shield">🛡</span>
              <p>
                This portal is restricted to authorized administrators. All
                access attempts are logged and monitored for security purposes
              </p>
            </div>

            <p className="subtitle" style={{ marginTop: "14px", textAlign: "center" }}>
              Don't have an account?{" "}
              <span style={{ color: "#d4af37", cursor: "pointer" }} onClick={() => navigate("/create-account")}>
                Create one
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
