import { useState } from "react";
import { Search } from "lucide-react";

export const SearchBar = ({ placeholder = "", onSearch, className = "" }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleChange = (e) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 text-theme-muted"></Search>

      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        className="w-full h-10 pl-10 pr-4 rounded-full border border-theme-border bg-theme-input text-theme-text placeholder-theme-faint text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
      />
    </div>
  );
};
