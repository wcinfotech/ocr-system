import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import BillDetailPage from './pages/BillDetailPage';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#252542',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#252542' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#252542' } },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bill/:id" element={<BillDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
