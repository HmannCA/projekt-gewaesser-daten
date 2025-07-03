// HINWEIS: Dies ist Ihr Original-Code, der nur um die Umschalt-Funktionalität erweitert wurde.

import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import MainContent from './components/layout/MainContent.jsx';
import HeroSection from './components/HeroSection.jsx';
import LoginModal from './components/LoginModal.jsx';
import IntroModal from './components/modals/IntroModal.jsx';
import ImageModal from './components/modals/ImageModal.jsx';
import UseCaseModal from './components/modals/UseCaseModal.jsx';
import ExplanationModal from './components/modals/ExplanationModal.jsx';
import { useComments } from './hooks/useComments.js';
import { useAuth } from './hooks/useAuth.js';
import { useDarkMode } from './hooks/useDarkMode.js';
import { createSteps } from './data/steps.jsx';
import { DETAIL_LEVELS } from './constants/config.js';

import DataValidator from './components/DataValidator.jsx';
import DbViewer from './components/DbViewer.jsx';


function App() {
  // Ihr bestehender State (unverändert)
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState(null);
  const [codeExplanation, setCodeExplanation] = useState(null);
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [detailLevel, setDetailLevel] = useState(DETAIL_LEVELS.DETAILS);
  const [activeStep, setActiveStep] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ==========================================================
  // --- BEGINN DER ERGÄNZUNG 2: STATE FÜR ANSICHT-WECHSEL ---
  const [activeView, setActiveView] = useState('showcase'); // 'showcase' oder 'validator'
  // --- ENDE DER ERGÄNZUNG 2 ---
  // ==========================================================
  
  // Ihre bestehenden Hooks (unverändert)
  const { darkMode, setDarkMode } = useDarkMode();
  const { 
    currentUser, 
    showLoginModal, 
    setShowLoginModal, 
    handleLogin, 
    handleLogout, 
    handleNotificationChange 
  } = useAuth();
  
  const { 
    comments, 
    newComment, 
    setNewComment, 
    showComments, 
    setShowComments, 
    saveComment, 
    handleDeleteComment 
  } = useComments();

  // Ihre bestehenden Handler und Daten (unverändert)
  const handlers = {
    setSelectedUseCase,
    setCodeExplanation,
    setModalImageUrl
  };
  const steps = createSteps(handlers);
  const filteredSteps = steps.filter(step => 
    step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (step.intro[detailLevel] || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const toggleSection = (stepId, sectionId) => {
    const key = `${stepId}-${sectionId}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  const handleSaveComment = (stepId, sectionId) => {
    saveComment(stepId, sectionId, currentUser, detailLevel);
  };
  const handleCommentDelete = (commentId) => {
    handleDeleteComment(commentId, currentUser);
  };
  const handleIntroClose = () => {
    setShowIntroModal(false);
    if (!currentUser) {
      setShowLoginModal(true);
    }
  };
  useEffect(() => {
    if (!currentUser) {
      const hasSeenIntro = localStorage.getItem('hasSeenIntroModal');
      if (hasSeenIntro !== 'true') {
        setShowIntroModal(true);
      } else {
        setShowLoginModal(true);
      }
    }
  }, [currentUser, setShowLoginModal]);


  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Header-Wrapper, der HeroSection und Header zusammenfasst */}
      <div className="w-full">
        <HeroSection />
        <Header
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            detailLevel={detailLevel}
            setDetailLevel={setDetailLevel}
            currentUser={currentUser}
            handleLogout={handleLogout}
            handleNotificationChange={handleNotificationChange}
            setShowLoginModal={setShowLoginModal}
            setShowIntroModal={setShowIntroModal}
            setActiveView={setActiveView}
        />
      </div>

      {/* Haupt-Inhaltsbereich, der den Rest der Seite einnimmt */}
      <div className="flex flex-1">
        {activeView === 'showcase' ? (
          <>
            <Sidebar
              sidebarOpen={sidebarOpen}
              filteredSteps={filteredSteps}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <MainContent
              filteredSteps={filteredSteps}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              detailLevel={detailLevel}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              comments={comments}
              newComment={newComment}
              setNewComment={setNewComment}
              showComments={showComments}
              setShowComments={setShowComments}
              saveComment={handleSaveComment}
              handleDeleteComment={handleCommentDelete}
              currentUser={currentUser}
              setModalImageUrl={setModalImageUrl}
            />
          </>
        ) : activeView === 'validator' ? (
          <div className="w-full">
            <DataValidator />
          </div>
        ) : (
          <div className="w-full">
            <DbViewer />
          </div>
        )}
      </div>

      {/* Ihre bestehenden Modals bleiben unverändert */}
      <IntroModal show={showIntroModal} onClose={handleIntroClose} />
      <LoginModal show={showLoginModal} onLogin={handleLogin} />
      <ImageModal imageUrl={modalImageUrl} onClose={() => setModalImageUrl(null)} />
      <UseCaseModal useCase={selectedUseCase} onClose={() => setSelectedUseCase(null)} />
      <ExplanationModal explanation={codeExplanation} onClose={() => setCodeExplanation(null)} />
    </div>
  );
}

export default App;