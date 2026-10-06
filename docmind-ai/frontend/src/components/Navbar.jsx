import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="bg-card/50 backdrop-blur-sm border-b border-border/20 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex-shrink-0 text-2xl font-bold text-accent-teal hover:opacity-90 transition-opacity">
            DocMind AI
          </Link>
        </div>
        <div className="hidden md:flex space-x-6">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `nav-link py-1 ${isActive ? 'nav-link-active' : 'hover:text-text-primary'}`
            }
          >
            Home
          </NavLink>
          <NavLink 
            to="/app" 
            className={({ isActive }) => 
              `nav-link py-1 ${isActive ? 'nav-link-active' : 'hover:text-text-primary'}`
            }
          >
            App
          </NavLink>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-border/30 text-text-secondary hover:text-text-primary transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-accent-blue" />
            ) : (
              <Sun className="h-5 w-5 text-accent-teal" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}