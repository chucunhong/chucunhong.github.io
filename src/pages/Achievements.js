import React from 'react';
import achievementsData from '../data/achievements.json';
import './Achievements.css';

function Achievements() {
  const { achievements } = achievementsData ;

  return (
    <div className="achievements-page">
      <h2 className="page-title">ACHIEVEMENTS</h2>
      <div className="achievements-list">
        {achievements.map((achievement, idx) => (
          <div key={idx} className="achievement-item">
            <div className="achievement-date">{achievement.date}</div>
            <div className="achievement-content">
              <div className="achievement-title">
                {achievement.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Achievements;
