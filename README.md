# Wunderkammer Assistant

Ein modernes Web-Tool zur Optimierung von Produkttexten mit KI-Unterstützung.

## Features

- Texteingabe und -optimierung
- Keyword-basierte SEO-Optimierung
- Anpassbare Tonalität
- Zielgruppen-spezifische Anpassung
- Redundanz-Erkennung und -Entfernung

## Installation

1. Repository klonen:
```bash
git clone https://github.com/stefanulr/wunderkammer-assistant.git
cd wunderkammer-assistant
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Umgebungsvariablen einrichten:
- Kopieren Sie `.env.local.example` zu `.env.local`
- Fügen Sie Ihren OpenAI API-Key ein

4. Entwicklungsserver starten:
```bash
npm run dev
```

## Verwendung

1. Öffnen Sie die Anwendung im Browser (standardmäßig unter `http://localhost:3000`)
2. Geben Sie Ihre Produkttexte in das Textfeld ein
3. Optional: Geben Sie wichtige Keywords und Zielgruppe an
4. Wählen Sie den gewünschten Ton
5. Klicken Sie auf "Text optimieren"
6. Der optimierte Text wird angezeigt

## Technologien

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API
- React Hook Form
- Zod

## Lizenz

MIT
