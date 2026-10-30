import React from "react";
import ReactDOM from "react-dom/client";
import HellooRoot from "./HellooApp.jsx";
import "./global.css";

// On a phone the app fills the screen. On a wide screen it sits in a
// phone-sized frame in the middle, so the demo reads as the app it is.
function Stage() {
  const [wide, setWide] = React.useState(() => window.innerWidth > 640);
  React.useEffect(() => {
    const on = () => setWide(window.innerWidth > 640);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  if (!wide) return <HellooRoot />;
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 30% 20%, #2A2155 0%, #120B2E 70%)" }}>
      <div style={{ position: "relative", width: 390, height: "min(844px, calc(100vh - 40px))", borderRadius: 36, overflow: "hidden", transform: "translateZ(0)", boxShadow: "0 30px 80px rgba(0,0,0,0.45), 0 0 0 10px #1B1838" }}>
        <HellooRoot />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Stage />
  </React.StrictMode>
);
