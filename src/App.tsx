import './App.css';
import './index.css'
import React, { useState }  from 'react';
import ViewMain from './view/main/viewmain';
import LawList from './view/common/list/lawlist';
import { IStatus } from './type/statusblockarg';
import StatusStack from './view/common/status/statusstack';

function App() {
  const [statusList, setStatusList] = useState<Array<IStatus>>([]);
  
  const fileLoadHandler = (arg: { isLoaded: boolean; reason?: string; }) => {
    if (arg.isLoaded) {
      setStatusList([...statusList, { content: 'File loaded successfully', isAlert: false }]);
    } else {
      setStatusList([...statusList, { content: `Failed to load file: ${arg.reason}`, isAlert: true }]);
    }
  };

  const removeStatusHandler = (index: number) => {
    const newList = statusList.filter((_, i) => i !== index);
    setStatusList(newList);
  };

  return (
    <div className='App'>
      <ViewMain/>
      <LawList fileLoadHander={fileLoadHandler}/>
      <StatusStack statusList={statusList} removeStatusHandler={removeStatusHandler} />
    </div>
  )
}

export default App