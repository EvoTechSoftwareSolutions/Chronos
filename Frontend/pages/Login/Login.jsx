import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import logo from "../../assets/images/ui/logo.png";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/login", formData);
      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user || { email: formData.email }));
        setMessage("Login successful");
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        setMessage("Invalid email or password");
        setIsSuccess(false);
      }
    } catch {
      setMessage("Server error or Invalid Credentials");
      setIsSuccess(false);
    }
  };

  //GOOGLE LOGIN
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const user = userInfo.data;

        // Store user in localStorage for persistence across sessions
        localStorage.setItem("user", JSON.stringify({ name: user.name, email: user.email }));
        setMessage(`Welcome ${user.name}! Login successful`);
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/home");
        }, 1500);

      } catch {
        setMessage("Google Login Failed");
        setIsSuccess(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-x-hidden">

      {/* LEFT SIDE */}
      <div className="w-full md:w-1/2 bg-[linear-gradient(to_top_left,#000000_25%,#3a2f09_50%,#D4AF37_100%)] flex flex-col justify-between p-8 md:p-10 text-white min-h-[300px] md:min-h-screen">
        <div className="mb-10 md:mb-30">
           <h2 className="font-bold text-[40px] md:text-[70px] mt-10 md:mt-20 ml-0 md:ml-20 leading-tight">
            Welcome Back
             </h2>
           <p className="text-gray-200 text-sm md:text-[20px] ml-0 md:ml-20 mb-10 md:mb-40 max-w-sm">
            Sign in to explore our exclusive collection of luxury timepieces.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end w-32 md:w-55 ml-0 md:mr-20 mb-10 md:mb-20">
          <img src={logo} className="w-full" alt="Chronos Logo" />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 bg-[#1E1E1E] flex items-center justify-center p-8 md:p-0 py-16">

        <form onSubmit={handleSubmit} className="w-[400px] text-white" autoComplete="off">

          {/* MESSAGE */}
          {message && (
            <div className={`mb-4 p-3 rounded ${
              isSuccess ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
            }`}>
              {message}
            </div>
          )}

          <h1 className="text-3xl font-bold mb-2">
            Login to <span className="text-[#D4AF37] tracking-widest font-playfair">CHRONOS</span>
          </h1>

          <p className="text-gray-400 mb-8">
            Enter your credentials to continue
          </p>

          <div className="mb-5">
            <label className="text-sm text-gray-300">User name or email</label>
            <input
              type="email"
              name="email"
              placeholder="Your email"
              autoComplete="off"
              onChange={handleChange}
              className="w-full mt-2 p-3 mb-5 rounded-md bg-transparent border border-[#D4AF37] outline-none"
            />
          </div>

          <div className="mb-5">
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              onChange={handleChange}
              className="w-full mt-2 mb-5 p-3 rounded-md bg-transparent border border-[#D4AF37] outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#D4AF37] text-black py-3 rounded-md font-semibold hover:bg-yellow-400 transition cursor-pointer">
            Login In
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-[#D4AF37]"></div>
            <span className="mx-3 text-gray-400 text-sm">Or</span>
            <div className="flex-grow border-t border-[#D4AF37]"></div>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() => googleLogin()}
            className="w-full border border-[#D4AF37] py-2 rounded-md flex items-center justify-center gap-2 hover:bg-[#D4AF37]/10 transition transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-gray-400 text-sm text-center mt-6">
            Don't have an account?{" "}
            <span onClick={() => navigate("/")} className="cursor-pointer text-white font-bold hover:underline">
              Sign Up
            </span>
          </p>

        </form>
      </div>

    </div>
  );
}

export default Login;