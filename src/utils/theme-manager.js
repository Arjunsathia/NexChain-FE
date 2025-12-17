
export const getInitialTheme = () => {
    if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark"; // Default
};

export const applyTheme = (theme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    // Also toggle class for backward compatibility if needed, though config uses attribute now
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem("theme", theme);
};

export const toggleTheme = () => {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") || getInitialTheme();
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    window.dispatchEvent(new Event('theme-change'));
};

// Initialize theme immediately
export const initTheme = () => {
    const theme = getInitialTheme();
    applyTheme(theme);
};
