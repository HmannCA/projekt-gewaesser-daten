import React from 'react';
import { ChevronLeft, ChevronRight, Beaker, Building2, Users } from 'lucide-react';
import { getLevelIcon, getLevelColor } from '../../constants/config.js';
import SectionCard from '../sections/SectionCard.jsx';
import TagesgangChart from '../charts/TagesgangChart.jsx';
import ValidationChart from '../charts/ValidationChart.jsx';
import ConsolidationTempChart from '../charts/ConsolidationTempChart.jsx';
import QualityFlagChart from '../charts/QualityFlagChart.jsx';
import CostBenefitRadarChart from '../charts/CostBenefitRadarChart.jsx';

const MainContent = ({
  filteredSteps,
  activeStep,
  setActiveStep,
  detailLevel,
  expandedSections,
  toggleSection,
  comments,
  newComment,
  setNewComment,
  showComments,
  setShowComments,
  saveComment,
  handleDeleteComment,
  currentUser,
  setModalImageUrl
}) => {
  const currentStepData = filteredSteps[activeStep];
  
  if (!currentStepData) return null;

  const renderChart = () => {
    switch(currentStepData.id) {
      case 'dateneingabe':
        return (
          <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h5 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Beispiel-Tagesgang (Useriner See, 28.04.2025)</h5>
            <TagesgangChart />
          </div>
        );
      case 'validierung':
        return (
          <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h5 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Beispiel: Spike-Erkennung im pH-Verlauf</h5>
            <ValidationChart />
          </div>
        );
      case 'aggregation':
        return (
          <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h5 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Beispiel: Tageskonsolidierung der Temperatur</h5>
            <ConsolidationTempChart />
          </div>
        );
      case 'quality-flags':
        return (
          <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h5 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Beispiel: Verteilung der Qualitäts-Flags</h5>
            <QualityFlagChart />
          </div>
        );
      case 'kosten-nutzen-analyse':
        return (
          <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h5 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Grafischer Vergleich der Optionen</h5>
            <CostBenefitRadarChart />
          </div>
        );
      default:
        return null;
    }
  };

  // Icon-Mapping direkt hier statt require zu verwenden
  const getIconComponent = (detailLevel) => {
    switch(detailLevel) {
      case 'technik': return Beaker;
      case 'details': return Building2;
      case 'überblick': return Users;
      default: return null;
    }
  };

  const IconComponent = getIconComponent(detailLevel);

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            {currentStepData.icon}
            <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
          </div>
          
          <div className={`p-4 rounded-lg ${getLevelColor(detailLevel)}`}>
            <div className="flex items-center space-x-2 mb-2">
              {IconComponent && <IconComponent className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {detailLevel === 'technik' ? 'Technische Ansicht' : 
                 detailLevel === 'details' ? 'Detail-Ansicht' : 'Überblick'}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {currentStepData.intro[detailLevel]}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-stretch justify-between mb-8">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 w-1/3 transition-colors ${
              activeStep === 0 
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <div className="text-left">
              <span className="text-sm font-medium">Vorheriger Schritt</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                {activeStep > 0 && filteredSteps[activeStep - 1]?.title}
              </span>
            </div>
          </button>
          
          <div className="flex items-center justify-center space-x-2">
            {filteredSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  idx === activeStep ? 'bg-blue-600 scale-125' : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-400'
                }`}
                aria-label={`Gehe zu Schritt ${idx + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setActiveStep(Math.min(filteredSteps.length - 1, activeStep + 1))}
            disabled={activeStep === filteredSteps.length - 1}
            className={`px-4 py-2 rounded-md flex items-center justify-end space-x-2 w-1/3 transition-colors ${
              activeStep === filteredSteps.length - 1 
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <div className="text-right">
              <span className="text-sm font-medium">Nächster Schritt</span>
              <span className={`block text-xs truncate ${activeStep === filteredSteps.length - 1 ? 'text-gray-400' : 'text-blue-200'}`}>
                {activeStep < filteredSteps.length - 1 && filteredSteps[activeStep + 1]?.title}
              </span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Chart if applicable */}
        {renderChart()}

        {/* Sections */}
        <div className="space-y-4">
          {currentStepData.sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              stepId={currentStepData.id}
              detailLevel={detailLevel}
              isExpanded={expandedSections[`${currentStepData.id}-${section.id}`]}
              onToggle={() => toggleSection(currentStepData.id, section.id)}
              comments={comments[`${currentStepData.id}-${section.id}`] || []}
              newComment={newComment}
              setNewComment={setNewComment}
              showComments={showComments}
              setShowComments={setShowComments}
              onSaveComment={saveComment}
              onDeleteComment={handleDeleteComment}
              currentUser={currentUser}
              setModalImageUrl={setModalImageUrl}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default MainContent;