import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

function DHParameters() {
  const [dhParams, setDhParams] = useState([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchDHParams();
  }, []);

  const fetchDHParams = () => {
    fetch(`${API_BASE_URL}/api/dh_parameters`)
      .then(response => response.json())
      .then(data => setDhParams(data.dh_params))
      .catch(error => console.error('Error fetching DH parameters:', error));
  };

  const handleInputChange = (jointIndex, paramIndex, value) => {
    const newParams = dhParams.map((joint, jIndex) => 
      jIndex === jointIndex 
        ? joint.map((param, pIndex) => pIndex === paramIndex ? parseFloat(value) : param)
        : joint
    );
    setDhParams(newParams);
  };

  const handleSubmit = () => {
    fetch(`${API_BASE_URL}/api/dh_parameters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dh_params: dhParams }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      setEditMode(false);
      fetchDHParams();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-100 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">DH Parameters</h2>
        <button 
          onClick={() => setEditMode(!editMode)} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
        >
          {editMode ? 'Cancel' : 'Edit'}
        </button>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">a</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">α</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">d</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">θ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dhParams.map((param, jointIndex) => (
                <tr key={jointIndex} className={jointIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Joint {jointIndex + 1}</td>
                  {param.map((value, paramIndex) => (
                    <td key={paramIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editMode ? (
                        <input 
                          type="number" 
                          value={value} 
                          onChange={(e) => handleInputChange(jointIndex, paramIndex, e.target.value)}
                          className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editMode && (
          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleSubmit} 
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DHParameters;