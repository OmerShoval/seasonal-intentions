# Seasonal Intentions App

## Vision
A daily intentional process that starts with a seasonal intention plan and brings it into life each day. The experience should feel magical, beautiful, and personal — like a sacred ritual rather than a productivity tool.

## Current Season
- **Season**: Summer 2026 (Angola surf season)
- **Setup**: Goals entered at the start of each season via guided form

## Season Goals (from Omer's Season Plan)
- Improve work flow — system that organizes data, working app with login and personal place per student
- Powerful coaching sessions — professional, fun, present with love, set the vibe
- Fun connections — love them, know them, be with yourself, lead them to success
- Be super calm and love myself — journal with love, accept this life
- Wave reading — teach properly with patience, biology, 3rd/1st person viewing
- Positive lineup — share story + set expectations + personal example
- Movie editing — start editing what you have, share story, love it
- Be open to connect — hang out, just be, play games, share meaningful moments
- Lou (fun together) — let it come to you
- Grow in character — be the Tony character, calm person, enjoy the job
- Learn and improve app — measure usage, efficiency, experience, build more
- Eat healthy and train — find right dishes, nutritional plan, keep up workout schedule
- Israel coaching — create landing page for Kineret with location and schedule
- Connect present to life vision — daily noticing, appreciative watch
- Feel fulfilled daily — calm, fulfilled, in control, regulated, allowing life to flow

## Daily Ritual Flow
1. **Morning** — Feel into season goals via the orbital view → pick today's focus → set an intention
2. **Evening** — Journal what happened, how it felt, energy rating (1-10)

## Tech Stack
- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **Key UI**: Radial Orbital Timeline (dark, immersive, orbiting nodes = season goals)
- **Database**: Supabase (project: OmerShoval's Project — ilupamsiuzgumtutzbka)
- **Deployment**: Vercel

## Supabase Schema
- `seasons` — one row per season cycle; `goals` is JSONB array
- `daily_entries` — one row per day; morning focus + evening journal + energy

## Design Direction
- Dark/black background, immersive
- White orbital elements with glow effects
- Clean, minimal typography — nothing in the way
- Feels like a sacred space (deep, intentional, slightly cinematic)
- Adapted from the Radial Orbital Timeline component

## Goal Object Shape (JSONB)
```json
{
  "id": "uuid",
  "title": "Be super calm and love myself",
  "action": "Journal with love and accept my life",
  "category": "Personal",
  "icon": "heart",
  "energy": 80,
  "relatedIds": []
}
```
