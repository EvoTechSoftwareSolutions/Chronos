fetch("http://localhost:5001/api/admin/google-login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "test@test.com", name: "Test" }),
}).then(r => r.text()).then(t => console.log(t.substring(0,200))).catch(console.error);
