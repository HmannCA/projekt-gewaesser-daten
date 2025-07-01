# html_dashboard_generator.py
"""
Generiert HTML-Dashboard für WAMO Gewässermonitoring
Erstellt übersichtliche Berichte für Behörden und Öffentlichkeit
"""

import json
import pandas as pd
from datetime import datetime
from typing import Dict, List
import os
import glob
from config_file import (VALIDATION_RULES, SPIKE_THRESHOLDS, 
                        ALERT_THRESHOLDS, PRECISION_RULES,
                        CONSOLIDATION_RULES, STATIONS)


class HTMLDashboardGenerator:
    def __init__(self):
        self.template = """
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WAMO Gewässermonitoring - {station_name}</title>


    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossorigin=""/>
    
    <!-- Leaflet JavaScript -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""></script>
    <link rel="stylesheet" href="dashboard_styles.css">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>WAMO Gewässermonitoring</h1>
            <div class="subtitle">Station: {station_name} ({station_id})</div>
            <div class="timestamp">Bericht erstellt: {timestamp}</div>
            <div class="timestamp">Datenstand: {data_from} bis {data_to}</div>
        </div>
        
        <!-- Status Alert -->
        <div class="status-alert status-{status_class}">
            <h2>⚠️ Gesamtstatus: {status}</h2>
        </div>
        
        <!-- Tab Navigation -->
        <div class="tab-nav">
            <button class="tab-button active" onclick="showTab(event, 'overview')">Übersicht</button>
            <button class="tab-button" onclick="showTab(event, 'errors')">Fehlerhafte Werte</button>
            <button class="tab-button" onclick="showTab(event, 'daily')">Tageswerte</button>
            <button class="tab-button" onclick="showTab(event, 'analysis')">Erweiterte Analyse</button>
            <button class="tab-button" onclick="showTab(event, 'text')">Text-Bericht</button>
            <button class="tab-button" onclick="showTab(event, 'settings')">Einstellungen</button>
        </div>
        
        <!-- Tab 1: Übersicht (Original Dashboard) -->
        <div id="overview" class="tab-content active">
            <!-- Hauptprobleme -->
            {problems_section}
            
            <!-- Sofortmaßnahmen -->
            {actions_section}
            
            <!-- Meldepflichten -->
            {obligations_section}
            
            <!-- Risiko-Indikatoren -->
            <h2 style="color: #0066CC; margin-bottom: 20px;">Risiko-Indikatoren</h2>
            <div class="risk-indicators">
                {risk_indicators}
            </div>

            <!-- Karte -->
            <div class="map-section">
                <h2>📍 Lage der Messstation</h2>
                <div id="map"></div>
                <div class="map-info">
                    <strong>{station_name}</strong><br>
                    Koordinaten: {lat}°N, {lng}°E<br>
                    Gemeinde: {gemeinde}
                </div>
            </div>
            
            <!-- Aktuelle Messwerte -->
            <div class="parameters-section">
                <h2 id="currentDayTitle">Aktuelle Tageswerte</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Mittelwert</th>
                            <th>Min</th>
                            <th>Max</th>
                            <th>Qualität</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parameter_rows}
                    </tbody>
                </table>
            </div>
            
            <!-- Landwirtschaftliche Details -->
            {agricultural_section}
        </div>
        
        <!-- Tab 2: Fehlerhafte Werte -->
        <div id="errors" class="tab-content">
            <h2>Fehlerhafte und Verdächtige Werte</h2>
            
            <div class="filter-controls">
                <select id="errorParamFilter">
                    <option value="">Alle Parameter</option>
                </select>
                <select id="errorFlagFilter">
                    <option value="">Alle Flags</option>
                    <option value="3">Verdächtig</option>
                    <option value="4">Schlecht</option>
                    <option value="9">Fehlend</option>
                </select>
                <input type="date" id="errorDateFilter" placeholder="Datum">
                <button onclick="filterErrorTable()">Filtern</button>
                <button onclick="resetErrorFilter()">Zurücksetzen</button>
            </div>
            
            <div class="error-table">
                <table id="errorTable">
                    <thead>
                        <tr>
                            <th>Nr.</th>
                            <th>Zeitpunkt</th>
                            <th>Parameter</th>
                            <th>Wert</th>
                            <th>Flag</th>
                            <th>Grund</th>
                        </tr>
                    </thead>
                    <tbody id="errorTableBody">
                        <!-- Wird durch JavaScript gefüllt -->
                    </tbody>
                </table>
            </div>
            <p style="margin-top: 20px; color: #666;">
                <span id="errorCount">0</span> fehlerhafte Werte gefunden
            </p>
        </div>
        
        <!-- Tab 3: Tageswerte -->
        <div id="daily" class="tab-content">
            <h2>Konsolidierte Tageswerte</h2>
            
            <div class="filter-controls">
                <select id="dailyParamFilter">
                    <option value="">Alle Parameter</option>
                </select>
                <input type="date" id="dailyStartDate" placeholder="Von">
                <input type="date" id="dailyEndDate" placeholder="Bis">
                <button onclick="filterDailyTable()">Filtern</button>
                <button onclick="resetDailyFilter()">Zurücksetzen</button>
            </div>
            
            <div style="max-height: 600px; overflow-y: auto;">
                <table id="dailyTable">
                    <thead>
                        <tr>
                            <th>Datum</th>
                            <th>Parameter</th>
                            <th>Mittelwert</th>
                            <th>Min</th>
                            <th>Max</th>
                            <th>Std.Abw.</th>
                            <th>Qualität %</th>
                            <th>Flag</th>
                        </tr>
                    </thead>
                    <tbody id="dailyTableBody">
                        <!-- Wird durch JavaScript gefüllt -->
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Tab 4: Erweiterte Analyse -->
        <div id="analysis" class="tab-content">
            <h2>Erweiterte Analyse</h2>
            
            <div id="analysisContent">
                <!-- Wird durch JavaScript gefüllt -->
            </div>
        </div>
        
        <!-- Tab 5: Text-Bericht -->
        <div id="text" class="tab-content">
            <h2>Text-Bericht</h2>
            
            <div class="text-display" id="textReport">
                <!-- Wird durch JavaScript gefüllt -->
            </div>
        </div>
        <!-- Tab 6: Einstellungen -->
        <div id="settings" class="tab-content">
            <h2>Stations-Einstellungen</h2>
            <div id="settingsContent">
                <!-- Wird durch JavaScript gefüllt -->
            </div>
        </div>
        
        <!-- Kontakte -->
        <div class="contact-section">
            <h2>📞 Wichtige Kontakte</h2>
            <div class="contact-item">
                <strong>Untere Wasserbehörde LK VG:</strong> 03834-8760-0 | wasserbehoerde@kreis-vg.de
            </div>
            <div class="contact-item">
                <strong>Gesundheitsamt LK VG:</strong> 03834-8760-2301 | gesundheitsamt@kreis-vg.de
            </div>
            <div class="contact-item">
                <strong>StALU Mecklenburgische Seenplatte:</strong> 0395-380-0 | poststelle@stalums.mv-regierung.de
            </div>
            <div class="contact-item">
                <strong>24h-Bereitschaft Umweltamt:</strong> 0171-1234567 (nur bei akuten Gefährdungen)
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>Landkreis Vorpommern-Greifswald - Stabsstelle Digitalisierung und IT</p>
            <p>WAMO Gewässermonitoring v1.0.0 | Daten unter CC BY-NC 4.0</p>
        </div>

        <!-- Info Modal -->
        <div id="infoModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modalTitle">Information</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body" id="modalBody">
                    <!-- Inhalt wird dynamisch eingefügt -->
                </div>
            </div>
    </div>
    
    <!-- JavaScript -->
<!-- JavaScript -->
    <script>
        // Daten für JavaScript
        const errorData = {error_data_json};
        const dailyData = {daily_data_json};
        const analysisData = {analysis_data_json};
        const textReport = {text_report_json};
        
        // Debug-Info
        console.log('Error Data:', errorData);
        console.log('Daily Data:', dailyData);
        console.log('Analysis Data:', analysisData);
        console.log('Text Report length:', textReport.length);
        
        // Tab-Funktionalität
        function showTab(event, tabName) {{
            // Alle Tabs und Buttons deaktivieren
            const tabs = document.querySelectorAll('.tab-content');
            const buttons = document.querySelectorAll('.tab-button');
            
            tabs.forEach(tab => tab.classList.remove('active'));
            buttons.forEach(button => button.classList.remove('active'));
            
            // Aktiven Tab und Button setzen
            document.getElementById(tabName).classList.add('active');
            if (event && event.target) {{
                event.target.classList.add('active');
            }} else {{
                // Fallback: Button nach Text suchen
                buttons.forEach(button => {{
                    if (button.onclick && button.onclick.toString().includes(tabName)) {{
                        button.classList.add('active');
                    }}
                }});
            }}
            
            // Daten laden wenn nötig
                if (tabName === 'errors') {{
                    loadErrorTable();
                }} else if (tabName === 'daily') {{
                    loadDailyTable();
                }} else if (tabName === 'analysis') {{
                    loadAnalysis();
                }} else if (tabName === 'text') {{
                    loadTextReport();
                }}
        }}
        
        // Fehlerhafte Werte laden
        function loadErrorTable() {{
            console.log('Loading error table...');
            const tbody = document.getElementById('errorTableBody');
            const paramFilter = document.getElementById('errorParamFilter');

            tbody.innerHTML = '';
            
            // Prüfe ob Daten vorhanden
            if (!errorData || !errorData.fehlerhafte_werte || errorData.fehlerhafte_werte.length === 0) {{
                tbody.innerHTML = '<tr><td colspan="6">Keine fehlerhaften Werte gefunden</td></tr>';
                document.getElementById('errorCount').textContent = '0';
                return;
            }}
            
            // Parameter für Filter sammeln
            const params = [...new Set(errorData.fehlerhafte_werte.map(e => e.parameter))];
            params.forEach(param => {{
                const option = document.createElement('option');
                option.value = param;
                option.textContent = param;
                paramFilter.appendChild(option);
            }});
            
            // Tabelle füllen
            errorData.fehlerhafte_werte.forEach((error, index) => {{
                const row = tbody.insertRow();
                const wertAnzeige = error.wert !== null && error.wert !== undefined 
                    ? (typeof error.wert === 'number' ? error.wert.toFixed(2) : error.wert)
                    : 'N/A';
                
                // Formatiere das Datum deutsch (nur Datum, keine Zeit)
                const dateTime = new Date(error.zeitpunkt);
                const formattedDate = formatDateGerman(error.zeitpunkt);
                const time = dateTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                
                row.innerHTML = `
                    <td>${index + 1}}</td>
                    <td>${formattedDate} ${time}</td>
                    <td>${error.parameter}</td>
                    <td>${wertAnzeige}</td>
                    <td class="value-${error.flag === 3 ? 'warning' : 'bad'}}">${error.flag_name}</td>
                    <td>${error.grund}</td>
                `;
            }});
            
            document.getElementById('errorCount').textContent = errorData.fehlerhafte_werte.length;
            console.log('Error table loaded with', errorData.fehlerhafte_werte.length, 'entries');
        }}
        
        // Filter für Fehler-Tabelle
        function filterErrorTable() {{
            const paramFilter = document.getElementById('errorParamFilter').value;
            const flagFilter = document.getElementById('errorFlagFilter').value;
            const dateFilter = document.getElementById('errorDateFilter').value;
            
            const rows = document.querySelectorAll('#errorTableBody tr');
            let visibleCount = 0;
            
            rows.forEach((row, index) => {{
                // Skip header row if exists
                if (row.cells.length < 6) return;
                
                const param = row.cells[2].textContent;
                const zeit = row.cells[1].textContent;
                const errorIndex = parseInt(row.cells[0].textContent) - 1;
                const flag = errorData.fehlerhafte_werte[errorIndex]?.flag?.toString() || '';
                
                let show = true;
                
                if (paramFilter && param !== paramFilter) show = false;
                if (flagFilter && flag !== flagFilter) show = false;
                if (dateFilter && !zeit.startsWith(dateFilter)) show = false;
                
                row.style.display = show ? '' : 'none';
                if (show) visibleCount++;
            }});
            
            document.getElementById('errorCount').textContent = visibleCount;
        }}
        
        function resetErrorFilter() {{
            document.getElementById('errorParamFilter').value = '';
            document.getElementById('errorFlagFilter').value = '';
            document.getElementById('errorDateFilter').value = '';
            filterErrorTable();
        }}
        
        // Tageswerte laden
        function loadDailyTable() {{
            console.log('Loading daily table...');
            const tbody = document.getElementById('dailyTableBody');
            const paramFilter = document.getElementById('dailyParamFilter');

            tbody.innerHTML = '';
            
            // Prüfe ob Daten vorhanden
            if (!dailyData || Object.keys(dailyData).length === 0) {{
                tbody.innerHTML = '<tr><td colspan="8">Keine Tageswerte vorhanden</td></tr>';
                return;
            }}
            
            // Parameter sammeln
            const params = new Set();
            
            Object.entries(dailyData).forEach(([date, values]) => {{
                Object.keys(values).forEach(key => {{
                    const param = key.split('_')[0];
                    if (!key.includes('Flag') && !key.includes('Prozent') && !key.includes('Gruende')) {{
                        params.add(param);
                    }}
                }});
            }});
            
            params.forEach(param => {{
                const option = document.createElement('option');
                option.value = param;
                option.textContent = param;
                paramFilter.appendChild(option);
            }});
            
            // Tabelle füllen
            Object.entries(dailyData).forEach(([date, values]) => {{
                // Gruppiere nach Parameter
                const paramGroups = {{}};
                
                Object.entries(values).forEach(([key, value]) => {{
                    const parts = key.split('_');
                    const param = parts[0];
                    const metric = parts.slice(1).join('_');
                    
                    if (!paramGroups[param]) paramGroups[param] = {{}};
                    paramGroups[param][metric] = value;
                }});
                
                // Zeile für jeden Parameter
                Object.entries(paramGroups).forEach(([param, metrics]) => {{
                    if (metrics.Mittelwert !== undefined) {{
                        const row = tbody.insertRow();
                        const flag = metrics.Aggregat_QARTOD_Flag || 1;
                        const flagClass = flag === 1 ? 'good' : flag === 3 ? 'warning' : 'bad';
                        
                        row.innerHTML = `
                            <td>${date}}</td>
                            <td>${param}}</td>
                            <td>${formatValue(metrics.Mittelwert)}}</td>
                            <td>${formatValue(metrics.Min)}}</td>
                            <td>${formatValue(metrics.Max)}}</td>
                            <td>${formatValue(metrics.StdAbw)}}</td>
                            <td>${formatValue(metrics.Anteil_Guter_Werte_Prozent, 1)}}</td>
                            <td class="value-${flagClass}}">${flag}}</td>
                        `;
                    }}
                }});
            }});
            
            console.log('Daily table loaded');
        }}
        
        // Hilfsfunktion zum Formatieren von Werten
        function formatValue(value, decimals = 2) {{
            if (value === undefined || value === null) return '-';
            if (typeof value === 'number') {{
                return value.toFixed(decimals);
            }}
            return value;
        }}
        
        // Filter für Tageswerte
        function filterDailyTable() {
            const paramFilter = document.getElementById('dailyParamFilter').value;
            const startDate = document.getElementById('dailyStartDate').value;
            const endDate = document.getElementById('dailyEndDate').value;
            
            const rows = document.querySelectorAll('#dailyTableBody tr');
            
            rows.forEach(row => {
                const param = row.cells[1].textContent;
                const dateText = row.cells[0].textContent;
                
                let show = true;
                
                if (paramFilter && param !== paramFilter) show = false;
                
                // Extrahiere nur das Datum (ohne Zeit) für den Vergleich
                if (startDate || endDate) {
                    // Nimm nur die ersten 10 Zeichen (YYYY-MM-DD) wenn es ein ISO-Datum ist
                    const dateOnly = dateText.substring(0, 10);
                    
                    if (startDate && dateOnly < startDate) show = false;
                    if (endDate && dateOnly > endDate) show = false;
                }
                
                row.style.display = show ? '' : 'none';
            });
        }
        
        function resetDailyFilter() {{
            document.getElementById('dailyParamFilter').value = '';
            document.getElementById('dailyStartDate').value = '';
            document.getElementById('dailyEndDate').value = '';
            filterDailyTable();
        }}
        

        // Erweiterte Analyse laden
        // Hilfsfunktion für deutsches Datumsformat
        function formatDateGerman(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        }

        function translateEventType(type) {
            const translations = {
                'fertilizer_runoff': 'Düngemitteleintrag',
                'erosion_runoff': 'Erosionseintrag',
                'manure_runoff': 'Gülle-/Misteintrag',
                'pesticide_runoff': 'Pestizideintrag'
            };
            return translations[type] || type;
        }

        function translateSeverity(severity) {
            const translations = {
                'low': 'gering',
                'medium': 'mittel',
                'high': 'hoch'
            };
            return translations[severity] || severity;
        }

        // Erweiterte Analyse laden
        function loadAnalysis() {{
            console.log('Loading analysis...');
            const content = document.getElementById('analysisContent');
            
            if (!analysisData) {{
                content.innerHTML = '<p>Keine erweiterten Analysedaten vorhanden</p>';
                return;
            }}
            
            let html = '';
            
            // Zeitraum
            if (analysisData.zeitraum) {{
                html += `<div class="analysis-section">`;
                html += `<h3>Analysezeitraum</h3>`;
                html += `<p><strong>Von:</strong> ${formatDateGerman(analysisData.zeitraum.von)}<br>`;
                html += `<strong>Bis:</strong> ${formatDateGerman(analysisData.zeitraum.bis)}</p>`;
                html += `</div>`;
            }}
            
            // Korrelationsqualität - PROMINENT
            if (analysisData.erweiterte_analysen?.korrelations_qualitaet) {
                const kq = analysisData.erweiterte_analysen.korrelations_qualitaet;
                const qualityValue = kq.gesamtqualitaet || 0;
                const qualityClass = qualityValue >= 80 ? 'good' : qualityValue >= 50 ? 'warning' : 'critical';
                
                html += `<div class="analysis-section">`;
                html += `<h3>Korrelationsqualität <span class="info-icon" onclick="showInfo('correlation-quality')">i</span></h3>`;
                
                // Prominente Darstellung der Gesamtqualität
                html += `<div class="prominent-metric ${qualityClass}">`;
                html += `<div class="metric-label">Gesamtqualität</div>`;
                html += `<div class="metric-value">${formatValue(qualityValue, 1)}%</div>`;
                html += `<div class="metric-interpretation">`;
                if (qualityValue >= 80) {
                    html += `Sensoren arbeiten einwandfrei`;
                } else if (qualityValue >= 50) {
                    html += `Kalibrierung empfohlen`;
                } else {
                    html += `Wartung erforderlich!`;
                }
                html += `</div>`;
                html += `</div>`;
                
                if (kq.auffaellige_korrelationen && kq.auffaellige_korrelationen.length > 0) {
                    html += `<h4>Auffällige Korrelationen:</h4>`;
                    html += `<table><thead><tr><th>Parameter</th><th>Korrelation</th><th>Qualität</th></tr></thead><tbody>`;
                    kq.auffaellige_korrelationen.forEach(k => {
                        html += `<tr><td>${k.parameter}</td><td>${k.korrelation}</td><td>${k.qualitaet}%</td></tr>`;
                    });
                    html += `</tbody></table>`;
                }
                html += `</div>`;
            }
            
            // Landwirtschaftliche Einträge - PROMINENT
            if (analysisData.erweiterte_analysen?.landwirtschaftliche_eintraege) {
                const le = analysisData.erweiterte_analysen.landwirtschaftliche_eintraege;
                const riskValue = le.risiko_index || 0;
                const riskClass = riskValue < 40 ? 'good' : riskValue < 70 ? 'warning' : 'critical';
                
                html += `<div class="analysis-section">`;
                html += `<h3>Landwirtschaftliche Einträge <span class="info-icon" onclick="showInfo('agricultural-runoff')">i</span></h3>`;
                
                // Prominente Darstellung des Risiko-Index
                html += `<div class="prominent-metric ${riskClass}">`;
                html += `<div class="metric-label">Risiko-Index</div>`;
                html += `<div class="metric-value">${formatValue(riskValue, 1)}<span class="metric-unit">/100</span></div>`;
                html += `<div class="metric-interpretation">`;
                if (riskValue >= 70) {
                    html += `Sehr hoher landwirtschaftlicher Einfluss!`;
                } else if (riskValue >= 40) {
                    html += `Erhöhter landwirtschaftlicher Einfluss`;
                } else {
                    html += `Geringer landwirtschaftlicher Einfluss`;
                }
                html += `</div>`;
                html += `</div>`;
                
                if (le.erkannte_ereignisse && le.erkannte_ereignisse.length > 0) {
                    html += `<h4>Erkannte Ereignisse:</h4>`;
                    html += `<table><thead><tr><th>Typ</th><th>Zeitpunkt</th><th>Dauer</th><th>Schweregrad</th></tr></thead><tbody>`;
                    le.erkannte_ereignisse.forEach(e => {
                        const eventDate = formatDateGerman(e.start_time);
                        const severityClass = e.severity === 'high' ? 'critical' : e.severity === 'medium' ? 'warning' : 'good';
                        const translatedType = translateEventType(e.type);
                        const translatedSeverity = translateSeverity(e.severity);
                        
                        html += `<tr>`;
                        html += `<td>${translatedType}</td>`;
                        html += `<td>${eventDate}</td>`;
                        html += `<td>${e.duration_hours}h</td>`;
                        html += `<td class="severity-${severityClass}">${translatedSeverity}</td>`;
                        html += `</tr>`;
                    });
                    html += `</tbody></table>`;
                }
                
                // Risiko-Indikatoren
                if (le.risiko_indikatoren) {
                    html += `<h4 style="margin-top: 20px; margin-bottom: 10px;">Risiko-Indikatoren:</h4>`;
                    html += `<div style="margin-left: 20px;">`;
                    html += `<ul style="list-style-type: disc; margin-left: 20px;">`;
                    Object.entries(le.risiko_indikatoren).forEach(([key, value]) => {
                        let displayName = key;
                        switch(key) {
                            case 'nutrient_load_index': displayName = 'Nährstoffbelastung'; break;
                            case 'runoff_frequency_index': displayName = 'Eintrags-Häufigkeit'; break;
                            case 'water_stress_index': displayName = 'Gewässerbelastung'; break;
                            case 'overall_agricultural_risk': displayName = 'Gesamtrisiko'; break;
                            default: displayName = key.replace(/_/g, ' ');
                        }
                        html += `<li><strong>${displayName}:</strong> ${formatValue(value, 1)}</li>`;
                    });
                    html += `</ul>`;
                    html += `</div>`;
                }
                html += `</div>`;
            }
            
            // Regionale Bewertung
            if (analysisData.erweiterte_analysen?.regionale_bewertung) {
                const rb = analysisData.erweiterte_analysen.regionale_bewertung;
                html += `<div class="analysis-section">`;
                html += `<h3>Regionale Bewertung</h3>`;
                
                if (rb.saison_faktoren) {
                    html += `<h4>Saisonale Faktoren: <span class="info-icon" onclick="showInfo('seasonal-factors')">i</span></h4>`;
                    html += `<div style="margin-left: 20px;">`;
                    html += `<ul style="list-style-type: disc; margin-left: 20px;">`;
                    html += `<li><strong>Aktivität:</strong> ${rb.saison_faktoren.aktivität}</li>`;
                    html += `<li><strong>Dünger-Risiko:</strong> ${(rb.saison_faktoren.dünger_risiko * 100).toFixed(0)}%</li>`;
                    html += `<li><strong>Gülle-Risiko:</strong> ${(rb.saison_faktoren.gülle_risiko * 100).toFixed(0)}%</li>`;
                    html += `<li><strong>Erosions-Risiko:</strong> ${(rb.saison_faktoren.erosions_risiko * 100).toFixed(0)}%</li>`;
                    html += `</ul>`;
                    html += `</div>`;
                }
                
                // Empfehlungen - BESONDERS PROMINENT bei SOFORTMASSNAHMEN
                if (rb.empfehlungen && rb.empfehlungen.length > 0) {
                    const hasSofortmassnahmen = rb.empfehlungen.some(e => e.includes('SOFORTMASSNAHMEN'));
                    
                    if (hasSofortmassnahmen) {
                        html += `<div class="urgent-recommendations">`;
                        html += `<h4><span class="urgent-icon">⚠️</span> SOFORTMASSNAHMEN ERFORDERLICH</h4>`;
                        html += `<div class="urgent-content">`;
                        
                        // Teile Empfehlungen in Sofortmaßnahmen und normale
                        const sofortmassnahmen = [];
                        const normaleEmpfehlungen = [];
                        
                        let collectingSofort = false;
                        rb.empfehlungen.forEach(empfehlung => {
                            if (empfehlung.includes('SOFORTMASSNAHMEN')) {
                                collectingSofort = true;
                            } else if (collectingSofort && empfehlung.match(/^\d+\./)) {
                                sofortmassnahmen.push(empfehlung);
                            } else {
                                collectingSofort = false;
                                normaleEmpfehlungen.push(empfehlung);
                            }
                        });
                        
                        if (sofortmassnahmen.length > 0) {
                            html += `<ol class="urgent-list">`;
                            sofortmassnahmen.forEach(item => {
                                html += `<li>${item.replace(/^\d+\./, '').trim()}</li>`;
                            });
                            html += `</ol>`;
                        }
                        html += `</div>`;
                        html += `</div>`;
                        
                        // Normale Empfehlungen
                        if (normaleEmpfehlungen.length > 0) {
                            html += `<h4 style="margin-top: 20px;">Weitere Empfehlungen:</h4>`;
                            html += `<div style="margin-left: 20px;">`;
                            html += `<ul style="list-style-type: disc; margin-left: 20px;">`;
                            normaleEmpfehlungen.forEach(empfehlung => {
                                html += `<li>${empfehlung}</li>`;
                            });
                            html += `</ul>`;
                            html += `</div>`;
                        }
                    } else {
                        // Normale Darstellung ohne Sofortmaßnahmen
                        html += `<h4>Empfehlungen:</h4>`;
                        html += `<div style="margin-left: 20px;">`;
                        html += `<ul style="list-style-type: disc; margin-left: 20px;">`;
                        rb.empfehlungen.forEach(empfehlung => {
                            html += `<li>${empfehlung}</li>`;
                        });
                        html += `</ul>`;
                        html += `</div>`;
                    }
                }
                html += `</div>`;
            }
            
            content.innerHTML = html || '<p>Keine Analysedaten zum Anzeigen</p>';
            console.log('Analysis loaded');
        }}
        
        // Text-Bericht laden
        function loadTextReport() {{
            console.log('Loading text report...');
            const reportDiv = document.getElementById('textReport');
            if (textReport && textReport.length > 0) {{
                reportDiv.textContent = textReport;
                console.log('Text report loaded with', textReport.length, 'characters');
            }} else {{
                reportDiv.textContent = 'Kein Text-Bericht verfügbar';
            }}
        }}
        
        // Initial laden wenn Seite geladen
        window.addEventListener('DOMContentLoaded', () => {{
            console.log('DOM loaded, ready for tab switching');
        }});

        document.addEventListener('DOMContentLoaded', function() {
        // Warte kurz, dann lade den aktiven Tab
        setTimeout(function() {
                var activeTab = document.querySelector('.tab-content.active');
                if (activeTab && activeTab.id === 'errors') {
                    loadErrorTable();
                }
            }, 100);
        });

            // Modal-Funktionalität
        const modal = document.getElementById('infoModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const closeBtn = document.getElementsByClassName('close')[0];
        
        // Modal schließen
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }
        
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
        
        // Info-Inhalte definieren
        const infoContent = {
            'correlation-quality': {
                title: 'Korrelationsqualität',
                content: `
                    <p>Die <strong>Korrelationsqualität</strong> prüft, ob die gemessenen Parameter in physikalisch sinnvollen Beziehungen zueinander stehen.</p>
                    
                    <div class="metric-explanation">
                        <h3>Was wird geprüft?</h3>
                        <ul>
                            <li><strong>pH-Sauerstoff-Beziehung:</strong> Tagsüber sollten beide durch Photosynthese steigen</li>
                            <li><strong>Temperatur-Sauerstoff:</strong> Wärmeres Wasser kann weniger Sauerstoff lösen</li>
                            <li><strong>Chlorophyll-pH:</strong> Hohe Algenaktivität erhöht den pH-Wert</li>
                            <li><strong>Temperaturschichtung:</strong> Tieferes Wasser sollte kühler sein</li>
                        </ul>
                    </div>
                    
                    <div class="metric-explanation">
                        <h3>Bewertung Ihrer Messung: 75.7%</h3>
                        <div class="value-interpretation interpretation-warning">
                            <strong>Befriedigende Qualität:</strong> Die meisten Sensoren arbeiten plausibel, aber es gibt Auffälligkeiten. 
                            Möglicherweise müssen einzelne Sensoren kalibriert werden.
                        </div>
                    </div>
                `
            },
            'agricultural-runoff': {
                title: 'Landwirtschaftliche Einträge',
                content: `
                    <p>Das System erkennt <strong>landwirtschaftliche Einträge</strong> durch charakteristische Muster in den Messwerten.</p>
                    
                    <div class="metric-explanation">
                        <h3>Risiko-Index: 85.2/100</h3>
                        <div class="value-interpretation interpretation-danger">
                            <strong>Hoher landwirtschaftlicher Einfluss!</strong> Es wurden deutliche Anzeichen für Nährstoffeinträge aus der Landwirtschaft erkannt.
                        </div>
                    </div>
                    
                    <h3>Die einzelnen Indikatoren:</h3>
                    
                    <div class="metric-explanation">
                        <strong>Nährstoffbelastung (55.5):</strong><br>
                        Misst die Nitrat-Konzentration und deren Spitzen. Werte über 50 zeigen erhöhte Düngermitteleinträge an.
                    </div>
                    
                    <div class="metric-explanation">
                        <strong>Eintrags-Häufigkeit (100.0):</strong><br>
                        Zählt plötzliche Anstiege verschiedener Parameter. Der Maximalwert deutet auf sehr häufige Einträge hin - 
                        typisch für intensive Landwirtschaft im Einzugsgebiet.
                    </div>
                    
                    <div class="metric-explanation">
                        <strong>Gewässerbelastung (100.0):</strong><br>
                        Bewertet Sauerstoffmangel, pH-Extreme und Algenblüten. Der Maximalwert zeigt, dass der See bereits 
                        stark unter den Einträgen leidet.
                    </div>
                    
                    <h3>Was bedeutet das?</h3>
                    <p>Der See erhält regelmäßig Nährstoffe aus der Landwirtschaft, was zu Überdüngung (Eutrophierung) führt. 
                    Dies kann Algenblüten, Sauerstoffmangel und Fischsterben verursachen.</p>
                `
            },
            'seasonal-factors': {
                title: 'Saisonale Faktoren',
                content: `
                    <p>Die <strong>saisonalen Faktoren</strong> berücksichtigen den landwirtschaftlichen Kalender in Mecklenburg-Vorpommern.</p>
                    
                    <div class="metric-explanation">
                        <h3>Aktuelle Phase: Düngung</h3>
                        <p>Ende Mai ist Hauptdüngungszeit für Mais und Sommergetreide. Dies erklärt die erhöhten Nährstoffwerte.</p>
                    </div>
                    
                    <h3>Risikobewertung:</h3>
                    
                    <div class="metric-explanation">
                        <strong>Dünger-Risiko (80%):</strong><br>
                        Sehr hoch während der aktiven Düngephase. Mineralische Dünger können bei Regen schnell ausgewaschen werden.
                    </div>
                    
                    <div class="metric-explanation">
                        <strong>Gülle-Risiko (20%):</strong><br>
                        Moderat - Gülle wird hauptsächlich im Frühjahr (Februar-April) ausgebracht.
                    </div>
                    
                    <div class="metric-explanation">
                        <strong>Erosions-Risiko (30%):</strong><br>
                        Mittel - die Pflanzen bedecken den Boden noch nicht vollständig, Starkregen kann Boden abschwemmen.
                    </div>
                    
                    <p><strong>Empfehlung:</strong> Verstärkte Überwachung nach Regenereignissen, Dialog mit Landwirten über 
                    gewässerschonende Bewirtschaftung.</p>
                `
            },
            'risk-agricultural': {
                title: 'Landwirtschaftlicher Einfluss',
                content: `
                    <div class="metric-explanation">
                        <h3>Risiko-Index: 85/100</h3>
                        <div class="value-interpretation interpretation-danger">
                            <strong>Sehr hoher landwirtschaftlicher Einfluss</strong>
                        </div>
                    </div>
                    
                    <p>Dieser Index fasst alle Indikatoren für landwirtschaftliche Belastung zusammen:</p>
                    <ul>
                        <li>Nährstoffkonzentrationen (Nitrat, Phosphat)</li>
                        <li>Häufigkeit von Eintrags-Ereignissen</li>
                        <li>Biologische Stressanzeichen (Algen, Sauerstoffmangel)</li>
                        <li>Zeitliche Muster (nach Regen, während Düngephasen)</li>
                    </ul>
                    
                    <h3>Handlungsbedarf:</h3>
                    <ul>
                        <li>Kontakt mit Landwirtschaftsbehörde aufnehmen</li>
                        <li>Gewässerrandstreifen prüfen</li>
                        <li>Beratung für Landwirte anbieten</li>
                        <li>Ggf. Badeverbot während Algenblüten</li>
                    </ul>
                `
            },
            'risk-plausibility': {
                title: 'Sensorplausibilität',
                content: `
                    <div class="metric-explanation">
                        <h3>Qualität: 76%</h3>
                        <div class="value-interpretation interpretation-warning">
                            <strong>Befriedigende Sensorqualität</strong>
                        </div>
                    </div>
                    
                    <p>Dieser Wert zeigt, wie gut die Messwerte zueinander passen:</p>
                    <ul>
                        <li><strong>>90%:</strong> Alle Sensoren arbeiten einwandfrei</li>
                        <li><strong>70-90%:</strong> Kleinere Unstimmigkeiten, Kalibrierung prüfen</li>
                        <li><strong>50-70%:</strong> Deutliche Probleme, Wartung erforderlich</li>
                        <li><strong><50%:</strong> Sensorfehler, sofortige Wartung nötig</li>
                    </ul>
                    
                    <h3>Mögliche Ursachen für reduzierte Qualität:</h3>
                    <ul>
                        <li>Sensordrift durch Alterung</li>
                        <li>Bewuchs oder Verschmutzung</li>
                        <li>Kalibrierung überfällig</li>
                        <li>Defekte Einzelsensoren</li>
                    </ul>
                `
            },
            'risk-nutrients': {
                title: 'Nährstoffbelastung',
                content: `
                    <div class="metric-explanation">
                        <h3>Index: 56/100</h3>
                        <div class="value-interpretation interpretation-warning">
                            <strong>Erhöhte Nährstoffbelastung</strong>
                        </div>
                    </div>
                    
                    <p>Bewertet die Konzentration von Pflanzennährstoffen im Wasser:</p>
                    <ul>
                        <li><strong>Nitrat:</strong> Hauptindikator für Düngereintrag</li>
                        <li><strong>Phosphat:</strong> Limitierender Faktor für Algenwachstum</li>
                        <li><strong>Häufigkeit von Spitzenwerten:</strong> Zeigt akute Einträge</li>
                    </ul>
                    
                    <h3>Bewertungsskala:</h3>
                    <ul>
                        <li><strong>0-20:</strong> Nährstoffarm (oligotroph) - sehr gut</li>
                        <li><strong>20-40:</strong> Mäßig nährstoffreich (mesotroph) - gut</li>
                        <li><strong>40-60:</strong> Nährstoffreich (eutroph) - bedenklich</li>
                        <li><strong>60-100:</strong> Übermäßig nährstoffreich (hypertroph) - kritisch</li>
                    </ul>
                    
                    <p><strong>Ihr See:</strong> Befindet sich im eutrophen Bereich mit Tendenz zur Überdüngung.</p>
                `
            }
        };
        
        // Funktion zum Öffnen des Modals
        function showInfo(infoType) {
            const info = infoContent[infoType];
            if (info) {
                modalTitle.textContent = info.title;
                modalBody.innerHTML = info.content;
                modal.style.display = 'block';
            }
        }

                // Karten-Initialisierung
        function initMap() {
            // Koordinaten aus den Daten
            const lat = {lat};
            const lng = {lng};
            const stationName = '{station_name}';
            
            // Initialisiere die Karte
            const map = L.map('map').setView([lat, lng], 13);
            
            // OpenStreetMap Layer (kostenlos!)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18
            }).addTo(map);
            
            // Marker für die Station
            const marker = L.marker([lat, lng]).addTo(map);
            marker.bindPopup(`<strong>${stationName}</strong><br>Messstation`).openPopup();
            
            // Zusätzlich: Kreis um die Station (zeigt ungefähren Einflussbereich)
            L.circle([lat, lng], {
                color: '#0066CC',
                fillColor: '#0066CC',
                fillOpacity: 0.1,
                radius: 1000 // 1km Radius
            }).addTo(map);
            
            // Verzögerte Größenanpassung (wichtig für korrekte Darstellung)
            setTimeout(function() {
                map.invalidateSize();
            }, 100);
        }
        
        // Karte initialisieren wenn Tab geladen wird
        let mapInitialized = false;
        const originalShowTab = showTab;
        showTab = function(event, tabName) {
            originalShowTab(event, tabName);
            
            // Initialisiere Karte beim ersten Mal
            if (tabName === 'overview' && !mapInitialized) {
                setTimeout(initMap, 100);
                mapInitialized = true;
            }
        }
        
        // Initialisiere Karte direkt wenn overview aktiv ist
        window.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('overview').classList.contains('active')) {
                setTimeout(initMap, 100);
                mapInitialized = true;
            }
        });

        window.addEventListener('DOMContentLoaded', () => {
            if (dailyData && Object.keys(dailyData).length > 0) {
                const lastDate = Object.keys(dailyData).sort().pop();
                const formattedDate = formatDateGerman(lastDate);
                const titleElement = document.getElementById('currentDayTitle');
                if (titleElement) {
                    titleElement.innerHTML = `Aktuelle Tageswerte <small style="font-weight: normal; color: #666;">(${formattedDate})</small>`;
                }
            }
        });

        function loadSettings() {
            console.log('Loading settings...');
            const content = document.getElementById('settingsContent');
            
            let html = '';
            
            // Basis-Informationen
            html += '<div class="settings-section">';
            html += '<h3>Stations-Informationen</h3>';
            html += '<table class="settings-table">';
            html += `<tr><td>Stationsname:</td><td class="settings-value">{station_name}</td></tr>`;
            html += `<tr><td>Stations-ID:</td><td class="settings-value">{station_id}</td></tr>`;
            html += `<tr><td>Gemeinde:</td><td class="settings-value">{gemeinde}</td></tr>`;
            html += `<tr><td>Koordinaten:</td><td class="settings-value">{lat}°N, {lng}°E</td></tr>`;
            html += '</table>';
            html += '</div>';
            
            // Grenzwerte aus den Analysedaten extrahieren
            html += '<div class="settings-section">';
            html += '<h3>Aktuelle Grenzwerte</h3>';
            html += '<table class="settings-table">';
            
            // Diese Werte kommen aus Ihrer config_file.py
            const grenzwerte = {settings_grenzwerte_json};
            
            if (grenzwerte && Object.keys(grenzwerte).length > 0) {
                Object.entries(grenzwerte).forEach(([param, values]) => {
                    html += `<tr>`;
                    html += `<td>${param}:</td>`;
                    html += `<td class="settings-value">`;
                    html += `${values.min} - ${values.max} <span class="settings-unit">${values.unit || ''}</span>`;
                    html += `</td>`;
                    html += `</tr>`;
                });
            } else {
                html += '<tr><td colspan="2">Keine spezifischen Grenzwerte definiert</td></tr>';
            }
            
            html += '</table>';
            html += '</div>';
            
            // Zusätzliche Informationen
            if ({station_metadata_json}) {
                const metadata = {station_metadata_json};
                
                if (metadata.einzugsgebiet) {
                    html += '<div class="settings-section">';
                    html += '<h3>Einzugsgebiet</h3>';
                    html += '<table class="settings-table">';
                    html += `<tr><td>Agrarflächen:</td><td class="settings-value">${metadata.einzugsgebiet.agrar_anteil}%</td></tr>`;
                    html += `<tr><td>Waldflächen:</td><td class="settings-value">${metadata.einzugsgebiet.wald_anteil}%</td></tr>`;
                    html += `<tr><td>Siedlungsflächen:</td><td class="settings-value">${metadata.einzugsgebiet.siedlung_anteil}%</td></tr>`;
                    html += '</table>';
                    html += '</div>';
                }
                
                if (metadata.max_tiefe) {
                    html += '<div class="settings-section">';
                    html += '<h3>See-Eigenschaften</h3>';
                    html += '<table class="settings-table">';
                    html += `<tr><td>Maximale Tiefe:</td><td class="settings-value">${metadata.max_tiefe} m</td></tr>`;
                    html += `<tr><td>See-Typ:</td><td class="settings-value">${metadata.typ || 'Nicht definiert'}</td></tr>`;
                    html += '</table>';
                    html += '</div>';
                }
            }
            
            html += '<div class="settings-note">';
            html += '<strong>Hinweis:</strong> Diese Einstellungen können nur von autorisierten Administratoren in der Systemkonfiguration geändert werden.';
            html += '</div>';
            
            content.innerHTML = html;
        }

        // Erweitere showTab
        const originalShowTab3 = showTab;
        showTab = function(event, tabName) {
            originalShowTab3(event, tabName);
            
            if (tabName === 'settings') {
                loadSettings();
            }
        }
        
    
    </script>
</body>
</html>
"""

    # HIER IST DIE KRITISCHE ÄNDERUNG - generate_dashboard als Klassenmethode!
    def generate_dashboard(self, analysis_results: Dict, station_metadata: Dict = None, 
                      error_data_path: str = None, text_report_path: str = None) -> str:
        """Generiert HTML-Dashboard aus Analyseergebnissen"""
        
        # ===== 1. BASIS-INFORMATIONEN EXTRAHIEREN =====
        station_id = analysis_results.get('station_id', 'Unbekannt')
        station_name = station_metadata.get('name', station_id) if station_metadata else station_id
        
        # Zeitstempel
        timestamp = datetime.now().strftime('%d.%m.%Y %H:%M Uhr')
        data_from = datetime.fromisoformat(analysis_results['zeitraum']['von']).strftime('%d.%m.%Y')
        data_to = datetime.fromisoformat(analysis_results['zeitraum']['bis']).strftime('%d.%m.%Y')
        
        # Status
        status = analysis_results['zusammenfassung']['status'].upper()
        status_class = status.lower()
        
        # ===== 2. KARTEN-DATEN (WICHTIG!) =====
        lat = station_metadata.get('koordinaten', {}).get('lat', 54.0) if station_metadata else 54.0
        lng = station_metadata.get('koordinaten', {}).get('lng', 13.0) if station_metadata else 13.0
        gemeinde = station_metadata.get('gemeinde', 'Unbekannt') if station_metadata else 'Unbekannt'
        
        # ===== 3. INHALTSSEKTIONEN GENERIEREN =====
        problems = analysis_results['zusammenfassung'].get('hauptprobleme', [])
        problems_html = self._generate_problems_section(problems)
        
        actions = analysis_results['zusammenfassung'].get('sofortmassnahmen', [])
        actions_html = self._generate_actions_section(actions)
        
        obligations = analysis_results['zusammenfassung'].get('meldepflichten', [])
        obligations_html = self._generate_obligations_section(obligations)
        
        risk_html = self._generate_risk_indicators(analysis_results.get('erweiterte_analysen', {}))
        parameter_html = self._generate_parameter_table(analysis_results.get('basis_validierung', {}))
        agri_html = self._generate_agricultural_section(
            analysis_results.get('erweiterte_analysen', {}).get('landwirtschaftliche_eintraege', {})
        )
        
        # ===== 4. ZUSÄTZLICHE DATEN FÜR JAVASCRIPT =====
        error_data = {"fehlerhafte_werte": []}
        if error_data_path and os.path.exists(error_data_path):
            try:
                with open(error_data_path, 'r', encoding='utf-8') as f:
                    error_data = json.load(f)
                print(f"✓ Fehlerhafte Werte geladen: {len(error_data.get('fehlerhafte_werte', []))} Einträge")
            except Exception as e:
                print(f"✗ Fehler beim Laden der Fehlerdaten: {e}")
        
        text_report = ""
        if text_report_path and os.path.exists(text_report_path):
            try:
                with open(text_report_path, 'r', encoding='utf-8') as f:
                    text_report = f.read()
                print(f"✓ Text-Bericht geladen: {len(text_report)} Zeichen")
            except Exception as e:
                print(f"✗ Fehler beim Laden des Text-Berichts: {e}")
        
        # ===== 5. TEMPLATE VERARBEITEN =====
        html = self.template
        
        # WICHTIG: Konvertiere doppelte geschweifte Klammern zu einzelnen
        html = html.replace('{{', '{').replace('}}', '}')
        
        # ===== 6. CUSTOM JSON ENCODER FÜR TIMESTAMP-OBJEKTE =====
        class DateTimeEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, (datetime, pd.Timestamp)):
                    return obj.isoformat()
                elif isinstance(obj, pd.Series):
                    return obj.to_dict()
                elif isinstance(obj, pd.DataFrame):
                    return obj.to_dict(orient='records')
                elif hasattr(obj, '__dict__'):
                    return str(obj)
                return super().default(obj)
           
        # ===== 7. ALLE PLATZHALTER ERSETZEN =====
        all_settings = {
            'validation_rules': {},
            'spike_thresholds': {},
            'alert_thresholds': {}
        }

        # Formatiere für bessere Darstellung
        for param, rules in VALIDATION_RULES.items():
            all_settings['validation_rules'][param] = {
                'min': rules.get('min', '-'),
                'max': rules.get('max', '-'),
                'unit': self._get_unit_for_parameter(param)  # Hilfsmethode
            }

        replacements = {
            '{station_id}': station_id,
            '{station_name}': station_name,
            '{timestamp}': timestamp,
            '{data_from}': data_from,
            '{data_to}': data_to,
            '{status}': status,
            '{status_class}': status_class,
            '{problems_section}': problems_html,
            '{actions_section}': actions_html,
            '{obligations_section}': obligations_html,
            '{risk_indicators}': risk_html,
            '{parameter_rows}': parameter_html,
            '{agricultural_section}': agri_html,
            # KARTEN-KOORDINATEN (KRITISCH!)
            '{lat}': str(lat),
            '{lng}': str(lng),
            '{gemeinde}': gemeinde,
            # JavaScript-Daten mit custom encoder
            '{error_data_json}': json.dumps(error_data, ensure_ascii=False, cls=DateTimeEncoder),
            '{daily_data_json}': json.dumps(analysis_results.get('basis_validierung', {}), ensure_ascii=False, cls=DateTimeEncoder),
            '{analysis_data_json}': json.dumps(analysis_results, ensure_ascii=False, cls=DateTimeEncoder),
            '{text_report_json}': json.dumps(text_report, ensure_ascii=False),
            # Zusätzliche Daten für Einstellungen
            '{settings_grenzwerte_json}': json.dumps(all_settings['validation_rules'], ensure_ascii=False),
            '{station_metadata_json}': json.dumps(station_metadata, ensure_ascii=False, cls=DateTimeEncoder),
            
        }
        
        # Alle Ersetzungen durchführen
        for placeholder, value in replacements.items():
            html = html.replace(placeholder, value)
        
        # ===== 8. KEINE WEITEREN KARTEN-EINFÜGUNGEN! =====
        # Die Karte ist bereits vollständig im Template definiert
        
        return html
    
# Alle weiteren Methoden der HTMLDashboardGenerator Klasse
    
    def _generate_problems_section(self, problems: List[str]) -> str:
        if not problems:
            return ""
        
        html = '<div class="problems-section"><h2>⚠️ Identifizierte Probleme</h2>'
        for problem in problems:
            html += f'<div class="problem-item">{problem}</div>'
        html += '</div>'
        return html
    
    def _generate_actions_section(self, actions: List[str]) -> str:
        if not actions:
            return ""
        
        html = '<div class="actions-section"><h2>🚨 Erforderliche Sofortmaßnahmen</h2>'
        for action in actions:
            html += f'<div class="action-item"><span class="action-icon">▶</span>{action}</div>'
        html += '</div>'
        return html
    
    def _generate_obligations_section(self, obligations: List[str]) -> str:
        if not obligations:
            return ""
        
        html = '<div class="actions-section" style="background: #ffe6e6;"><h2>📋 Meldepflichten</h2>'
        for obligation in obligations:
            html += f'<div class="action-item" style="background: #fff0f0; border-color: #dc3545;">'
            html += f'<span class="action-icon">📞</span>{obligation}</div>'
        html += '</div>'
        return html
    
    def _generate_risk_indicators(self, analyses: Dict) -> str:
        html = ""
    
        # Landwirtschaftlicher Risiko-Index
        if 'landwirtschaftliche_eintraege' in analyses:
            risk = analyses['landwirtschaftliche_eintraege'].get('risiko_index', 0)
            risk_class = 'risk-low' if risk < 40 else 'risk-medium' if risk < 70 else 'risk-high'
            html += f'''
            <div class="risk-card">
                <div class="risk-label">Landwirtschaftlicher Einfluss <span class="info-icon" onclick="showInfo('risk-agricultural')">i</span></div>
                <div class="risk-value {risk_class}">{risk:.0f}</div>
                <div style="font-size: 0.9em; color: #666;">von 100</div>
            </div>
            '''
        
        # Korrelationsqualität
        if 'korrelations_qualitaet' in analyses:
            quality = analyses['korrelations_qualitaet'].get('gesamtqualitaet', 0)
            quality_class = 'risk-high' if quality < 50 else 'risk-medium' if quality < 80 else 'risk-low'
            html += f'''
            <div class="risk-card">
                <div class="risk-label">Sensorplausibilität <span class="info-icon" onclick="showInfo('risk-plausibility')">i</span></div>
                <div class="risk-value {quality_class}">{quality:.0f}%</div>
                <div style="font-size: 0.9em; color: #666;">Korrelationsqualität</div>
            </div>
            '''
        
        # Weitere Risiko-Indikatoren
        if 'landwirtschaftliche_eintraege' in analyses:
            indicators = analyses['landwirtschaftliche_eintraege'].get('risiko_indikatoren', {})
            
            if 'nutrient_load_index' in indicators:
                value = indicators['nutrient_load_index']
                risk_class = 'risk-low' if value < 40 else 'risk-medium' if value < 70 else 'risk-high'
                html += f'''
                <div class="risk-card">
                    <div class="risk-label">Nährstoffbelastung <span class="info-icon" onclick="showInfo('risk-nutrients')">i</span></div>
                    <div class="risk-value {risk_class}">{value:.0f}</div>
                    <div style="font-size: 0.9em; color: #666;">Index</div>
                </div>
                '''
        
        return html
    
    def _generate_parameter_table(self, daily_data: Dict) -> str:
        if not daily_data:
            return '<tr><td colspan="6">Keine Tagesdaten verfügbar</td></tr>'
        
        # Nimm den letzten Tag
        last_date = max(daily_data.keys())
        last_day_data = daily_data[last_date]
        
        # Formatiere das Datum deutsch
        try:
            date_obj = datetime.fromisoformat(last_date.replace('T', ' ').split('.')[0])
            formatted_date = date_obj.strftime('%d.%m.%Y')
        except:
            formatted_date = last_date
        
        # Gruppiere Parameter
        parameters = {}
        for key, value in last_day_data.items():
            parts = key.split('_')
            if len(parts) >= 2:
                param_name = parts[0]
                metric = '_'.join(parts[1:])
                
                if param_name not in parameters:
                    parameters[param_name] = {}
                parameters[param_name][metric] = value
        
        # HTML mit Datum-Info
        html = f'<!-- Daten vom {formatted_date} -->'
        
        for param, metrics in parameters.items():
            if param in ['Supply Current', 'Supply Voltage']:
                continue  # Skip technische Parameter
                
            # Bestimme Status-Klasse basierend auf Flag
            flag = metrics.get('Aggregat_QARTOD_Flag', 1)
            status_class = 'value-good' if flag == 1 else 'value-warning' if flag == 3 else 'value-bad'
            status_text = 'Gut' if flag == 1 else 'Auffällig' if flag == 3 else 'Kritisch'
            
            # Formatiere Werte mit korrekter Präzision
            mittelwert = metrics.get('Mittelwert', '-')
            if mittelwert != '-' and isinstance(mittelwert, (int, float)):
                mittelwert = f"{mittelwert:.2f}"
                
            min_wert = metrics.get('Min', '-')
            if min_wert != '-' and isinstance(min_wert, (int, float)):
                min_wert = f"{min_wert:.2f}"
                
            max_wert = metrics.get('Max', '-')
            if max_wert != '-' and isinstance(max_wert, (int, float)):
                max_wert = f"{max_wert:.2f}"
                
            qualitaet = metrics.get('Anteil_Guter_Werte_Prozent', '-')
            if qualitaet != '-' and isinstance(qualitaet, (int, float)):
                qualitaet = f"{qualitaet:.1f}"
            
            html += f'''
            <tr>
                <td>{param}</td>
                <td>{mittelwert}</td>
                <td>{min_wert}</td>
                <td>{max_wert}</td>
                <td>{qualitaet}%</td>
                <td class="{status_class}">{status_text}</td>
            </tr>
            '''
        
        return html
    
    def _generate_agricultural_section(self, agri_data: Dict) -> str:
        if not agri_data or not agri_data.get('erkannte_ereignisse'):
            return ""
        
        html = '<div class="parameters-section" style="background: #fff8f0;">'
        html += '<h2 style="color: #ff6b00;">🚜 Landwirtschaftliche Einträge</h2>'
        
        for event in agri_data['erkannte_ereignisse']:
            severity_color = '#dc3545' if event['severity'] == 'high' else '#ffc107' if event['severity'] == 'medium' else '#28a745'
            html += f'''
            <div style="padding: 15px; margin: 10px 0; background: white; border-left: 4px solid {severity_color}; border-radius: 5px;">
                <strong>{event['type']}</strong> - {event['start_time']}<br>
                Dauer: {event['duration_hours']} Stunden | Schweregrad: {event['severity']}<br>
                Betroffene Parameter: {', '.join(event['affected_parameters'])}
            </div>
            '''
        
        html += '</div>'
        return html
    
    def _get_unit_for_parameter(self, param: str) -> str:
        """Gibt die Einheit für einen Parameter zurück"""
        units = {
            'Phycocyanin Abs.': 'µg/L',
            'Phycocyanin Abs. (comp)': 'µg/L',
            'TOC': 'mg/L',
            'Trübung': 'NTU',
            'Chl-a': 'µg/L',
            'DOC': 'mg/L',
            'Nitrat': 'mg/L',
            'Gelöster Sauerstoff': 'mg/L',
            'Leitfähigkeit': 'µS/cm',
            'pH': '',  # pH hat keine Einheit
            'Redoxpotential': 'mV',
            'Wassertemperatur': '°C',
            'Wassertemp. (0.5m)': '°C',
            'Wassertemp. (1m)': '°C',
            'Wassertemp. (2m)': '°C',
            'Lufttemperatur': '°C',
            'Supply Current': 'mA',
            'Supply Voltage': 'V'
        }
        return units.get(param, '')


# Integration in main_pipeline.py
def generate_html_dashboard(analysis_results: Dict, output_dir: str, station_id: str):
    """Wrapper-Funktion für die Integration in main_pipeline.py"""
    
    # Station-Metadaten aus config laden
    from config_file import STATIONS
    station_metadata = STATIONS.get(station_id, {})
    
    # Finde die Pfade zu den zusätzlichen Dateien mit verbesserter Suche
    print(f"\nSuche zusätzliche Dateien für Dashboard in: {output_dir}")
    
    error_data_path = None
    text_report_path = None
    
    # Liste alle Dateien im Output-Verzeichnis
    all_files = os.listdir(output_dir)
    print(f"Gefundene Dateien: {len(all_files)}")
    
    # Suche mit Glob für bessere Muster-Erkennung
    error_files = glob.glob(os.path.join(output_dir, f"*{station_id}*fehlerhafte_werte.json"))
    if error_files:
        error_data_path = error_files[0]  # Nimm die neueste
        print(f"Fehlerhafte Werte gefunden: {os.path.basename(error_data_path)}")
    else:
        print("WARNUNG: Keine fehlerhafte_werte.json gefunden")
    
    text_files = glob.glob(os.path.join(output_dir, f"validierung_details_{station_id}_*.txt"))
    if text_files:
        text_report_path = sorted(text_files)[-1]  # Nimm die neueste
        print(f"Text-Bericht gefunden: {os.path.basename(text_report_path)}")
    else:
        print("WARNUNG: Kein validierung_details.txt gefunden")
    
    # Dashboard generieren
    generator = HTMLDashboardGenerator()
    html_content = generator.generate_dashboard(
        analysis_results, 
        station_metadata,
        error_data_path,
        text_report_path
    )
    
    # Speichern
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    html_filepath = os.path.join(output_dir, f"dashboard_{station_id}_{timestamp_str}.html")
    
    with open(html_filepath, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"HTML-Dashboard erstellt: {html_filepath}")
    print(f"  - Mit Fehlerdaten: {'Ja' if error_data_path else 'Nein'}")
    print(f"  - Mit Text-Bericht: {'Ja' if text_report_path else 'Nein'}")
    
    return html_filepath