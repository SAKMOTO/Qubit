import React from 'react';

const Archive = () => {
  const archivedItems = [
    { id: 1, name: 'Quantum Experiment #1', date: '2024-01-15', type: 'experiment' },
    { id: 2, name: 'Research Paper Draft', date: '2024-01-10', type: 'document' },
    { id: 3, name: 'Team Meeting Notes', date: '2024-01-05', type: 'notes' },
    { id: 4, name: 'Project Timeline', date: '2023-12-20', type: 'project' },
  ];

  return (
    <div className="page-container">
      <h1>Archive</h1>
      <div className="content-box">
        <h2>Archived Items</h2>
        <div className="archive-list">
          {archivedItems.map(item => (
            <div key={item.id} className="archive-item">
              <div className="item-icon">
                {item.type === 'experiment' && '🧪'}
                {item.type === 'document' && '📄'}
                {item.type === 'notes' && '📝'}
                {item.type === 'project' && '📊'}
              </div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>Archived on {item.date}</p>
              </div>
              <button className="restore-btn">Restore</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Archive;
