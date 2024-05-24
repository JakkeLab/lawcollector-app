import './App.css';
import './index.css'
import React from 'react';
import axios from 'axios';
import ViewMain from './view/main/viewmain';
import LawList from './view/search/lawlist';

function App() {
  
  return (
    <div className='App'>
      <ViewMain/>
      <LawList/>
    </div>
  )
}

export default App