import { Header } from "@/components/layout/Header";

export default function App() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 shrink-0 overflow-y-auto bg-surface-container-low p-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            Project Config
          </p>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 overflow-y-auto bg-surface-container p-8">
          <div className="mx-auto max-w-2xl">
            <div
              className="aspect-[210/297] w-full rounded-sm bg-surface"
              style={{ boxShadow: "var(--shadow-a4)" }}
            >
              <div className="flex h-full items-center justify-center text-on-surface-variant">
                Calendar Preview
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
