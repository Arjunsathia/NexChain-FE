import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PublicLayout() {
  const [isDark, setIsDark] = useState(true);

  // 💡 Function to toggle Dark Mode globally
  const toggleDarkMode = () => {
    setIsDark(prevIsDark => {
      const newIsDark = !prevIsDark;
      if (newIsDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newIsDark;
    });
  };

  // Set initial theme based on state
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  // 💡 Gradient classes switched based on isDark state
  const backgroundClass = isDark
    ? "bg-gradient-to-br from-black via-[#0b182d] to-black" // Original Dark Gradient
    : "bg-gradient-to-tl from-white via-slate-50 to-blue-50"; // 💨 Subtle Premium Cool Gradient

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClass} text-white`}>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
