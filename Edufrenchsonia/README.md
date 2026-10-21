# EduFrench by Sonia

A French-learning platform built with React, TypeScript, and Vite.

## Requirements
- Node.js (LTS recommended)
- npm

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a local `.env` file from `.env.example` and fill in the required values:
   ```bash
   cp .env.example .env
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Create a production build:
   ```bash
   npm run build
   ```

## Environment variables
Configure your own API credentials and project settings in `.env`. Never commit `.env` or real secrets. `.env.example` contains placeholders only.

## GitHub note
Generated build folders and local test/debug scripts are intentionally excluded. Run `npm install` to restore dependencies from `package-lock.json`.
