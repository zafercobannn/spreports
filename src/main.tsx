import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getFirebaseAnalyticsInstance } from './lib/firebase/firebase-app'

void getFirebaseAnalyticsInstance().catch(() => null)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
