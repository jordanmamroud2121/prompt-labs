"use client";

import { ReactNode } from "react";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <LeftSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">{children}</div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-gray-50">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
