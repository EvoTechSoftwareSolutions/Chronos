import React, { useEffect, useRef } from 'react';

export default function AdminSSO() {
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const processGoogleToken = async () => {
      try {
        const hashStr = window.location.hash ? window.location.hash.substring(1) : "";
        const searchStr = window.location.search ? window.location.search.substring(1) : "";
        
        let accessToken = null;
        if (hashStr) {
          const params = new URLSearchParams(hashStr);
          accessToken = params.get('access_token');
        }
        if (!accessToken && searchStr) {
          const params = new URLSearchParams(searchStr);
          accessToken = params.get('access_token');
        }

        if (!accessToken) {
          window.location.href = "http://localhost:5174/admin-panel/?ssoError=No_Token_Found_In_Redirect";
          return;
        }

        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userInfo = await userInfoRes.json();

        const res = await fetch("http://localhost:5001/api/admin/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userInfo.email, name: userInfo.name }),
        });
        const data = await res.json();
        
        if (res.ok) {
           window.location.href = `http://localhost:5174/admin-panel/dashboard?sso=${encodeURIComponent(JSON.stringify(data.admin))}`;
        } else {
           window.location.href = `http://localhost:5174/admin-panel/?ssoError=${encodeURIComponent(data.error || 'Server error')}`;
        }
      } catch (err) {
        window.location.href = `http://localhost:5174/admin-panel/?ssoError=Server_Connection_Failed`;
      }
    };

    processGoogleToken();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0B0B0B' }}></div>
  );
}
