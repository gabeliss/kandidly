import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Challenges from "./Challenges";

import Interviews from "./Interviews";

import Analytics from "./Analytics";

import TakeChallenge from "./TakeChallenge";

import Login from "./Login";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUser } from '../api/auth';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Challenges: Challenges,
    
    Interviews: Interviews,
    
    Analytics: Analytics,
    
    TakeChallenge: TakeChallenge,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

function RequireAuth({ children }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    useEffect(() => {
        getUser().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
    }, []);
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                <Route path="/login" element={<Login />} />
                <Route path="/TakeChallenge" element={<TakeChallenge />} />
                <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/Dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/Challenges" element={<RequireAuth><Challenges /></RequireAuth>} />
                <Route path="/Interviews" element={<RequireAuth><Interviews /></RequireAuth>} />
                <Route path="/Analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}