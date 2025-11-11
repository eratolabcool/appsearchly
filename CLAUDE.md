# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Apple App Store frontend source code** extracted from the public App Store website (apps.apple.com). The code was obtained because Apple left sourcemaps enabled in production. This is a large-scale enterprise web application built with Svelte 5 and TypeScript, using Apple's proprietary internal frameworks.

**Important**: This codebase is for educational and research purposes only. All code is copyrighted by Apple Inc.

## Technology Stack

- **Frontend Framework**: Svelte 5 with TypeScript
- **Styling**: SCSS with Apple's internal SassKit
- **Architecture**: Apple's proprietary Jet Framework (intent-action pattern)
- **Internal Frameworks**:
  - `@amp/*` - Components, logging, localization, metrics
  - `@jet/*` - Business logic and routing
  - `@jet-app/*` - App Store specific implementations

## Architecture Patterns

### Jet Framework (Intent-Action Architecture)
The application follows Apple's Jet framework pattern:

- **Intents** (`src/jet/intents/`): Represent user actions or system events (e.g., `RouteUrlIntent`)
- **Actions**: Business logic implementations that handle intents
- **Intent Controllers**: Classes that process and respond to intents
- **Action Dispatcher**: Central dispatcher for executing actions

### Key Components

1. **Jet Class** (`src/jet/jet.ts`): Main entry point for interacting with Jet business logic
2. **Bootstrap** (`src/bootstrap.ts`): Application initialization and configuration
3. **Main App** (`src/App.svelte`): Root Svelte component handling page routing

### State Management

- **Jet Runtime**: Central state management through the Jet framework
- **Svelte Stores** (`src/stores/`): Local component state management
- **Context Pattern** (`src/context/`): Global state injection

## Directory Structure

```
src/
├── components/          # 187+ Svelte UI components
│   ├── structure/      # Fonts, Footer, Navigation
│   ├── navigation/     # Navigation components
│   └── ...
├── jet/                # Jet framework integration
│   ├── intents/        # Intent controllers for routing
│   ├── models/         # TypeScript interfaces
│   ├── dependencies/   # External service integrations
│   └── metrics/        # Metrics collection
├── stores/             # State management (i18n, modal states)
├── config/             # Component and error configuration
├── constants/          # Application constants
├── utils/              # Utility functions
└── context/            # Context providers
```

## Development Workflow

Since this is extracted production code without standard build tools, development requires understanding the existing patterns:

### Key Files to Understand

1. **Entry Points**:
   - `src/browser.ts` - Browser application entry
   - `src/bootstrap.ts` - Application initialization
   - `src/App.svelte` - Main application component

2. **Configuration**:
   - `src/config/` - Component configurations and error handling
   - `src/constants/storefront.ts` - Storefront and locale constants

3. **Jet Integration**:
   - `src/jet/jet.ts` - Main Jet class for intent dispatch
   - `src/jet/intents/` - Routing and navigation intents
   - `src/jet/dependencies/` - External service integrations

### Working with Components

Components follow Svelte 5 patterns with:
- TypeScript for type safety
- SCSS with Apple's SassKit for styling
- Reactive state management using Svelte stores
- Internationalization support through the i18n store

### Adding New Features

1. **Components**: Add to appropriate `src/components/` subdirectory
2. **Jet Intents**: Create intent controllers in `src/jet/intents/`
3. **State Management**: Use stores in `src/stores/` or create new ones
4. **Configuration**: Add component configs in `src/config/`

## Code Patterns

### Intent Dispatch Pattern
```typescript
// Dispatching intents through Jet framework
const result = await jet.dispatch(makeRouteUrlIntent({ url }));
```

### Component Structure
- Use TypeScript interfaces for props
- Implement responsive design with SCSS breakpoints
- Follow Apple's accessibility patterns
- Use proper focus management

### Error Handling
- Transform promise rejections into error pages in `App.svelte`
- Use `src/config/` for error configurations
- Implement proper logging through the logging framework

## Important Considerations

- **No Standard Build Tools**: This is extracted production code, not a typical development project
- **Internal Dependencies**: Many `@amp/*` and `@jet/*` packages are Apple's internal frameworks
- **Educational Purpose**: Study the patterns and architecture, but do not attempt to run or deploy
- **Apple Standards**: Code follows Apple's strict coding standards and patterns

## File Reference Examples

When referencing files, use the relative path format:
- `src/components/structure/Fonts.svelte` - Font loading component
- `src/jet/jet.ts:48` - Main Jet class definition
- `src/bootstrap.ts:29` - Bootstrap function for app initialization
- `src/App.svelte:22-27` - Page handling and navigation logic