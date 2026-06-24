# AGENTS.md

## Project Context

Mini Better Planner is a Vue 3 interview prototype for last-mile delivery planning. It simulates a Berlin depot morning dispatch workflow with mock delivery stops, driver assignment, map visualization, planning KPIs, warnings, and manual reassignment.

The goal is not real route optimization. The goal is to demonstrate frontend engineering judgment around geospatial UI, state modeling, operational dashboards, and explainable planning workflows.

## Development Guidelines

- Use Vue 3 Composition API and TypeScript.
- Keep planning/domain logic out of Vue components when possible.
- Keep Mapbox GL JS layer setup inside map-specific modules or components.
- Prefer small, focused components and composables.
- Preserve deterministic mock data unless intentionally changing demo behavior.
- Keep the assignment heuristic transparent and documented.
- Avoid adding backend dependencies.
- Keep the app easy to run with `npm install` and `npm run dev`.

## Architecture Notes

- Domain types live in `src/types/planning.ts`.
- Planning state and derived metrics live in `src/composables/usePlanning.ts`.
- Mock stop generation lives in `src/composables/useMockStops.ts`.
- Map GeoJSON shaping lives in `src/composables/useMapLayers.ts`.
- Assignment and sequencing logic lives in `src/utils/planningHeuristics.ts`.
- Geospatial helpers live in `src/utils/geo.ts`.

## UI Principles

- This should feel like a real internal logistics tool, not a marketing page.
- Prioritize clarity, density, and fast inspection.
- Keep map, metrics, driver cards, warnings, and stop details synchronized.
- Highlight operational risk clearly but avoid visual noise.
- Do not hide the simplicity of the heuristic; make it explainable.

## Verification

Before handing off changes, run:

```bash
npm run build
```

If map behavior changed, also run:
```bash
npm run dev
```

Then manually check the map, stop selection, driver selection, and reassignment flow.

## Mapbox
The map uses `mapbox://styles/mapbox/light-v11`.
Create a local .env file with:
```bash
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```