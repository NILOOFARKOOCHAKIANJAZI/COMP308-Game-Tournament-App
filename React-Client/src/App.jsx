import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';

import './App.css';

import NavigationBar from './components/shared/NavigationBar.jsx';
import ProtectedRoute from './components/shared/ProtectedRoute.jsx';
import RoleRoute from './components/shared/RoleRoute.jsx';
import NotFound from './components/shared/NotFound.jsx';

import Home from './components/shared/Home.jsx';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';

import AdminDashboard from './components/admin/AdminDashboard.jsx';
import CreateUser from './components/admin/CreateUser.jsx';
import CreateTournament from './components/admin/CreateTournament.jsx';
import AssignPlayerToTournament from './components/admin/AssignPlayerToTournament.jsx';
import PlayerList from './components/admin/PlayerList.jsx';
import TournamentListAdmin from './components/admin/TournamentListAdmin.jsx';

import PlayerDashboard from './components/player/PlayerDashboard.jsx';
import UpcomingTournaments from './components/player/UpcomingTournaments.jsx';
import TournamentHistory from './components/player/TournamentHistory.jsx';

const PageShell = ({ title, text }) => (
  <Container className="content-container">
    <Card className="section-card">
      <Card.Body>
        <h2 className="mb-3">{title}</h2>
        <p className="mb-0">{text}</p>
      </Card.Body>
    </Card>
  </Container>
);

const UnauthorizedPage = () => (
  <PageShell
    title="Unauthorized"
    text="You do not have permission to access this page."
  />
);

function App() {
  return (
    <div className="page-container">
      <NavigationBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <PageShell
                title="Dashboard"
                text="Choose your portal from the navigation bar."
              />
            }
          />

          <Route element={<RoleRoute allowedRole="Admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create-user" element={<CreateUser />} />
            <Route path="/admin/create-tournament" element={<CreateTournament />} />
            <Route path="/admin/assign-player" element={<AssignPlayerToTournament />} />
            <Route path="/admin/players" element={<PlayerList />} />
            <Route path="/admin/tournaments" element={<TournamentListAdmin />} />
          </Route>

          <Route element={<RoleRoute allowedRole="Player" />}>
            <Route path="/player" element={<PlayerDashboard />} />
            <Route path="/player/upcoming-tournaments" element={<UpcomingTournaments />} />
            <Route path="/player/history" element={<TournamentHistory />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;