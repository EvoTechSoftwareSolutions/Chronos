import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/home"; // 🔥 ADD THIS

function App() {
  return (
    <GoogleOAuthProvider clientId="90872154996-uovdvfs99noj5vm4iukv93lomlahks4f.apps.googleusercontent.com">
      <Router>
        <Routes>

          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} /> {/* 🔥 ADD THIS */}

        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

