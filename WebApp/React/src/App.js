import React, { useState } from 'react';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import TopNavigation from './components/TopNavigation';

const App = () => {
  const [activeTab, setActiveTab] = useState('jointAngles');
  const [activeView, setActiveView] = useState('default');
  const [jointAngles, setJointAngles] = useState([0, 0, 0, 0, 0, 0]);
  const [dhParams, setDhParams] = useState([
    [0, 90, 0.0, 0],
    [50, 0, 0, 90],
    [50, 0, 0, -90],
    [0, 90, 10, -90],
    [0, -90, 10, 0],
    [0, 0, 10, 0],
  ]);

  const sendToBackend = async () => {
    try {
      const response = await fetch('/api/joint_angles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ joint_angles: jointAngles }),
      });
      const data = await response.json();
      console.log('Backend response:', data);
    } catch (error) {
      console.error('Error sending joint angles to backend:', error);
    }
  };

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