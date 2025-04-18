import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from './components/layout/layout';
import { Dashboard } from './components/dashboard/dashboard';
import { Teams } from './components/teams/teams';
import { TeamDetail } from './components/teams/team-detail';
import { Projects } from './components/projects/projects';
import { ProjectDetail } from './components/projects/project-detail';
import { Calendar } from './components/calendar/calendar';
import { Users } from './components/users/users';
import { SAV } from './components/sav/sav';
import { Clients } from './components/clients/clients';
import { ClientDetail } from './components/clients/client-detail';
import { Loading } from './components/loading/loading';
import { Products } from './components/products/products';
import { ProductDetail } from './components/products/product-detail';
import { Maintenance } from './components/maintenance/maintenance';
import { Login } from './components/login/login';
import { History } from './components/history/history';
import { ContractDetailPage } from './components/maintenance/components/ContractDetailPage';
import { CreateProjectForm } from './components/projects/components/add-project';
// Import the SAVProvider
import { SAVProvider } from './contexts/sav-context';

// Composant de protection de route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  if (!currentUser || !currentUser.id) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background"
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/teams/:id" element={<TeamDetail />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/loading" element={<Loading />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/projects/create" element={<CreateProjectForm />} />
                  <Route path="/sav" element={<SAV />} />
                  {/* Wrap the SAV component with SAVProvider */}
                  <Route path="/sav" element={
                    <SAVProvider>
                      <SAV />
                    </SAVProvider>
                  } />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/:id" element={<ClientDetail />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/ContractDetailPage" element={<ContractDetailPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </motion.div>
    </Router>
  );
}

export default App;