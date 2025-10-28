import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/Toast';
import { MainLayout } from './components/MainLayout';
import { queryClient } from './lib/queryClient';
import { Dashboard } from './pages/Dashboard';
import { Categorias } from './pages/Categorias';
import { Regras } from './pages/Regras';
import { Classificar } from './pages/Classificar';
import { AuditoriaPage } from './pages/Auditoria';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/regras" element={<Regras />} />
              <Route path="/classificar" element={<Classificar />} />
              <Route path="/auditoria" element={<AuditoriaPage />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
