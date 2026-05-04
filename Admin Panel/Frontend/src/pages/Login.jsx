import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import "../App.css"; // Reuse existing css for login
import logo from "../assets/watchlogo.png";
import { getApiBaseUrl } from "../utils/api";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If SSO login returns with an error
    const params = new URLSearchParams(window.location.search);
    if (params.get('ssoError')) {
      setErrorMsg("SSO Login failed: " + params.get('ssoError'));
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const endpoint = isSignUp 
      ? `${getApiBaseUrl()}/api/admin/signup` 
      : `${getApiBaseUrl()}/api/admin/login`;

    const payload = isSignUp ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        setErrorMsg(data.error || "Authentication failed");
      }
    } catch {
      setErrorMsg("Error connecting to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const _loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();

        const res = await fetch("http://localhost:5001/api/admin/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userInfo.email, name: userInfo.name }),
        });
        const data = await res.json();
        
        if (res.ok) {
           localStorage.setItem("adminUser", JSON.stringify(data.admin));
           setSuccessMsg("Google Admin Login successful!");
           setTimeout(() => {
             navigate("/dashboard");
           }, 500);
        } else {
           setErrorMsg(data.error || "Google Admin Login failed");
        }
      } catch {
        setErrorMsg("Server error connecting to Admin Backend");
      }
    },
    onError: () => {
        setErrorMsg("Google Login Failed");
    }
  });

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
          <form className="login-wrapper" onSubmit={handleAuth} autoComplete="off">
            <div className="lock-icon"><Lock size={20} strokeWidth={1.5} /></div>

            <h2>{isSignUp ? "Create Admin Account" : "Admin Sign In"}</h2>
            <p className="subtitle">{isSignUp ? "Register a new administrator" : "Enter your credentials to continue"}</p>

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

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="adminName">Full Name</label>
                <input
                  type="text"
                  id="adminName"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="adminEmail">Email Address</label>
              <input
                type="email"
                id="adminEmail"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
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
                autoComplete="new-password"
                required
              />
            </div>

            {!isSignUp && (
              <div className="remember-row">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember this device</label>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (isSignUp ? "Creating account..." : "Logging in...") : (isSignUp ? "Sign Up" : "Login In")}
            </button>
            
            <div className="toggle-auth" style={{ textAlign: "center", marginTop: "15px" }}>
              <p style={{ fontSize: "0.9rem", color: "#888" }}>
                {isSignUp ? "Already have an admin account?" : "Need a new admin account?"}{" "}
                <span 
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); setSuccessMsg(""); }} 
                  style={{ color: "#d4af37", cursor: "pointer", fontWeight: "600" }}
                >
                  {isSignUp ? "Log In" : "Sign Up"}
                </span>
              </p>
            </div>

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
