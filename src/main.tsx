import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from "@/components/ui/sonner"
import Router from './Router.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/authContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
        <Router />
      </AuthProvider>
    </BrowserRouter>
    <Toaster richColors />
  </StrictMode>,
)
