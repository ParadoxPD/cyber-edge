import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Material Dashboard 2 React Context Provider
import { MaterialUIControllerProvider } from "context";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MaterialUIControllerProvider>
      <App />
    </MaterialUIControllerProvider>
  </StrictMode>
);

// import React from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import App from "App";

// const container = document.getElementById("app");
// const root = createRoot(container);

// root.render(
//   <BrowserRouter>
//     <MaterialUIControllerProvider>
//       <App />
//     </MaterialUIControllerProvider>
//   </BrowserRouter>
// );
