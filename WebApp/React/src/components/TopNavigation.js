import React from 'react';

const TopNavigation = ({ setActiveView }) => {
  const views = ['default', 'view1', 'view2', 'view3'];

  return (
    <div className="bg-gray-800 p-4">
      <div className="flex">
        {views.map((view) => (
          <button
            key={view}
            className="mr-2 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            onClick={() => setActiveView(view)}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopNavigation;