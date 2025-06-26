import { useState, useCallback, useEffect } from 'react';
import { api } from '../utils/api.js';

export const useComments = () => {
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});

  const fetchComments = useCallback(async () => {
    try {
      const data = await api.fetchComments();
      
      const commentsBySection = data.reduce((acc, comment) => {
        const key = `${comment.stepId}-${comment.sectionId}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(comment);
        return acc;
      }, {});
      setComments(commentsBySection);
    } catch (error) {
      console.error("Fehler beim Laden der Kommentare:", error);
    }
  }, []); 

  const saveComment = async (stepId, sectionId, currentUser, detailLevel) => {
    const commentKey = `${stepId}-${sectionId}`;
    if (!newComment[commentKey]?.trim() || !currentUser) return;

    try {
      await api.saveComment({
        author: currentUser,
        text: newComment[commentKey],
        stepId,
        sectionId,
        level: detailLevel,
      });
      
      setNewComment({ ...newComment, [commentKey]: '' });
      fetchComments();
    } catch (error) {
      console.error('Fehler beim Speichern des Kommentars:', error);
    }
  };

  const handleDeleteComment = async (commentId, currentUser) => {
    if (!currentUser || !window.confirm("Möchten Sie diesen Kommentar wirklich endgültig löschen?")) return;

    try {
      await api.deleteComment(commentId, currentUser);
      fetchComments();
    } catch (error) {
      console.error('Fehler beim Löschen des Kommentars:', error);
      alert(`Fehler: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    newComment,
    setNewComment,
    showComments,
    setShowComments,
    saveComment,
    handleDeleteComment,
    fetchComments
  };
};