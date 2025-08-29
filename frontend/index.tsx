import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add logging to help debug
console.log('Starting Todo Planer frontend application');

// Create root element
const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (rootElement) {
  console.log('Creating React root');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('Rendering App component');
  // Render the app
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('App rendered successfully');
} else {
  console.error('Root element not found!');
}