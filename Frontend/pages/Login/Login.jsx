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
        window.dispatchEvent(new Event("auth-changed"));
        setMessage("Login successful");
        setIsSuccess(true);

        setTimeout(() => {
          navigate("/home");
        }, 2000);

      } else {
        setMessage("Invalid email or password");
        setIsSuccess(false);
      }

    } catch {
      setMessage("Server error");
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
        window.dispatchEvent(new Event("auth-changed"));

        // Direct login (no password)
        setMessage(`Welcome ${user.name}! Login successful`);
        setIsSuccess(true);

        setTimeout(() => {
          navigate("/home");
        }, 2000);

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

        <form onSubmit={handleSubmit} className="w-[400px] text-white">

          {/* MESSAGE */}
          {message && (
            <div className={`mb-4 p-3 rounded ${
              isSuccess ? "bg-green-500/20" : "bg-red-500/20"
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
            <label className="text-sm text-gray-300"> User name or email</label>
            <input
              type="email"
              name="email"
              placeholder="Your name or email"
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
              onChange={handleChange}
              className="w-full mt-2 mb-5 p-3 rounded-md bg-transparent border border-[#D4AF37] outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#D4AF37] text-black py-3 rounded-md font-semibold hover:bg-yellow-400 transition">
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
            Don't have an account?{" "}
            <span onClick={() => navigate("/")} className="cursor-pointer text-white">
              Sign Up
            </span>
          </p>

          <p className="text-gray-400 text-sm text-center mt-10 flex items-center justify-center gap-2">
            If you are an admin you can login here :{" "}
            <button 
              type="button"
              onClick={() => window.open("http://localhost:5174/", "_blank")} 
              className="text-[#D4AF37] font-bold hover:underline cursor-pointer transition-all hover:scale-105"
            >
              Admin Portal
            </button>
          </p>

        </form>
      </div>

    </div>
  );
}

export default Login;