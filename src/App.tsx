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

  const fileSaveStateHandler = (arg:{ isExported: boolean, reason?: string;}) => {
    if(arg.isExported){
      setStatusList([...statusList, {content: 'Exported PDFs successfully', isAlert: false}]);
    } else {
      setStatusList([...statusList, {content: 'Failed to export PDFs', isAlert: true}]);
    }
  }

  const removeStatusHandler = (index: number) => {
    const newList = statusList.filter((_, i) => i !== index);
    setStatusList(newList);
  };

  return (
    <div className='App' style={{
      backgroundSize: 'contain',
      backgroundPosition:'center',
      backgroundRepeat:'no-repeat',
    }}>
      <ViewMain/>
      <LawList fileLoadHander={fileLoadHandler} fileSaveStateHandler={fileSaveStateHandler}/>
      <StatusStack statusList={statusList} removeStatusHandler={removeStatusHandler} />
    </div>
  )
}

export default App