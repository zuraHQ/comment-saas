"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Choice = "light" | "dark" | "system";
const KEY = "astrix-theme";

// Same storage key the dashboard uses, so a choice made here carries over.
function apply(choice: Choice) {
  const root = document.documentElement;
  const dark =
    choice === "dark" ||
    (choice === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  if (choice === "system") localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, choice);
}

const OPTIONS: Array<{ value: Choice; Icon: typeof Sun; label: string }> = [
  { value: "light", Icon: Sun, label: "Light" },
  { value: "system", Icon: Monitor, label: "System" },
  { value: "dark", Icon: Moon, label: "Dark" },
];

export default function ThemeToggle() {
  const [choice, setChoice] = useState<Choice>("system");

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    setChoice(stored === "light" || stored === "dark" ? stored : "system");
  }, []);

  // Follow the OS while the choice is system.
  useEffect(() => {
    if (choice !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [choice]);

  return (
    <div className="flex items-center border border-border">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-label={option.label}
          aria-pressed={choice === option.value}
          onClick={() => {
            setChoice(option.value);
            apply(option.value);
          }}
          className={cn(
            "flex size-8 cursor-pointer items-center justify-center transition-colors",
            choice === option.value
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <option.Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
