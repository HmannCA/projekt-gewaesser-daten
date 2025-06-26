import { API_BASE_URL } from '../constants/config.js';

// Zentrale API-Funktionen
export const api = {
  // Kommentare
  async fetchComments() {
    const response = await fetch(`${API_BASE_URL}/api/comments`);
    if (!response.ok) {
      throw new Error('Netzwerk-Antwort war nicht ok.');
    }
    return response.json();
  },

  async saveComment(commentData) {
    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) {
      throw new Error('Fehler beim Speichern des Kommentars');
    }
    return response.json();
  },

  async deleteComment(commentId, user) {
    const response = await fetch(`${API_BASE_URL}/api/comments/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, user }),
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData);
    }
    return response.ok;
  },

  // Benutzer
  async loginUser(userData) {
    const response = await fetch(`${API_BASE_URL}/api/user-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      throw new Error('Fehler beim Login');
    }
    return response.json();
  },

  // Wasserdaten (für zukünftige Implementierung)
  async fetchWaterQualityData(params) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/v1/observations?${queryString}`);
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Wasserdaten');
    }
    return response.json();
  }
};