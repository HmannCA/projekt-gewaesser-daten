export const dailyChartData = [
  { time: '00:00', pH: 8.61, sauerstoff: 12.2 }, 
  { time: '01:00', pH: 8.62, sauerstoff: 12.3 },
  { time: '02:00', pH: 8.63, sauerstoff: 12.4 }, 
  { time: '03:00', pH: 8.65, sauerstoff: 12.5 },
  { time: '04:00', pH: 8.68, sauerstoff: 12.6 }, 
  { time: '05:00', pH: 8.71, sauerstoff: 12.7 },
  { time: '06:00', pH: 8.74, sauerstoff: 12.8 }, 
  { time: '07:00', pH: 8.77, sauerstoff: 12.9 },
  { time: '08:00', pH: 8.80, sauerstoff: 13.0 }, 
  { time: '09:00', pH: 8.83, sauerstoff: 13.1 },
  { time: '10:00', pH: 8.85, sauerstoff: 13.2 }, 
  { time: '11:00', pH: 8.87, sauerstoff: 13.3 },
  { time: '12:00', pH: 8.88, sauerstoff: 13.4 }, 
  { time: '13:00', pH: 8.89, sauerstoff: 13.5 },
  { time: '14:00', pH: 8.90, sauerstoff: 13.6 }, 
  { time: '15:00', pH: 8.90, sauerstoff: 13.6 },
  { time: '16:00', pH: 8.89, sauerstoff: 13.5 }, 
  { time: '17:00', pH: 8.87, sauerstoff: 13.4 },
  { time: '18:00', pH: 8.85, sauerstoff: 13.3 }, 
  { time: '19:00', pH: 8.82, sauerstoff: 13.2 },
  { time: '20:00', pH: 8.78, sauerstoff: 13.0 }, 
  { time: '21:00', pH: 8.74, sauerstoff: 12.8 },
  { time: '22:00', pH: 8.70, sauerstoff: 12.6 }, 
  { time: '23:00', pH: 8.68, sauerstoff: 12.5 },
];

export const validationChartData = [
  { time: '06:00', pH: 8.74, type: 'valid' }, 
  { time: '07:00', pH: 8.77, type: 'valid' },
  { time: '08:00', pH: 8.80, type: 'valid' }, 
  { time: '09:00', pH: 8.83, type: 'valid' },
  { time: '10:00', pH: 9.50, type: 'outlier' }, // Künstlicher Ausreißer
  { time: '11:00', pH: 8.87, type: 'valid' }, 
  { time: '12:00', pH: 8.88, type: 'valid' },
  { time: '13:00', pH: 8.89, type: 'valid' }, 
  { time: '14:00', pH: 8.90, type: 'valid' },
];

export const qualityFlagData = [
  { name: 'Gut (1 Pass)', value: 93, color: '#10b981' },
  { name: 'Verdächtig (3 Suspect)', value: 4, color: '#f59e0b' },
  { name: 'Fehlerhaft (4 Fail)', value: 1, color: '#ef4444' },
];

export const radarChartData = [
  { subject: 'Geringe Kosten', A: 9, B: 2, fullMark: 10 },
  { subject: 'Hohe Flexibilität', A: 10, B: 4, fullMark: 10 },
  { subject: 'Wissensaufbau', A: 10, B: 3, fullMark: 10 },
  { subject: 'Schnelle Inbetriebnahme', A: 7, B: 3, fullMark: 10 }, 
  { subject: 'Geringe Wartung', A: 6, B: 8, fullMark: 10 },
];

export const rawCsvData = `Datum;Uhrzeit;Wassertemperatur (°C);ph-Wert;Sauerstoff (mg/L)
28.04.2025;00:00:00;8.8;8.61;12.2
28.04.2025;01:00:00;8.6;8.62;12.3
28.04.2025;02:00:00;8.4;8.63;12.4
28.04.2025;03:00:00;8.3;8.65;12.5
28.04.2025;04:00:00;8.2;8.68;12.6
28.04.2025;05:00:00;8.4;8.71;12.7
28.04.2025;06:00:00;8.7;8.74;12.8
28.04.2025;07:00:00;9.1;8.77;12.9
28.04.2025;08:00:00;9.8;8.80;13.0
28.04.2025;09:00:00;10.5;8.83;13.1
28.04.2025;10:00:00;11.1;8.85;13.2
28.04.2025;11:00:00;11.6;8.87;13.3
28.04.2025;12:00:00;11.9;8.88;13.4
28.04.2025;13:00:00;12.1;8.89;13.5
28.04.2025;14:00:00;12.0;8.90;13.6
28.04.2025;15:00:00;11.8;8.90;13.6
28.04.2025;16:00:00;11.5;8.89;13.5
28.04.2025;17:00:00;11.0;8.87;13.4
28.04.2025;18:00:00;10.5;8.85;13.3
28.04.2025;19:00:00;10.1;8.82;13.2
28.04.2025;20:00:00;9.8;8.78;13.0
28.04.2025;21:00:00;9.5;8.74;12.8
28.04.2025;22:00:00;9.2;8.70;12.6
28.04.2025;23:00:00;9.0;8.68;12.5`;