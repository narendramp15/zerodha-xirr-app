import React, { useState, useEffect } from 'react'
import Layout from './components/Layout'
import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import HoldingsView from './components/HoldingsView'
import ReturnsAnalysis from './components/ReturnsAnalysis'
import BrokerConfig from './components/BrokerConfig'
import './index.css'

const API = typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://127.0.0.1:8000'

export default function App() {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [holdings, setHoldings] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(false)
  const [brokerConfig, setBrokerConfig] = useState({
    apiKey: '',
    apiSecret: '',
    redirectUrl: 'http://127.0.0.1:8000/auth/callback',
    isConnected: false
  })

  useEffect(() => {
    // Check for access token in URL hash (from Kite redirect)
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const token = hash.get('access_token')
    if (token) {
      sessionStorage.setItem('access_token', token)
      setAccessToken(token)
      setBrokerConfig(prev => ({ ...prev, isConnected: true }))
      window.location.hash = ''
    } else {
      const storedToken = sessionStorage.getItem('access_token')
      if (storedToken) {
        setAccessToken(storedToken)
        setBrokerConfig(prev => ({ ...prev, isConnected: true }))
      }
    }

    // Check for stored user
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Check for stored broker config
    const storedConfig = localStorage.getItem('brokerConfig')
    if (storedConfig) {
      setBrokerConfig(JSON.parse(storedConfig))
    }
  }, [])

  const handleLogin = async (credentials) => {
    setIsLoading(true)
    try {
      // Simulate login - in real app, this would call your auth API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userData = {
        id: 1,
        name: credentials.email.split('@')[0],
        email: credentials.email
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setAccessToken(null)
    setHoldings(null)
    localStorage.removeItem('user')
    sessionStorage.removeItem('access_token')
    setBrokerConfig(prev => ({ ...prev, isConnected: false }))
  }

  const handleKiteLogin = async () => {
    try {
      const response = await fetch(`${API}/auth/login`)
      const data = await response.json()
      window.location.href = data.login_url
    } catch (error) {
      console.error('Kite login failed:', error)
    }
  }

  const fetchHoldings = async () => {
    if (!accessToken) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`${API}/holdings?access_token=${accessToken}`)
      const data = await response.json()
      setHoldings(data.data || [])
    } catch (error) {
      console.error('Failed to fetch holdings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateXIRR = async (cashflows) => {
    try {
      const response = await fetch(`${API}/xirr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashflows })
      })
      return await response.json()
    } catch (error) {
      console.error('XIRR calculation failed:', error)
      throw error
    }
  }

  const saveBrokerConfig = async (config) => {
    setBrokerConfig(config)
    localStorage.setItem('brokerConfig', JSON.stringify(config))
  }

  const getPortfolioStats = () => {
    if (!holdings) return null
    
    const totalInvestment = holdings.reduce((sum, h) => sum + (h.average_price * h.quantity), 0)
    const currentValue = holdings.reduce((sum, h) => sum + (h.last_price * h.quantity), 0)
    const totalPnL = holdings.reduce((sum, h) => sum + (h.pnl || 0), 0)
    
    return { totalInvestment, currentValue, totalPnL }
  }

  // Auto-fetch holdings when we have access token and user is on dashboard/holdings
  useEffect(() => {
    if (accessToken && user && (activeTab === 'dashboard' || activeTab === 'holdings') && !holdings) {
      fetchHoldings()
    }
  }, [accessToken, user, activeTab])

  if (!user) {
    return <LoginForm onLogin={handleLogin} isLoading={isLoading} />
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard holdings={holdings} portfolioStats={getPortfolioStats()} />
      case 'holdings':
        return <HoldingsView holdings={holdings} onRefresh={fetchHoldings} isLoading={isLoading} />
      case 'returns':
        return <ReturnsAnalysis onCalculateXIRR={calculateXIRR} />
      case 'config':
        return <BrokerConfig config={brokerConfig} onSave={saveBrokerConfig} onKiteLogin={handleKiteLogin} />
      default:
        return <Dashboard holdings={holdings} portfolioStats={getPortfolioStats()} />
    }
  }

  return (
    <Layout
      user={user}
      onLogout={handleLogout}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderActiveTab()}
    </Layout>
  )
}