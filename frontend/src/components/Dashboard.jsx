import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from 'lucide-react'

export default function Dashboard({ holdings, portfolioStats }) {
  const stats = [
    {
      name: 'Total Investment',
      value: portfolioStats?.totalInvestment || 0,
      change: '+2.5%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      name: 'Current Value',
      value: portfolioStats?.currentValue || 0,
      change: '+5.2%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Total P&L',
      value: portfolioStats?.totalPnL || 0,
      change: portfolioStats?.totalPnL >= 0 ? '+' : '',
      changeType: portfolioStats?.totalPnL >= 0 ? 'positive' : 'negative',
      icon: portfolioStats?.totalPnL >= 0 ? TrendingUp : TrendingDown,
    },
    {
      name: 'Holdings Count',
      value: holdings?.length || 0,
      change: '',
      changeType: 'neutral',
      icon: PieChart,
    },
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const topPerformers = holdings?.slice(0, 5).sort((a, b) => (b.pnl || 0) - (a.pnl || 0)) || []

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof stat.value === 'number' && stat.name !== 'Holdings Count' 
                        ? formatCurrency(stat.value)
                        : stat.value
                      }
                    </p>
                    {stat.change && (
                      <p className={`text-sm ${
                        stat.changeType === 'positive' ? 'text-success-600' : 
                        stat.changeType === 'negative' ? 'text-danger-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${
                    stat.changeType === 'positive' ? 'bg-success-100' :
                    stat.changeType === 'negative' ? 'bg-danger-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.changeType === 'positive' ? 'text-success-600' :
                      stat.changeType === 'negative' ? 'text-danger-600' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {topPerformers.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {topPerformers.map((holding, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{holding.tradingsymbol}</p>
                  <p className="text-sm text-gray-600">{holding.quantity} shares</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    (holding.pnl || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {formatCurrency(holding.pnl || 0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(holding.last_price || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}