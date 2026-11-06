import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './lib/auth'
import { ContentProvider } from './lib/content'
import { AudioProvider } from './hooks/useAudio'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <ContentProvider><AudioProvider>
          <App />
        </AudioProvider></ContentProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
