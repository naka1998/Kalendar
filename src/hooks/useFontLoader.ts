import { useEffect, useRef } from "react";

export function useFontLoader(googleFontsUrl: string | undefined) {
  const currentLinkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    if (!googleFontsUrl) return;

    // Remove previous font link if different
    if (currentLinkRef.current && currentLinkRef.current.href !== googleFontsUrl) {
      currentLinkRef.current.remove();
      currentLinkRef.current = null;
    }

    // Check if already loaded
    const existing = document.querySelector(`link[href="${googleFontsUrl}"]`);
    if (existing) {
      currentLinkRef.current = existing as HTMLLinkElement;
      return;
    }

    // Insert new link
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = googleFontsUrl;
    document.head.appendChild(link);
    currentLinkRef.current = link;
  }, [googleFontsUrl]);
}
