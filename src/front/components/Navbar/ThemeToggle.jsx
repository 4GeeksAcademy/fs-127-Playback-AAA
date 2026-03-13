import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const isDark = document.documentElement.classList.contains("dark");

  const toggle = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className="relative w-14 h-7 bg-gray-300 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300"
    >
      <span className="absolute inset-0 flex items-center justify-between p-1 text-xs text-gray-700 dark:text-gray-300">
        <Sun className="w-5 h-5" />
        <Moon className="w-5 h-5" />
      </span>
      <span className="block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 dark:translate-x-7" />
    </button>
  );
};