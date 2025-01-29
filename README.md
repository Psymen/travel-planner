# Travel Planner

An AI-powered travel planner that helps create and optimize travel itineraries. This project was submitted to the Menlo Ventures & Canaan Partners "Can VCs Even Code" Hackathon on January 25, 2024.

## Overview

Travel Planner is an intelligent itinerary management tool that leverages AI to help travelers create, optimize, and explore alternative travel plans. Built with a focus on user experience and practical travel logistics, it helps ensure your travel plans are both exciting and feasible.

## Features

- Create and manage travel itineraries
- AI-powered suggestions for activities and scheduling
- Smart handling of travel times and logistics
- Pinnable items for fixed events
- Alternative itinerary suggestions

## Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/travel-planner.git
cd travel-planner
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
- Copy `.env.example` to `.env.local`
- Add your OpenAI API key to `.env.local`

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_OPENAI_API_KEY`: Your OpenAI API key

Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
``` 