import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PublicLayout() {
  const [isDark, setIsDark] = useState(true);

  
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

  
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  
  const backgroundClass = isDark
    ? "bg-gradient-to-br from-black via-[#0b182d] to-black" 
    : "bg-gradient-to-tl from-white via-slate-50 to-blue-50"; 

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClass} text-white`}>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
