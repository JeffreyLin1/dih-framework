# DIH Framework

DIH Framework is a Next.js-based toolkit for building AI-powered applications with ease.
🚧 This package is still under construction. Not production-ready!

## Overview

DIH Framework is built on top of Next.js, providing a robust foundation for creating AI-powered web applications. It combines the power of Next.js with AI capabilities to help you build sophisticated applications quickly.

## Packages

- `create-dih-app`: CLI tool to create new DIH applications (Next.js-based)
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

This will create a new Next.js application with DIH Framework integration.

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