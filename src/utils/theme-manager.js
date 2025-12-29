
export const getInitialTheme = () => {
    if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme || "dark";
    }
    return "dark"; 
};

export const applyTheme = (theme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    
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


export const initTheme = () => {
    const theme = getInitialTheme();
    applyTheme(theme);
};
