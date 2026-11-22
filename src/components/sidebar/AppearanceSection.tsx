import { FontSelector } from "./FontSelector";
import { ThemeGrid } from "./ThemeGrid";

export function AppearanceSection() {
  return (
    <div className="space-y-4">
      <ThemeGrid />
      <FontSelector />
    </div>
  );
}
