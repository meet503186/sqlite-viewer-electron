# Sqlite Viewer Electron App

A simple Electron app built with Vite and React for viewing and interacting with SQLite database files. It allows users to upload an SQLite database file, execute queries, and modify the file directly.

## Features

- Upload SQLite database files
- Execute queries on the uploaded database
- Modify the SQLite database directly from the app
- Package the app for macOS with a `.dmg` installer

## Prerequisites

Before running or building the app, ensure you have the following installed:

- **Node.js** (v16.0 or higher)
- **npm** (comes with Node.js)
- **Electron** (v30.0.1 or higher)
- **Electron-builder** for packaging

You can verify if Node.js and npm are installed by running:

```bash
node -v
npm -v
```

If not installed, please download and install them from the official Node.js website: Node.js download.

## Installation

Clone the repository and install the required dependencies:

```bash
git clone https://github.com/meet503186/sqlite-viewer-electron
cd sqlite-viewer-electron
npm install

```

## Development Mode

To start the app in development mode, run:

```bash
npm run dev
```

This will launch the app in your default browser, where you can test the features, including uploading SQLite files and executing queries.

## Build & Package the App

To build and package the app for production (macOS), run:

```bash
npm run build
```

This will:

1. Compile TypeScript code with tsc.
2. Build the app with Vite using vite build.
3. Package the app into a .dmg installer using electron-builder.

## Output

The .dmg file will be created in the dist/ folder by default. If you want to change the output directory to release/, modify your package.json as follows:

```json
"build": {
  "directories": {
    "output": "release"
  },
  ...
}
```

## Packaging for macOS

Ensure that you have macOS-specific icons and resources in your public/ folder:

```scss
public/
  sqlite.icns # Your app's .icns icon (for macOS)
  sqlite.png # Your app's .png icon (for dmg)
  dmg-background.png # (Optional) Background image for .dmg
```

Once the .dmg file is created, you can mount it and drag the app into your Applications folder.

## Notes

- **SQLite Database**: Make sure the SQLite database file is properly uploaded through the interface to interact with it. You can execute SQL queries and save the modified database.
- **macOS App Not Running**: If the application isn't running after packaging:
  Check the **Console** logs on macOS for error messages.
  Make sure that all necessary permissions are set for file access, especially for SQLite database files.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
