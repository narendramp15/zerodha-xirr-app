import React from 'react'
import { TrendingUp, LogOut, Settings, BarChart3 } from 'lucide-react'

export default function Layout({ children, user, onLogout, activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'holdings', label: 'Holdings', icon: TrendingUp },
    { id: 'returns', label: 'Returns', icon: BarChart3 },
    { id: 'config', label: 'Config', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-primary-600" />
                <h1 className="text-xl font-bold text-gray-900">Portfolio Tracker</h1>
              </div>
              
              {user && (
                <div className="hidden md:flex space-x-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}