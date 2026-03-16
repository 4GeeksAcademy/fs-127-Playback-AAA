import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const Accordion = ({ items = [] }) => {
    const [open, setOpen] = useState(null);

    return (
        <div className="mt-12 border-t border-main">
            {items.map((item, i) => (
                <div key={i} className="border-b border-main">
                    <button
                        onClick={() => setOpen(open === i ? null : i)}
                        className="w-full flex items-center justify-between py-4 text-sm font-medium text-main hover:text-muted transition-colors text-left"
                    >
                        {item.label}
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                        />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-60 pb-4" : "max-h-0"}`}>
                        <p className="text-sm text-muted leading-relaxed">{item.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};