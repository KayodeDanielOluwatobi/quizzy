'use client';

import { Icon, IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: IconName;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function SidebarItem({ icon, label, isActive, onClick }: SidebarItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 my-1 rounded-xl cursor-pointer transition-all duration-300 group overflow-hidden select-none",
        // Light Mode: Simple gray hover
        // Dark Mode: Subtle white hover
        !isActive && "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 dark:text-gray-400 dark:hover:text-white"
      )}
    >
      {/* === THE GLOW MAGIC (Only shows when active) === */}
      {isActive && (
        <>
          {/* 1. The Light Leak (Gradient Background) */}
          <div className="absolute inset-0 bg-primary/10 dark:bg-linear-to-r dark:from-primary/20 dark:to-transparent" />
          
          {/* 2. The Neon Bar (Left Edge) - Dark Mode Only */}
          <div className="hidden dark:block absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full shadow-[0_0_12px_2px_var(--color-primary)]" />
          
          {/* 3. The Clean Indicator (Left Edge) - Light Mode Only */}
          <div className="block dark:hidden absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-full" />
        </>
      )}

      {/* The Icon */}
      <Icon 
        name={icon} 
        variant={isActive ? "filled" : "stroked"} // Auto-switch style!
        className={cn(
          "relative z-10 w-5 h-5 transition-colors duration-300",
          // Text color matches the Primary Brand color when active
          isActive ? "text-primary" : "group-hover:text-foreground"
        )} 
      />
      
      {/* The Label */}
      <span 
        className={cn(
          "relative z-10 font-medium text-sm transition-colors duration-300",
          isActive ? "text-primary dark:text-foreground" : "group-hover:text-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}