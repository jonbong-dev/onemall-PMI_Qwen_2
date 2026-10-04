import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Inventory from './pages/Inventory';
import Team from './pages/Team';
import ActivityLog from './pages/ActivityLog';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/team" element={<Team />} />
          <Route path="/activity" element={<ActivityLog />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
