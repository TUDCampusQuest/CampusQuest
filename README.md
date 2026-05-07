CampusQuest

3rd Year Major Group Project

Paul Adebalu, Aaron Dignam, Chidozie Onyejelem

Check out the app here: https://campusquest-flax.vercel.app/

Description Of Project:

What it does

Campus Quest lets students and visitors navigate the TU Dublin Blanchardstown campus - outdoors between buildings and indoors room to room. Scan a QR code on any building to jump straight to it, follow premade walking trails, or get step-by-step directions to any room on any floor.

Features

- Outdoor routing - shortest walking path between campus buildings using a campus graph and Dijkstra's algorithm, with Mapbox Directions for off-campus segments
- Indoor navigation - room-to-room routing across floors using BFS and haversine-weighted graphs, with live GPS tracking
- QR code scanning - scan codes placed on buildings to deep-link directly to that location on the map
- Campus trails - browse and follow premade walking routes with named stop cards
- Search - find any building or indoor room by name, room code, or type (lectures, labs, toilets, stairs)
- Dark / light mode - full css, uses toggle switch between mapbox custom made map style, persisted to localStorage
- Staff admin - hidden login for creating and publishing new trails directly to S3

Tech stack

Next.js 14 (App Router) - full-stack framework, API routes, SSG for building detail pages
Mapbox GL JS / react-map-gl - interactive map, GeoJSON indoor overlays, 3D building view
Framer Motion - iOS-style spring-physics bottom sheets and animated drawers
AWS S3 - stores indoor spatial data (rooms, routing graphs, floorplans) and trail records
AWS DynamoDB - staff accounts with bcrypt-hashed passwords
Material UI - base UI and icon set
html5-qrcode - camera QR scanning
CSS Modules + CSS Custom Properties - designed styles and full dark/light theming

Getting started

```bash
npm install
npm run dev
```

Requires a `.env.local` file with:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
S3_KEY_PREFIX=
DYNAMO_STAFF_TABLE=
```