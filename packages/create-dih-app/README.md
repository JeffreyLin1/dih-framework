# Create DIH App

Create DIH Framework applications with one command.

## Usage

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

The CLI will guide you through the setup process, allowing you to choose from different templates:

- `basic`: A simple JavaScript project
- `with-typescript`: A TypeScript project
- `with-nextjs`: A Next.js project with TypeScript

## Development

To develop the CLI locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the CLI: `npm run build`
4. Link the package: `npm link`
5. Run the CLI: `create-dih-app my-test-app`

## Templates

The CLI includes several templates:

- `basic`: A minimal JavaScript setup
- `with-typescript`: A TypeScript configuration with type checking
- `with-nextjs`: A Next.js application with TypeScript support

## License

MIT 