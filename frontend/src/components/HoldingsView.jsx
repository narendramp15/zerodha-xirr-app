import React, { useState } from 'react'
import { Search, Filter, Download, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

export default function HoldingsView({ holdings, onRefresh, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('pnl')
  const [sortOrder, setSortOrder] = useState('desc')

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const filteredHoldings = holdings?.filter(holding =>
    holding.tradingsymbol.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    let aValue = a[sortBy] || 0
    let bValue = b[sortBy] || 0
    
    if (sortBy === 'tradingsymbol') {
      aValue = aValue.toString()
      bValue = bValue.toString()
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  const totalInvestment = holdings?.reduce((sum, h) => sum + (h.average_price * h.quantity), 0) || 0
  const currentValue = holdings?.reduce((sum, h) => sum + (h.last_price * h.quantity), 0) || 0
  const totalPnL = holdings?.reduce((sum, h) => sum + (h.pnl || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Holdings</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investment</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalInvestment)}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(currentValue)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total P&L</p>
              <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(totalPnL)}
              </p>
            </div>
            <div className={`p-2 rounded-full ${totalPnL >= 0 ? 'bg-success-100' : 'bg-danger-100'}`}>
              {totalPnL >= 0 ? (
                <TrendingUp className="w-5 h-5 text-success-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-danger-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search holdings..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="pnl">P&L</option>
              <option value="tradingsymbol">Symbol</option>
              <option value="quantity">Quantity</option>
              <option value="last_price">Price</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LTP
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P&L %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedHoldings.map((holding, index) => {
                const investment = holding.average_price * holding.quantity
                const currentVal = holding.last_price * holding.quantity
                const pnlPercent = ((holding.last_price - holding.average_price) / holding.average_price) * 100
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{holding.tradingsymbol}</div>
                      <div className="text-sm text-gray-500">{holding.exchange}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {holding.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(holding.average_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(holding.last_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(investment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(currentVal)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                      (holding.pnl || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {formatCurrency(holding.pnl || 0)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                      pnlPercent >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {formatPercentage(pnlPercent)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {sortedHoldings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No holdings found</p>
          </div>
        )}
      </div>
    </div>
  )
}