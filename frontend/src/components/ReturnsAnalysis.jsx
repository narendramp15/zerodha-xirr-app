import React, { useState } from 'react'
import { Calculator, Plus, Trash2, Calendar, DollarSign } from 'lucide-react'

export default function ReturnsAnalysis({ onCalculateXIRR }) {
  const [cashflows, setCashflows] = useState([
    { date: '2024-01-10', amount: -100000, description: 'Initial Investment' },
    { date: '2024-06-10', amount: -25000, description: 'Additional Investment' },
    { date: '2025-01-10', amount: 145000, description: 'Current Value' }
  ])
  const [xirr, setXirr] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const addCashflow = () => {
    setCashflows([...cashflows, { date: '', amount: 0, description: '' }])
  }

  const removeCashflow = (index) => {
    setCashflows(cashflows.filter((_, i) => i !== index))
  }

  const updateCashflow = (index, field, value) => {
    const updated = [...cashflows]
    updated[index] = { ...updated[index], [field]: value }
    setCashflows(updated)
  }

  const calculateXIRR = async () => {
    setIsCalculating(true)
    try {
      const formattedCashflows = cashflows
        .filter(cf => cf.date && cf.amount !== 0)
        .map(cf => ({
          date: new Date(cf.date).toISOString(),
          amount: parseFloat(cf.amount)
        }))

      const result = await onCalculateXIRR(formattedCashflows)
      setXirr(result.xirr)
    } catch (error) {
      console.error('XIRR calculation failed:', error)
      setXirr(null)
    } finally {
      setIsCalculating(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount))
  }

  const totalInvestment = cashflows
    .filter(cf => cf.amount < 0)
    .reduce((sum, cf) => sum + Math.abs(cf.amount), 0)

  const totalReturns = cashflows
    .filter(cf => cf.amount > 0)
    .reduce((sum, cf) => sum + cf.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Returns Analysis</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={calculateXIRR}
            disabled={isCalculating || cashflows.length < 2}
            className="btn-primary flex items-center space-x-2"
          >
            <Calculator className="w-4 h-4" />
            <span>{isCalculating ? 'Calculating...' : 'Calculate XIRR'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investment</p>
              <p className="text-xl font-bold text-danger-600">
                -{formatCurrency(totalInvestment)}
              </p>
            </div>
            <div className="p-2 bg-danger-100 rounded-full">
              <DollarSign className="w-5 h-5 text-danger-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-xl font-bold text-success-600">
                +{formatCurrency(totalReturns)}
              </p>
            </div>
            <div className="p-2 bg-success-100 rounded-full">
              <DollarSign className="w-5 h-5 text-success-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">XIRR</p>
              <p className={`text-xl font-bold ${
                xirr !== null ? (xirr >= 0 ? 'text-success-600' : 'text-danger-600') : 'text-gray-400'
              }`}>
                {xirr !== null ? `${(xirr * 100).toFixed(2)}%` : 'Not calculated'}
              </p>
            </div>
            <div className="p-2 bg-primary-100 rounded-full">
              <Calculator className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cashflows */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Cashflows</h3>
          <button
            onClick={addCashflow}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Cashflow</span>
          </button>
        </div>

        <div className="space-y-4">
          {cashflows.map((cashflow, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="label">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    className="input pl-10"
                    value={cashflow.date}
                    onChange={(e) => updateCashflow(index, 'date', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    className="input pl-10"
                    placeholder="Enter amount"
                    value={cashflow.amount}
                    onChange={(e) => updateCashflow(index, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Negative for investments, positive for returns
                </p>
              </div>
              
              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Description"
                  value={cashflow.description}
                  onChange={(e) => updateCashflow(index, 'description', e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => removeCashflow(index)}
                  className="btn-danger flex items-center space-x-2"
                  disabled={cashflows.length <= 2}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How to use XIRR Calculator:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Add negative amounts for money invested (purchases)</li>
            <li>• Add positive amounts for money received (sales, dividends)</li>
            <li>• Include the current portfolio value as a positive amount on today's date</li>
            <li>• XIRR calculates the annualized return rate considering the timing of cashflows</li>
          </ul>
        </div>
      </div>
    </div>
  )
}