# DIH Framework

A framework for building AI-powered applications.

## Installation

```bash
npm install dih
```

## Usage

```javascript
import DIH from 'dih';

const dih = new DIH({
  apiKey: process.env.DIH_API_KEY,
  modelName: 'gpt-4'
});

await dih.init();
```

## Configuration

The DIH framework accepts the following configuration options:

- `apiKey`: Your API key for authentication
- `modelName`: The AI model to use (default: 'gpt-4')
- `maxTokens`: Maximum number of tokens to generate (default: 1000)

## License

MIT 