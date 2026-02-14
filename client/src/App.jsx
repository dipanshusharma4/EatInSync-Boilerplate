import React from 'react';
import { Route, Switch } from 'wouter';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';

// Pages (to be created)
import Home from './pages/Home';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import MenuScanner from './pages/MenuScanner';

// Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/auth" component={Auth} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/menu-scanner" component={MenuScanner} />
          
          {/* Fallback 404 */}
          <Route>
            <div className="full-height flex-center">
              <h1>404 - Page Not Found</h1>
            </div>
          </Route>
        </Switch>
      </div>
    </AuthProvider>
  );
}

export default App;
