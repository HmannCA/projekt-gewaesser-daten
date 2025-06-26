import React from 'react';

// Diese Komponente wird aktuell nicht verwendet, da der Content direkt in SectionCard.jsx gerendert wird
// Sie könnte für zukünftige Erweiterungen genutzt werden
const SectionContent = ({ content }) => {
  return (
    <div className="section-content">
      {content}
    </div>
  );
};

export default SectionContent;