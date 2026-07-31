import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          gutter={12}
          containerClassName="!mt-3"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1c1917",
              color: "#fff",
              borderRadius: "10px",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            },
            success: {
              iconTheme: { primary: "#34d399", secondary: "#1c1917" },
            },
            error: {
              iconTheme: { primary: "#f87171", secondary: "#1c1917" },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
