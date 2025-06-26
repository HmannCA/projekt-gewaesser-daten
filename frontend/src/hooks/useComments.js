// HINWEIS: Angepasst an die korrekten Exporte aus api.js

import { useState, useEffect, useCallback } from 'react';
// ==========================================================
// --- BEGINN DER KORREKTUR ---
// Wir importieren jetzt die spezifischen Funktionen, die wir brauchen,
// anstatt eines nicht-existenten 'api'-Objekts.
import { getCommentsForSection, postComment, deleteCommentById } from '../utils/api';
// --- ENDE DER KORREKTUR ---
// ==========================================================

export const useComments = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState({});

  // Kommentare für einen bestimmten Abschnitt laden
  const fetchComments = useCallback(async (stepId, sectionId) => {
    try {
      // Annahme: Sie möchten Kommentare pro section laden.
      // Falls Sie alle auf einmal laden, müsste diese Logik angepasst werden.
      const key = `${stepId}-${sectionId}`;
      const fetchedComments = await getCommentsForSection(key);
      setComments(prev => [...prev.filter(c => c.sectionId !== key), ...fetchedComments]);
    } catch (error) {
      console.error("Fehler beim Laden der Kommentare:", error);
    }
  }, []);

  // Kommentar speichern
  const saveComment = async (stepId, sectionId, currentUser, level) => {
    if (!newComment.trim() || !currentUser) return;

    const commentData = {
      author: {
        firstName: currentUser.firstName,
        email: currentUser.email
      },
      text: newComment,
      stepId,
      sectionId: `${stepId}-${sectionId}`,
      level
    };

    try {
      const savedComment = await postComment(commentData);
      setComments(prev => [...prev, savedComment]);
      setNewComment('');
    } catch (error) {
      console.error("Fehler beim Speichern des Kommentars:", error);
      alert("Kommentar konnte nicht gespeichert werden.");
    }
  };

  // Kommentar löschen
  const handleDeleteComment = async (commentId, currentUser) => {
    if (!currentUser || currentUser.email !== 'admin@wamo.dev') { // Beispiel für Admin-Check
        alert("Nur Administratoren können Kommentare löschen.");
        return;
    }

    if (window.confirm("Sind Sie sicher, dass Sie diesen Kommentar löschen möchten?")) {
        try {
            await deleteCommentById(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) {
            console.error("Fehler beim Löschen des Kommentars:", error);
            alert("Fehler beim Löschen des Kommentars.");
        }
    }
  };

  // Initiales Laden (Beispiel, falls Sie alle Kommentare am Anfang laden wollen)
  // Dies müsste angepasst werden, je nachdem, wie Ihre App strukturiert ist.
  useEffect(() => {
    // Falls Sie einen Mechanismus haben, um alle Kommentare zu Beginn zu laden,
    // würde er hier stehen. Aktuell laden wir sie bei Bedarf mit fetchComments.
  }, []);

  return {
    comments,
    newComment,
    setNewComment,
    showComments,
    setShowComments,
    fetchComments, // exportieren, um es bei Bedarf aufzurufen
    saveComment,
    handleDeleteComment
  };
};