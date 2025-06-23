// src/components/LoginModal.jsx
import React, { useState } from 'react';
import { LogIn, AtSign, User } from 'lucide-react';

const LoginModal = ({ onLogin, show }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [notify, setNotify] = useState('daily');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // Einfache Validierung
    if (!firstName || !lastName || !email) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    // Domain-Validierung
    const validDomains = ['@kreis-vg.de', '@ikt-ost.de'];
    if (!validDomains.some(domain => email.endsWith(domain))) {
      setError('Bitte verwenden Sie Ihre dienstliche E-Mailadresse');
      return;
    }

    setError('');
    onLogin({ firstName, lastName, email, wantsNotifications: notify });
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Anmeldung zur Kommentierung</h2>
        
        {error && <p className="text-sm text-center text-red-500">{error}</p>}

        <div className="space-y-4">
          <div className="relative">
            <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Vorname" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div className="relative">
            <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Nachname" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div className="relative">
            <AtSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" placeholder="E-Mail-Adresse" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>
        </div>

        <div>
            <label htmlFor="notificationFrequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                E-Mail-Benachrichtigungen
            </label>
            <select
                id="notificationFrequency"
                value={notify}
                onChange={(e) => setNotify(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
                <option value="immediate">Sofort bei jedem Kommentar</option>
                <option value="daily">Täglich (eine Zusammenfassung)</option>
                <option value="none">Nie</option>
            </select>
        </div>
        
        <button onClick={handleLogin} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <LogIn className="w-5 h-5 mr-2" />
          Anmelden & Teilnehmen
        </button>
      </div>
    </div>
  );
};

export default LoginModal;