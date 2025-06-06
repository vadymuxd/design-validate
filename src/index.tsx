import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToolsGallery } from "./screens/ToolsGallery/ToolsGallery";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <ToolsGallery />
  </StrictMode>,
);
