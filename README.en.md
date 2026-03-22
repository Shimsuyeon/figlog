[한국어](./README.md) | **English**

# FigLog

End-to-end declarative logging pipeline:
**Mark logging points in Figma → Export JSON spec → Build-time metadata injection → Runtime auto-collection**

<div align="center">
<img width="500" alt="image" src="https://github.com/user-attachments/assets/81184c51-e593-4ad8-8fa9-317cc0725d38" />
</div>

## How It Works

```
DA marks logging points in Figma → JSON spec / TSV for sheets exported
  → Developer adds data-log attributes (or AI does it from the spec)
  → Vite plugin injects component/folder metadata at build time
  → useAutoLog hook auto-collects click & view events at runtime
```

<div align="center">
  <img width="500" alt="image" src="https://github.com/user-attachments/assets/ecf6b700-a8b5-44cf-b054-5e975a2f91f3" />
  <p><em>Runtime event collection by the useAutoLog hook</em></p>
</div>

## Packages

| Package | Description |
|---|---|
| [`@figlog/schema`](./packages/schema) | Shared TypeScript types and JSON schema for logging specs |
| [`@figlog/vite-plugin`](./packages/vite-plugin) | Vite plugin that injects `data-log-component` and `data-log-folder` at build time |
| [`@figlog/runtime`](./packages/runtime) | `useAutoLog` React hook for automatic event collection |
| [`@figlog/figma-plugin`](./packages/figma-plugin) | Figma plugin for DA to mark logging points and export specs |

## Quick Start

### 1. Install

```bash
pnpm add @figlog/runtime
pnpm add -D @figlog/vite-plugin
```

### 2. Configure Vite

```typescript
// vite.config.ts
import autoLog from '@figlog/vite-plugin'

export default defineConfig({
  plugins: [autoLog({ folderDepth: 1 })],
})
```

### 3. Add the Hook

```tsx
// App.tsx
import { useAutoLog } from '@figlog/runtime'

function App() {
  useAutoLog({
    domainMap: { shop: 'OnlineShop' },
    onLog: (eventType, payload) => {
      myAnalytics.track(eventType, payload)
    },
  })

  return <ProductListScreen />
}
```

### 4. Mark Elements

```tsx
<div data-log-screen="productList">
  {/* DA-defined event (with data-log-id) */}
  <Button data-log="click" data-log-id="addToCart">
    Add to Cart
  </Button>

  {/* Auto-generated event name (no id) */}
  <Button data-log="click">View Details</Button>

  {/* View event - fires when element enters viewport */}
  <Banner data-log="view" data-log-id="productCard">
    Product Card
  </Banner>
</div>
```

## HTML Attributes

| Attribute | Injected By | Description |
|---|---|---|
| `data-log` | Developer | `'click'` or `'view'` |
| `data-log-id` | Developer | DA-defined event ID (omit for auto-generated name) |
| `data-log-screen` | Developer | Screen identifier (used for placement) |
| `data-log-component` | Build-time (auto) | Extracted from file name |
| `data-log-folder` | Build-time (auto) | Extracted from folder name |

## Event Name Generation

| Mode | Condition | Pattern | Example |
|---|---|---|---|
| DA-defined | `data-log-id` present | `{action}{Domain}{Id}` | `clickOnlineShopAddToCart` |
| Auto-generated | No `data-log-id` | `{folder}.{component}.{action}` | `shop.ProductList.click` |

## Figma Plugin

> [Install from Figma Community](https://www.figma.com/community/plugin/1617597676660123564)

A plugin that allows DAs to mark and manage logging points directly in Figma design files.

### Key Features

- **Event Marking**: Assign eventType, eventName, placement, etc. to selected layers
- **Edit/Delete**: Click existing events in the Result tab to modify or remove
- **Export JSON**: Export all events as a JSON spec (copied to clipboard)
- **Copy for Sheet**: Copy as tab-separated values — paste directly into Google Sheets / Excel
- **Auto Figma Links**: Automatically generate Figma URLs for each node
- **Node Focus**: Click an event in the Result tab to navigate to that layer

### Add Events (Add Tab)

- Click the element that needs logging, fill in event details, then click Save Event

<div align="center">
  <img width="500" alt="image" src="https://github.com/user-attachments/assets/0be12b93-4140-4df3-8572-4e2dc1bde03d" />
</div>

### View Results (Result Tab)

- View all logged events; click any event to edit
- Export JSON button to share logging spec with developers

<div align="center">
  <img width="500" alt="image" src="https://github.com/user-attachments/assets/ab9d6af6-8df1-4749-8105-21fdb186e836" />
</div>

### Copy for Sheet

- Click Copy for Sheet in the Result tab, then Ctrl+V into your spreadsheet

```
group | eventType | placement | eventName | actionType | description | url
```

<div align="center">
  <img width="500" alt="image" src="https://github.com/user-attachments/assets/641856dd-3b78-475a-be7c-272c1048675a" />
  <p><em>Copy for Sheet → paste directly into Google Sheets</em></p>
</div>

### Installation

1. Figma → Plugins → Development → Import plugin from manifest
2. Select `packages/figma-plugin/manifest.json`

### Data Storage

Logging data is stored in the Figma file's `pluginData`. It syncs with the Figma file without any external server or local files — anyone opening the same file sees the same data.

## Design File

— Shopping mall mockup design file created with Figma Make
- Implementation example in examples/react-app

[`design/figlog-mockup-uiux.fig`](./design/figlog-mockup-uiux.fig)

<div align="center">
  <img width="500" alt="image" src="https://github.com/user-attachments/assets/e9c41d3f-4a75-478d-b541-41cbf183dc33" />
</div>

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run example app
cd examples/react-app && pnpm dev

# Build Figma plugin
pnpm --filter @figlog/figma-plugin build
```

## License

MIT
