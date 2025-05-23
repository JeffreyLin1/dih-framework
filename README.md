# DIH 🥀

DIH is a framework for building AI-powered applications.

## Packages

- [`create-dih-app`](https://www.npmjs.com/package/create-dih-app): CLI tool to create new DIH applications (Next.js-based)
- [`@tr1jeffrey/dih`](https://www.npmjs.com/package/@tr1jeffrey/dih): Core framework package

Check out the package documentation for actual info on what's in here ;)

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

This will create a new Next.js application with DIH 🥀 integration.

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
