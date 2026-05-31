import React, { useState } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import ProjectDashboard from './pages/ProjectDashboard';

export default function App() {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [selectedProject, setSelectedProject] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setSelectedProject(null);
    };

    if (!user) return <Login onLogin={handleLogin} />;

    if (selectedProject) return (
        <ProjectDashboard
            user={user}
            project={selectedProject}
            onBack={() => setSelectedProject(null)}
            onLogout={handleLogout}
        />
    );

    return (
        <Home
            user={user}
            onLogout={handleLogout}
            onSelectProject={setSelectedProject}
        />
    );
}