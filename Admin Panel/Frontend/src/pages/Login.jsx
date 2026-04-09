import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from 'lucide-react';
import "../App.css"; // Reuse existing css for login
import logo from "../assets/watchlogo.png";

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
      const res = await fetch("http://localhost:5001/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
        setSuccessMsg(data.message || "Login successful!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 500); // short delay to show success
      } else {
        setErrorMsg(data.error || "Login failed");
      }
    } catch (err) {
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

            {errorMsg && <div className="alert error-alert">{errorMsg}</div>}
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

            <button type="button" className="google-btn">
              <span className="google-icon-wrapper">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16px" height="16px">
                   <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                   <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                   <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                   <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                 </svg>
              </span>
              <span>Sign in with Google</span>
            </button>

            <div className="note">
              <span className="shield">🛡</span>
              <p>
                This portal is restricted to authorized administrators. All
                access attempts are logged and monitored for security purposes
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
