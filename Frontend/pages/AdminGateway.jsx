import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";

export default function AdminGateway() {
  const [msg, setMsg] = useState("Securing Admin Connection...");
  const [errorObj, setErrorObj] = useState(null);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setMsg("Authenticating Credentials...");
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();

        setMsg("Validating Administrator Database...");
        const res = await fetch("http://localhost:5001/api/admin/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userInfo.email, name: userInfo.name }),
        });
        const data = await res.json();
        
        if (res.ok) {
           setMsg("Authentication Successful! Redirecting...");
           setTimeout(() => {
              window.location.href = `http://localhost:5174/admin-panel/dashboard?sso=${encodeURIComponent(JSON.stringify(data.admin))}`;
           }, 800);
        } else {
           setMsg("Administrative Login Failed.");
           setErrorObj(data.error || "Not an authorized administrator");
        }
      } catch (err) {
        setMsg("Server connection lost");
        setErrorObj(err.message);
      }
    },
    onError: () => {
        setMsg("Google Popup Closed/Failed.");
        setErrorObj("Google Login Failed");
    }
  });

  return (
    <div style={{
      width: "100%", height: "100vh", 
      background: "linear-gradient(to top left, #000000 25%, #3a2f09 50%, #D4AF37 100%)",
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", 
      color: "#FFF", fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: "#1E1E1E",
        padding: "40px 50px",
        borderRadius: "16px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        textAlign: "center",
        maxWidth: "450px",
        width: "90%",
        border: "1px solid rgba(212, 175, 55, 0.2)"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(212,175,55,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px auto" }}>
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "8px", fontWeight: "700" }}>Chronos SSO<span style={{ color: "#D4AF37" }}>.</span></h2>
          <p style={{ color: "#AAA", fontSize: "0.95rem", margin: 0 }}>{msg}</p>
        </div>
        
        {errorObj ? (
           <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ padding: "12px", background: "rgba(255, 107, 107, 0.1)", border: "1px solid rgba(255, 107, 107, 0.3)", borderRadius: "8px", color: "#FF6B6B", marginBottom: "20px", fontSize: "0.9rem", width: "100%" }}>
                 {errorObj}
              </div>
              <button 
                onClick={() => window.location.href = "http://localhost:5174/admin-panel/"}
                style={{ padding: "12px 24px", background: "#333", border: "none", color: "#FFF", borderRadius: "8px", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }}
                onMouseOver={(e) => e.target.style.background = "#444"}
                onMouseOut={(e) => e.target.style.background = "#333"}
              >
                Return to Login
              </button>
           </div>
        ) : (
           <div style={{ marginTop: "30px" }}>
             <button 
               onClick={() => loginWithGoogle()}
               style={{
                 width: "100%",
                 padding: "14px 20px",
                 background: "transparent",
                 border: "1px solid #D4AF37",
                 color: "#FFF",
                 borderRadius: "8px",
                 fontSize: "1rem",
                 fontWeight: "600",
                 cursor: "pointer",
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "center",
                 gap: "12px",
                 transition: "all 0.2s"
               }}
               onMouseOver={(e) => { e.target.style.background = "rgba(212,175,55,0.1)"; }}
               onMouseOut={(e) => { e.target.style.background = "transparent"; }}
             >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
               </svg>
               Google Authentication
             </button>
           </div>
        )}
      </div>
    </div>
  );
}
