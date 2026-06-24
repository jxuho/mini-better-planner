# Mini Better Planner

Mini Better Planner is a polished Vue prototype for a depot manager preparing a morning dispatch plan around Berlin. It turns deterministic mock delivery stops into driver tours, visualizes those tours on an OpenStreetMap-based Mapbox GL JS map, and lets the user inspect and adjust the plan.

This prototype explores how a depot planner could turn raw delivery stops into a visual, inspectable, and adjustable dispatch plan. It does not attempt to solve real-world route optimization. Instead, it focuses on frontend concerns: geospatial visualization, state modeling, interactive planning workflows, and making complex logistics data understandable for operations users.

## Why It Fits Last-Mile Planning

Last-mile planning tools sit at the intersection of maps, operational KPIs, changing constraints, and fast human decision-making. This prototype demonstrates the frontend problems behind that experience:

- Modeling stops, drivers, tours, loading zones, and derived planning metrics in TypeScript.
- Rendering geospatial operational state with Mapbox GL JS and the Mapbox light-v11 basemap.
- Keeping map layers, cards, KPIs, warnings, and manual edits synchronized through Vue state.
- Making a non-optimal algorithm explainable so planners can understand and trust what happened.
- Supporting inspection and manual reassignment without a backend.

## Features

- Berlin Westhafen depot with 78 deterministic mock stops around the city.
- Driver count control for 3 to 8 drivers.
- Auto-assignment of stops to driver tours.
- Driver-colored stops and route lines on the map.
- Clickable tours and stops with map highlighting.
- Planning KPIs: stop count, parcels, average stops per driver, estimated distance, balance score, and compactness.
- Tour cards with stops, parcels, distance, working time, load percentage, and overload badges.
- Stop inspection panel with parcel count, service time, priority, depot distance, and reassignment.
- Loading zone simulation with parcel capacity warnings.
- Regenerate stops, reset plan, high-priority stop styling, legend, and localStorage persistence.

## Auto-Assignment Heuristic

The planner intentionally uses a simple transparent heuristic rather than real route optimization:

1. Calculate the bearing from the depot to every stop.
2. Sort stops clockwise around the depot.
3. Split that ordered list into driver sectors while trying to keep stop count and parcel count near each driver's fair share.
4. Sequence each driver's sector using a nearest-neighbor pass from the depot.
5. Estimate route distance, working time, load, warnings, balance, and compactness from the resulting tours.

This is not mathematically optimal. The goal is to make the planning state understandable and easy to inspect, which is often just as important in operations software as the initial algorithmic output.

## Technical Choices

- **Vue 3 + Composition API** for stateful, componentized planning workflows.
- **Vite + TypeScript** for fast local development and strong domain models.
- **TailwindCSS** for a compact internal-tool interface.
- **Mapbox GL JS** with the `mapbox://styles/mapbox/light-v11` basemap.
- **Turf.js** for geospatial distance, bearing, and generated stop coordinates.
- **Local mock data** generated deterministically from a seeded pseudo-random function.

## Project Structure

```text
src/
  components/
    AppHeader.vue
    DriverCard.vue
    LoadingZones.vue
    MapView.vue
    PlanningPanel.vue
    StopDetails.vue
  composables/
    useMapLayers.ts
    useMockStops.ts
    usePlanning.ts
  types/
    planning.ts
  utils/
    geo.ts
    planningHeuristics.ts
  App.vue
  main.ts
```

## Run Locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

The map uses Mapbox `light-v11`, so create a local `.env` file with a Mapbox public token:

```bash
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

Restart `npm run dev` after changing `.env`.

For a production build:

```bash
npm run build
```

## Limitations

- Routes are straight-line connections between sequenced stops, not road-network routes.
- Driver working time is estimated from route distance, service minutes, and a fixed Berlin city speed.
- The assignment heuristic does not consider delivery windows, vehicle capacity classes, skills, breaks, traffic, or real depot loading constraints.
- Mapbox light-v11 requires a public Mapbox token and network access in the browser.

## What I Would Improve Next

- Use real road-network routing and travel-time matrices.
- Add drag-and-drop reassignment between tours.
- Support delivery time windows and service constraints.
- Add undo/redo for planner edits.
- Add route comparison snapshots before and after manual adjustments.
- Add unit tests for the heuristic and Playwright checks for the planning workflow.
