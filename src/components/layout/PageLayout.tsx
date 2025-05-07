
import React from 'react';
import Header from './Header';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-grow container mx-auto px-4 py-6 ${className}`}>
        {children}
      </main>
      <footer className="bg-gray-50 border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 Agentic SOAP Scribe • Multi-Agent System for Healthcare Documentation
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
