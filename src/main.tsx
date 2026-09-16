import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Register PWA Service Worker immediately (ensures activation without missing load event)
if ('serviceWorker' in navigator) {
  const registerSW = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Rahim Store PWA ServiceWorker registered with scope:', registration.scope)
      })
      .catch((error) => {
        console.warn('Rahim Store PWA ServiceWorker registration failed:', error)
      })
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    registerSW()
  } else {
    window.addEventListener('load', registerSW)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
