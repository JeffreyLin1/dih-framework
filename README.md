# DIH Framework

DIH Framework is a toolkit for building AI-powered applications with ease.

## Packages

- `create-dih-app`: CLI tool to create new DIH applications
- `dih`: Core framework package (coming soon)

## Getting Started

To create a new DIH application, use the following command:

```bash
# Using npx
npx create-dih-app my-app

# Using npm
npm init dih-app my-app

# Using yarn
yarn create dih-app my-app

# Using pnpm
pnpm create dih-app my-app
```

## Development

This is a monorepo managed with npm workspaces.

### Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build
```

### Working on packages

```bash
# Development mode
npm run dev

# Lint all packages
npm run lint

# Clean build artifacts
npm run clean
```

## License

MIT 