# MERN Task - Review & Rating App

This project consists of a React frontend and an Express/MongoDB backend, built to match a premium glassmorphic design and the specific functionality outlined in the Figma scope.

## Prerequisites
- Node.js installed
- MongoDB running locally on port 27017 (or update the `MONGO_URI` in `backend/server.js`)

## Getting Started

### 1. Start the Backend
Open a terminal in the `backend` directory and run:
```bash
npm run dev
```
(Or `npm start` if you don't have nodemon installed globally, but nodemon is in devDependencies). The server will run on http://localhost:5000.

### 2. Start the Frontend
Open another terminal in the `frontend` directory and run:
```bash
npm run dev
```
The Vite development server will start on http://localhost:5173.

## Features Implemented
- **Premium UI**: Implemented a responsive, rich glassmorphic aesthetic following the requested design system requirements.
- **Add Company**: Form to create companies with location, founded date, and logo URL.
- **Company Listing**: Displays companies with average rating, search by name, and filter by location.
- **Add Review**: Form directly on the company profile to add a review, subject, text, and 1-5 rating.
- **Review Listing**: Sorts reviews by Newest, Highest Rating, or Most Relevant (likes), with the ability to like/upvote reviews. Displays a prominent average rating calculation.
