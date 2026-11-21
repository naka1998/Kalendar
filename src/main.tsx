import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { loadFromStorage } from "@/lib/storageService";
import { useCalendarStore } from "@/stores/calendarStore";
import "./index.css";
import App from "./App.tsx";

async function start() {
  try {
    const saved = await loadFromStorage();
    if (saved) useCalendarStore.setState(saved);
  } catch {
    useCalendarStore.setState({ saveError: "保存データの読み込みに失敗しました。" });
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
