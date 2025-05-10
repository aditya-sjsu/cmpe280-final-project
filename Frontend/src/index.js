import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';  // Importing global CSS
import App from './App';  // Importing the main App component

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')  // Rendering App inside 'root' div in public/index.html
);
