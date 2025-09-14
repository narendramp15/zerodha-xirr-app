import React, { useState, useEffect } from 'react'

const API = typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://127.0.0.1:8000'

export default function App() {
  const [accessToken, setAccessToken] = useState(null)
  const [holdings, setHoldings] = useState(null)
  const [xirr, setXirr] = useState(null)

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const token = hash.get('access_token')
    if (token) {
      sessionStorage.setItem('access_token', token)
      setAccessToken(token)
      window.location.hash = ''
    } else {
      setAccessToken(sessionStorage.getItem('access_token'))
    }
  }, [])

  const login = async () => {
    const r = await fetch(`${API}/auth/login`)
    const j = await r.json()
    window.location.href = j.login_url
  }

  const fetchHoldings = async () => {
    const r = await fetch(`${API}/holdings?access_token=${accessToken}`)
    const j = await r.json()
    setHoldings(j.data || [])
  }

  const demoXirr = async () => {
    const payload = {
      cashflows: [
        {"date": "2024-01-10T00:00:00", "amount": -100000},
        {"date": "2024-06-10T00:00:00", "amount": -25000},
        {"date": "2025-09-10T00:00:00", "amount": 145000}
      ]
    }
    const r = await fetch(`${API}/xirr`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    const j = await r.json()
    setXirr(j.xirr)
  }

  return (
    <div style={{fontFamily:'system-ui', padding:16, maxWidth:900, margin:'0 auto'}}>
      <h1>Zerodha Holdings & XIRR</h1>
      {!accessToken ? (
        <button onClick={login}>Login with Kite</button>
      ) : (
        <div>
          <p>Logged in. <button onClick={fetchHoldings}>Fetch Holdings</button></p>
        </div>
      )}
      {holdings && (
        <div>
          <h2>Holdings ({holdings.length})</h2>
          <table border="1" cellPadding="6">
            <thead>
              <tr><th>Tradingsymbol</th><th>Qty</th><th>Avg Price</th><th>LTP</th><th>P&L</th></tr>
            </thead>
            <tbody>
              {holdings.map((h,i)=>(
                <tr key={i}>
                  <td>{h.tradingsymbol}</td>
                  <td style={{textAlign:'right'}}>{h.quantity}</td>
                  <td style={{textAlign:'right'}}>{h.average_price}</td>
                  <td style={{textAlign:'right'}}>{h.last_price}</td>
                  <td style={{textAlign:'right'}}>{(h.pnl||0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <hr/>
      <h2>XIRR demo</h2>
      <p>This example uses three cashflows. Replace with your data from Tradebook + Dividends.</p>
      <button onClick={demoXirr}>Compute XIRR</button>
      {xirr!=null && <p><b>XIRR:</b> {(xirr*100).toFixed(2)}%</p>}
    </div>
  )
}
