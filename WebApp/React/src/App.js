import React, { useState } from 'react';
import LeftPanel from './components/LeftPanel/LeftPanel';
import RightPanel from './components/RightPanel';
import TopNavigation from './components/TopNavigation';
import useRobotData from './hooks/useRobotData';

const App = () => {
  const [activeTab, setActiveTab] = useState('jointAngles');
  const [activeView, setActiveView] = useState('default');
  const {
    jointAngles,
    setJointAngles,
    dhParams,
    setDhParams,
    sendToBackend
  } = useRobotData();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNavigation setActiveView={setActiveView} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 bg-gray-100 p-4 overflow-auto">
          <LeftPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            jointAngles={jointAngles}
            setJointAngles={setJointAngles}
            dhParams={dhParams}
            setDhParams={setDhParams}
            sendToBackend={sendToBackend}
          />
        </div>
        <div className="w-3/4 bg-white p-4">
          <RightPanel
            activeView={activeView}
            jointAngles={jointAngles}
            dhParams={dhParams}
          />
        </div>
      </div>
    </div>
  );
};

export default App;