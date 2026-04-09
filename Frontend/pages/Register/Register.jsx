import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import logo from "../../assets/images/ui/logo.png";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle Input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validation
  const validate = () => {
    let newErrors = {};

    if (!formData.name) newErrors.name = "Full Name is required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be 6+ characters";
    }

    return newErrors;
  };

  //NORMAL REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage("Please fix the errors");
      setIsSuccess(false);
    } else {
      try {
        const res = await axios.post("http://localhost:5000/register", formData);

        if (res.data.success) {
          setErrors({});
          setMessage("Account created successfully");
          setIsSuccess(true);

          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setMessage("Registration failed");
          setIsSuccess(false);
        }

      } catch {
        setMessage("Server error");
        setIsSuccess(false);
      }
    }
  };

  // GOOGLE LOGIN
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const user = userInfo.data;

        //Send to backend
        await axios.post("http://localhost:5000/google-register", {
          name: user.name,
          email: user.email,
        });

        setMessage(`Welcome ${user.name}! Account created successfully.`);
        setIsSuccess(true);

        setTimeout(() => {
          navigate("/login");
        }, 2000);

      } catch {
        setMessage("Google Sign-In Failed");
        setIsSuccess(false);
      }
    },

    onError: () => {
      setMessage("Google Sign-In Failed");
      setIsSuccess(false);
    },
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse overflow-x-hidden">

      {/* LEFT (Form) */}
      <div className="w-full md:w-1/2 bg-[#1E1E1E] text-white flex items-center justify-center p-8 md:p-0 py-16">

        <form onSubmit={handleSubmit} className="w-full max-w-[400px]">
          {/* ... existing form contents ... */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-md text-sm ${
                isSuccess
                  ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]"
                  : "bg-red-500/20 text-red-400 border border-red-500"
              }`}
            >
              {message}
            </div>
          )}

          <h1 className="text-3xl font-bold mb-2">
            Join With{" "}
            <span className="text-[#D4AF37] tracking-widest font-playfair">
              CHRONOS
            </span>
          </h1>

          <p className="text-gray-400 mb-8">
            Create an account and discover the world of fine horology.
          </p>

          <div className="mb-5">
            <label className="text-sm text-gray-300">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full mt-2 p-3 rounded-md bg-transparent border border-[#D4AF37] outline-none"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="mb-5">
            <label className="text-sm text-gray-300">Your Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full mt-2 p-3 rounded-md bg-transparent border border-[#D4AF37] outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full mt-2 p-3 rounded-md bg-transparent border border-[#D4AF37] outline-none"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-[#D4AF37] text-black py-3 rounded-md font-semibold hover:bg-yellow-400 transition"
          >
            Create Account
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-[#D4AF37]"></div>
            <span className="mx-3 text-gray-400 text-sm">Or</span>
            <div className="flex-grow border-t border-[#D4AF37]"></div>
          </div>

          <button
            type="button"
            onClick={() => googleLogin()}
            className="w-full border border-[#D4AF37] py-2 rounded-md flex items-center justify-center gap-2 hover:bg-[#D4AF37]/10 transition transform hover:scale-105 active:scale-95"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5"
              alt="google"
            />
            Sign in with Google
          </button>

          <p className="text-gray-400 text-sm text-center mt-6">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-white cursor-pointer"
            >
              Sign In
            </span>
          </p>
        </form>
      </div>

      {/* RIGHT (Branding) */}
      <div className="w-full md:w-1/2 bg-[linear-gradient(to_top_right,#000000_10%,#3a2f09_50%,#D4AF37_100%)] flex flex-col items-start justify-center text-white p-8 md:p-10 min-h-[300px] md:min-h-screen">

        <h2 className="font-bold text-[40px] md:text-[70px] mt-0 md:mt-10 ml-0 md:ml-10 leading-tight">
          Create Account
        </h2>

        <p className="text-gray-200 text-sm md:text-[20px] ml-0 md:ml-10 mb-10 md:mb-20">
          Fill in the details to get started
        </p>

        <img
          src={logo}
          alt="Chronos Logo"
          className="w-32 md:w-55 ml-0 md:ml-10"
        />
      </div>

    </div>
  );
}

export default Register;