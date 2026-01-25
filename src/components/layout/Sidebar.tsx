'use client';

import { useState } from "react";
import { SidebarItem } from "@/components/ui/SidebarItem";
import { Icon } from "@/components/ui/Icon";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState("Home");

  return (
    // Sidebar Container
    <aside className="w-64 min-h-screen bg-card border-r border-border p-4 flex flex-col gap-2 transition-colors duration-300">
      
      {/* 1. The Logo Area */}
      <div className="flex items-center gap-3 px-4 py-6 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
          B
        </div>
        <span className="font-bold text-xl tracking-tight">BoggleVerse</span>
      </div>

      {/* 2. Main Menu */}
      <div className="text-xs font-bold text-gray-400 mb-2 px-4 tracking-wider uppercase">
        Menu
      </div>

      <SidebarItem 
        icon="home" // Ensure you have a 'home.svg' or change to 'zap'
        label="Home Feed" 
        isActive={activeTab === "Home"} 
        onClick={() => setActiveTab("Home")}
      />
      <SidebarItem 
        icon="zap" 
        label="Shorts" 
        isActive={activeTab === "Shorts"} 
        onClick={() => setActiveTab("Shorts")}
      />
      <SidebarItem 
        icon="explore" // Ensure you have 'bell.svg'
        label="Notifications" 
        isActive={activeTab === "Notifications"} 
        onClick={() => setActiveTab("Notifications")}
      />

      {/* 3. Divider */}
      <div className="h-px bg-border my-4 mx-4" />

      {/* 4. Projects / Library */}
      <div className="text-xs font-bold text-gray-400 mb-2 px-4 tracking-wider uppercase">
        Library
      </div>
      
      <SidebarItem 
        icon="fandom" // Ensure you have 'folder.svg'
        label="My Posts" 
        isActive={activeTab === "Posts"} 
        onClick={() => setActiveTab("Posts")}
      />
      
    </aside>
  );
}