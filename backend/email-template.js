// backend/email-template.js

function generateDigestHtml(groupedComments, sectionMap, applicationUrl) {
  let commentsHtml = '';

  for (const stepId in groupedComments) {
    const sectionInfo = sectionMap[stepId] || { title: stepId, icon: '📄' };
    
    commentsHtml += `
      <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
        <h3 style="font-size: 18px; color: #333; margin-top: 0; margin-bottom: 15px; display: flex; align-items: center;">
          <span style="font-size: 24px; margin-right: 10px;">${sectionInfo.icon}</span>
          ${sectionInfo.title}
        </h3>
    `;

    groupedComments[stepId].forEach(comment => {
      const commentTime = comment.parsedDate 
        ? comment.parsedDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        : 'unbekannt';
      commentsHtml += `
        <div style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 5px; padding: 15px; margin-bottom: 10px;">
          <p style="margin: 0 0 10px 0; color: #555;">
            <strong style="color: #0056b3;">${comment.author}</strong>
            <span style="font-size: 0.9em; color: #777;"> schrieb um ${commentTime} Uhr (Level: ${comment.level}):</span>
          </p>
          <p style="margin: 0; font-style: italic; color: #333;">
            "${comment.text}"
          </p>
        </div>
      `;
    });

    commentsHtml += '</div>';
  }

  // Das gesamte HTML-Dokument der E-Mail
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #555; background-color: #f0f2f5; padding: 20px;">
      <div style="max-width: 680px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <h2 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">Tageszusammenfassung</h2>
        <p>Hallo,</p>
        <p>hier ist die Zusammenfassung der heutigen Kommentare auf der Plattform "Digitale Gewässergüte":</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        ${commentsHtml}
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <div style="text-align: center; margin-top: 20px;">
            <a href="${applicationUrl}" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
                Zur Anwendung
            </a>
        </div>
        <br>
        <p style="font-size: 0.8em; color: #888; text-align: center;">Sie erhalten diese E-Mail, da Sie tägliche Zusammenfassungen abonniert haben.</p>
      </div>
    </div>
  `;
}

module.exports = { generateDigestHtml };