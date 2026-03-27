import { useState, useEffect } from "react";
 
function App() {
  const [serverStatus, setServerStatus] = useState("Checking...");
 
  useEffect(() => {
    // Ping our Express server's health check endpoint
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setServerStatus(data.message))
      .catch(() => setServerStatus("❌ Cannot reach server — is it running?"));
  }, []);
 
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>RoomieMatch</h1>
      <p>Server status: <strong>{serverStatus}</strong></p>
    </div>
  );
}
 
export default App;
 