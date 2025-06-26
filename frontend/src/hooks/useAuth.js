import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api.js';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (userData) => {
    console.log("Neuer Login:", userData);
    
    const userToSave = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      notificationFrequency: userData.wantsNotifications 
    };

    setCurrentUser(userToSave);
    localStorage.setItem('currentUser', JSON.stringify(userToSave));
    setShowLoginModal(false);

    try {
      await api.loginUser(userToSave);
    } catch (error) {
      console.error('Fehler beim Synchronisieren der Nutzerdaten:', error);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setShowLoginModal(true);
  };

  const handleNotificationChange = useCallback(async (event) => {
    if (!currentUser) return;

    const wantsNotifications = event.target.checked;
    const updatedUser = { ...currentUser, wantsNotifications };

    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    try {
      await api.loginUser(updatedUser);
      console.log(`Benachrichtigungs-Status für ${currentUser.email} auf ${wantsNotifications} gesetzt.`);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Benachrichtigungs-Einstellung:', error);
    }
  }, [currentUser]);

  return {
    currentUser,
    showLoginModal,
    setShowLoginModal,
    handleLogin,
    handleLogout,
    handleNotificationChange
  };
};