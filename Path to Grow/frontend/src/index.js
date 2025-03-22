import React from "react";
import ReactDOM from "react-dom/client";  // ✅ Correct import for React 18
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App"; // ✅ Ensure correct case in file name
import "bootstrap/dist/css/bootstrap.min.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("❌ Error: 'root' element not found in index.html");
}
