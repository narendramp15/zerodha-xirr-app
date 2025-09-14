import React, { useState } from 'react'
import { Settings, Key, Shield, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'

export default function BrokerConfig({ config, onSave, onKiteLogin }) {
  const [formData, setFormData] = useState({
    apiKey: config?.apiKey || '',
    apiSecret: config?.apiSecret || '',
    redirectUrl: config?.redirectUrl || 'http://127.0.0.1:8000/auth/callback',
    isConnected: config?.isConnected || false
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave(formData)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Broker Configuration</h2>
        <p className="text-gray-600">Configure your Zerodha Kite Connect API credentials to fetch live data.</p>
      </div>

      {/* Connection Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              formData.isConnected ? 'bg-success-100' : 'bg-gray-100'
            }`}>
              {formData.isConnected ? (
                <CheckCircle className="w-5 h-5 text-success-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {formData.isConnected ? 'Connected to Kite' : 'Not Connected'}
              </h3>
              <p className="text-sm text-gray-600">
                {formData.isConnected 
                  ? 'Your Kite Connect API is configured and working'
                  : 'Configure your API credentials to connect'
                }
              </p>
            </div>
          </div>
          {formData.isConnected && (
            <button
              onClick={onKiteLogin}
              className="btn-primary flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Re-authenticate</span>
            </button>
          )}
        </div>
      </div>

      {/* API Configuration Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              API Credentials
            </h3>
            <button
              type="button"
              onClick={() => setShowSecrets(!showSecrets)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {showSecrets ? 'Hide' : 'Show'} Secrets
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="apiKey" className="label">
                API Key
              </label>
              <input
                id="apiKey"
                name="apiKey"
                type={showSecrets ? 'text' : 'password'}
                className="input"
                placeholder="Enter your Kite API Key"
                value={formData.apiKey}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Get this from your Kite Connect app dashboard
              </p>
            </div>

            <div>
              <label htmlFor="apiSecret" className="label">
                API Secret
              </label>
              <input
                id="apiSecret"
                name="apiSecret"
                type={showSecrets ? 'text' : 'password'}
                className="input"
                placeholder="Enter your Kite API Secret"
                value={formData.apiSecret}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Keep this secret and never share it
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="redirectUrl" className="label">
              Redirect URL
            </label>
            <input
              id="redirectUrl"
              name="redirectUrl"
              type="url"
              className="input"
              placeholder="http://127.0.0.1:8000/auth/callback"
              value={formData.redirectUrl}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This should match the redirect URL in your Kite Connect app
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Your credentials are stored securely</span>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* Setup Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Setup Instructions
        </h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">1</span>
            <div>
              <p className="font-medium">Create a Kite Connect App</p>
              <p>Visit <a href="https://kite.trade/apps" target="_blank" rel="noopener noreferrer" className="underline">kite.trade/apps</a> and create a new app</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">2</span>
            <div>
              <p className="font-medium">Configure Redirect URL</p>
              <p>Set the redirect URL to: <code className="bg-blue-100 px-1 rounded">http://127.0.0.1:8000/auth/callback</code></p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">3</span>
            <div>
              <p className="font-medium">Get API Credentials</p>
              <p>Copy the API Key and API Secret from your app dashboard</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">4</span>
            <div>
              <p className="font-medium">Save & Connect</p>
              <p>Enter your credentials above and click "Save Configuration"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}