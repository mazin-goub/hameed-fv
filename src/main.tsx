import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import "./index.css";
import App from "./App";
import OpeningPage from "./components/OpeningPage"; // استورد الـ OpeningPage
import { convex } from "./convexClient";
import { useState, useEffect } from "react";
import React from "react";

// Wrapper Component للتحكم في ظهور الـ Opening Page
const Root: React.FC = () => {
  const [showOpening, setShowOpening] = useState(true);

  return showOpening ? (
    <OpeningPage onFinish={() => setShowOpening(false)} />
  ) : (
    <App />
  );
};

// Render
createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <Root />
  </ConvexAuthProvider>
);