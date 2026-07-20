'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function DashboardShell({
  sidebar,
  header,
  children
}: {
  sidebar: React.ReactNode
  header: React.ReactNode
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Mobile Sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {sidebar}
        
        {/* Mobile close button inside sidebar */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 bg-stone-100 rounded-full md:hidden text-stone-600 hover:bg-stone-200"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Header wrapper to inject mobile hamburger menu button */}
        <div className="relative flex items-center min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-3 z-30 md:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="w-full">
            {header}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0 bg-stone-50">{children}</main>
      </div>
    </div>
  )
}
