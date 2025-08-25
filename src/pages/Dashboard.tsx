import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';

const ADMIN_EMAILS = ["geneheo21@gmail.com", "hifsteamedu@gmail.com"];

const Dashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [schedule, setSchedule] = useState(Array.from({ length: 7 }, () => [])); // 7-day timetable

  useEffect(() => {
    const initGoogleAPI = () => {
      gapi.load('client:auth2', () => {
        gapi.client.init({
          clientId: '844865657526-h7akmduv1e0fns71h3d72a88t1t2718u.apps.googleusercontent.com', 
          scope: 'https://www.googleapis.com/auth/drive.file',
        });
      });
    };
    initGoogleAPI();
  }, []);

  const handleLoginSuccess = (response) => {
    const email = response.profileObj.email;
    setIsAdmin(ADMIN_EMAILS.includes(email));
  };

  const handleLoginFailure = (error) => {
    console.error('Google Login Failed:', error);
    alert('Google login failed. Please try again.');
  };

  const updateSchedule = (dayIndex, newTasks) => {
    setSchedule(prev =>
      prev.map((tasks, idx) => (idx === dayIndex ? newTasks : tasks))
    );
  };
};

export default Dashboard;