import React from 'react';

const GoogleAuthButton = ({ onSuccess, onFailure }) => (
  <button onClick={() => alert('Implement Google Auth logic')}>
    Sign in with Google
  </button>
);

export default GoogleAuthButton;
