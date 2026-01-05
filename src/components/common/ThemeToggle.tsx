"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Initial theme set from document attribute (which was set by inline script or SSR)
        const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark";
        if (currentTheme) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTheme(currentTheme);
        }
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        // Set cookie for SSR consistency
        document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;

        // Smooth transition effect
        if (!document.startViewTransition) {
            return;
        }
        // Note: View transition API can be used here for extra "WOW" factor if supported
    };

    if (!mounted) {
        return null; // Avoid hydration mismatch
    }

    return (
        <button
            onClick={toggleTheme}
            className={`theme-toggle-btn ${theme}`}
            aria-label="Toggle Dark Mode"
        >
            <div className="icon-wrapper">
                {theme === "light" ? (
                    <Moon size={20} strokeWidth={2.5} />
                ) : (
                    <Sun size={20} strokeWidth={2.5} />
                )}
            </div>
            <span className="toggle-label">{theme === "light" ? "Dark" : "Light"}</span>
        </button>
    );
}
