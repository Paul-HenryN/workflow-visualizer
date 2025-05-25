# GitHub Workflow Visualizer

A small tool that lets you **visualize GitHub Actions workflows** as interactive graphs.

Built to explore [React Flow](https://reactflow.dev) and [Monaco Editor](https://github.com/microsoft/monaco-editor).

[https://workflow-visualizer.paulhenry.dev/](https://workflow-visualizer.paulhenry.dev/)

## Features

- **Live YAML parsing** to detect jobs and dependencies
- **Interactive graph UI** using React Flow
- **Built-in code editor** with Monaco Editor
- **Schema validation** using [Zod](https://zod.dev)
- Smooth updates with debounced state and error handling

## Tech Stack

- **React** + **Vite**
- **React Flow** (node/edge rendering)
- **Monaco Editor** (code editing)
- **Zod** (schema validation)
- **js-yaml** (YAML parsing)

## Example input

```yaml
name: CI

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run build

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm test
```

## Potential Improvements

- Friendlier and more detailed error messages
- Visual editor for configuring workflows without writing YAML
- Export/share workflows as images or links
- Auto layout and performance tweaks

## Getting Started

```bash
git clone https://github.com/your-username/github-workflow-visualizer.git
cd github-workflow-visualizer
pnpm install
pnpm run dev
```

Then open `http://localhost:5173` in your browser.
