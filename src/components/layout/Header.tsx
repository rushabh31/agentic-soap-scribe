
import React from 'react';
import { Link } from 'react-router-dom';
import { Beaker, Home, FileText, BarChart } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Beaker className="h-6 w-6 text-medical-primary" />
            <h1 className="text-xl font-bold text-medical-text">
              Agentic SOAP Scribe
            </h1>
          </div>
          
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-medical-primary">
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/transcripts" className="flex items-center space-x-1 text-gray-600 hover:text-medical-primary">
                  <FileText className="h-5 w-5" />
                  <span>Transcripts</span>
                </Link>
              </li>
              <li>
                <Link to="/results" className="flex items-center space-x-1 text-gray-600 hover:text-medical-primary">
                  <BarChart className="h-5 w-5" />
                  <span>Results</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
