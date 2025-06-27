# Dockerfile für das Backend

# 1. Basis-Image: Wir starten mit einer offiziellen Umgebung, die Node.js enthält
FROM node:18-slim

# 2. Umgebungsvariablen setzen
ENV NODE_ENV=production

# 3. Python und Abhängigkeiten installieren
# Wir aktualisieren die Paketliste, installieren Python, pip und Git
RUN apt-get update && apt-get install -y python3 python3-pip git && rm -rf /var/lib/apt/lists/*

# 4. Arbeitsverzeichnis im Container erstellen
WORKDIR /app

# 5. package.json und package-lock.json kopieren und Node-Module installieren
# Dies wird gecached und nur neu ausgeführt, wenn sich diese Dateien ändern.
COPY package*.json ./
RUN npm install --production

# 6. Den gesamten restlichen Projekt-Code in den Container kopieren
COPY . .

# 7. Python-Abhängigkeiten aus der requirements.txt installieren
# WICHTIG: Stellen Sie sicher, dass daten_pipeline jetzt im backend-Ordner ist!
RUN pip3 install --no-cache-dir --break-system-packages -r daten_pipeline/requirements.txt

# 8. Den Port freigeben, auf dem der Server lauschen wird
EXPOSE 8080

# 9. Der Befehl, der beim Starten des Containers ausgeführt wird
CMD ["npm", "start"]