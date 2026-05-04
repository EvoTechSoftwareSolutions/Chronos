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
  const [errors, setErrors] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const normalizeName = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

  const validateField = (field, rawValue, all) => {
    const value = String(rawValue || "");

    if (field === "name") {
      const name = normalizeName(value);
      if (!name) return "Full name is required.";
      if (name.length < 3) return "Full name must be at least 3 characters.";
      if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(name)) return "Full name can only contain letters and spaces.";
      if (name.split(" ").filter(Boolean).length < 2) return "Please enter first name and last name.";
      return "";
    }

    if (field === "email") {
      const email = normalizeEmail(value);
      if (!email) return "Email is required.";
      if (email.length > 254) return "Email is too long.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
      return "";
    }

    if (field === "password") {
      const pwd = value;
      if (!pwd) return "Password is required.";
      if (/\s/.test(pwd)) return "Password cannot contain spaces.";
      if (pwd.length < 8) return "Password must be at least 8 characters.";
      if (!/[A-Z]/.test(pwd)) return "Password must include at least 1 uppercase letter.";
      if (!/[a-z]/.test(pwd)) return "Password must include at least 1 lowercase letter.";
      if (!/\d/.test(pwd)) return "Password must include at least 1 number.";
      if (!/[^A-Za-z0-9]/.test(pwd)) return "Password must include at least 1 symbol.";
      if (normalizeEmail(all.email) && pwd.toLowerCase().includes(normalizeEmail(all.email).split("@")[0])) {
        return "Password should not contain your email/username.";
      }
      return "";
    }

    if (field === "confirmPassword") {
      if (!value) return "Confirm password is required.";
      if (value !== all.password) return "Passwords do not match.";
      return "";
    }

    return "";
  };

  const validateAll = (data) => {
    return {
      name: validateField("name", data.name, data),
      email: validateField("email", data.email, data),
      password: validateField("password", data.password, data),
      confirmPassword: validateField("confirmPassword", data.confirmPassword, data),
    };
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // live-validate only if field already touched
    if (touched[name]) {
      const next = { ...formData, [name]: value };
      setErrors((prev) => ({ ...prev, [name]: validateField(name, next[name], next) }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name], formData) }));
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setMessage("");

    const validationErrors = validateAll(formData);
    const hasErrors = Object.values(validationErrors).some(Boolean);
    
    if (hasErrors) {
      setTouched({ name: true, email: true, password: true, confirmPassword: true });
      setErrors(validationErrors);
      setErrorMsg("Please fix the highlighted fields and try again.");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: normalizeName(formData.name),
        email: normalizeEmail(formData.email),
        password: formData.password,
      };

      const res = await fetch(`${getApiBaseUrl()}/api/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create account");
        setIsSuccess(false);
      } else {
        setMessage(data.message || "Account created successfully.");
        setIsSuccess(true);
        setErrors({ name: "", email: "", password: "", confirmPassword: "" });
        setTimeout(() => navigate("/"), 2000);
      }
    } catch {
      setErrorMsg("Unable to connect to server.");
      setIsSuccess(false);
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
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={onChange}
                onBlur={handleBlur}
                className={touched.name && errors.name ? "input-error" : ""}
              />
              {touched.name && errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={onChange}
                onBlur={handleBlur}
                className={touched.email && errors.email ? "input-error" : ""}
              />
              {touched.email && errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={onChange}
                onBlur={handleBlur}
                className={touched.password && errors.password ? "input-error" : ""}
              />
              {touched.password && errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={onChange}
                onBlur={handleBlur}
                className={touched.confirmPassword && errors.confirmPassword ? "input-error" : ""}
              />
              {touched.confirmPassword && errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
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
