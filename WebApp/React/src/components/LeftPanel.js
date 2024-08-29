import React from 'react';
import JointAngles from './JointAngles';
import DHParameters from './DHParameters';
import Move from './Move';

const LeftPanel = ({
  activeTab,
  setActiveTab,
  jointAngles,
  setJointAngles,
  dhParams,
  setDhParams,
  sendToBackend,
}) => {
  const tabs = [
    { id: 'jointAngles', label: 'Joint Angles' },
    { id: 'dhParameters', label: 'DH Parameters' },
    { id: 'move', label: 'Move' },
  ];

  return (
    <div>
      <div className="flex mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`mr-2 px-3 py-2 rounded ${
              activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'jointAngles' && (
          <JointAngles
            jointAngles={jointAngles}
            setJointAngles={setJointAngles}
            sendToBackend={sendToBackend}
          />
        )}
        {activeTab === 'dhParameters' && (
          <DHParameters dhParams={dhParams} setDhParams={setDhParams} />
        )}
        {activeTab === 'move' && <Move />}
      </div>
    </div>
  );
};

export default LeftPanel;