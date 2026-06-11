'use client';

import React from 'react';
import { PlaygroundProvider, usePlayground } from '../context/PlaygroundContext';
import LeftSidebar from '../components/LeftSidebar';
import ChatArea from '../components/ChatArea';
import RightSidebar from '../components/RightSidebar';
import ModelSearchModal from '../components/ModelSearchModal';

function PlaygroundApp() {
  const { isLeftSidebarOpen, setIsLeftSidebarOpen, isRightSidebarOpen, setIsRightSidebarOpen } = usePlayground();

  return (
    <div className="flex h-screen overflow-hidden bg-bg-main text-text-main relative">
      {/* Mesh Gradient Atmosphere Backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_-20%,var(--active-model-border)_0%,rgba(0,0,0,0)_80%)]" />

      {/* Left Sidebar - Models Catalog */}
      <LeftSidebar />

      {/* Main Chat Playground */}
      <ChatArea />

      {/* Right Sidebar - Quotas & Specs Inspector */}
      <RightSidebar />

      {/* Models Search Modal overlay */}
      <ModelSearchModal />

      {/* Backdrop overlay for mobile drawers */}
      {(isLeftSidebarOpen || isRightSidebarOpen) && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden transition-all duration-300 cursor-pointer"
          onClick={() => {
            setIsLeftSidebarOpen(false);
            setIsRightSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <PlaygroundProvider>
      <PlaygroundApp />
    </PlaygroundProvider>
  );
}
