import React from 'react';
import Game from './components/Game';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="clouds"></div>
      <h1 className="title">Colorful Dino Runner</h1>
      <Game />
    </div>
  );
}

export default App;
