# DIH 🥀

A lightweight, flexible framework for building AI-powered applications with support for OpenAI and Anthropic models.

## Installation

```bash
npm install dih
# or
yarn add dih
# or
pnpm add dih
```

## Features

- 🔄 Support for OpenAI and Anthropic models
- 💬 Chat completions API
- 🧩 Function/tool calling capabilities
- 📝 Prompt templating system
- 🔌 Streaming support
- 🧮 Token counting utilities

## Quick Start

```javascript
import { DIH, ChatMessage } from 'dih';

// Initialize the framework
const dih = new DIH({
  apiKey: process.env.OPENAI_API_KEY, // or ANTHROPIC_API_KEY for Claude
  modelName: 'gpt-3.5-turbo'
});

// Start using it
async function main() {
  await dih.init();
  
  const model = dih.getModel();
  const response = await model.createCompletion({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Write a short poem about coding.' }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

main().catch(console.error);
```

## Using Prompt Templates

```javascript
import { PromptTemplate } from 'dih';

const template = new PromptTemplate(
  `You are a {role} specialist in {domain}. 
   Please {action} the following: {input}`
);

const prompt = template.format({
  role: 'helpful',
  domain: 'JavaScript',
  action: 'explain',
  input: 'async/await patterns'
});

console.log(prompt);
```

## Streaming Responses

```javascript
import { DIH, DefaultStreamingHandler } from 'dih';

const dih = new DIH({ apiKey: process.env.OPENAI_API_KEY });
await dih.init();

const handler = new DefaultStreamingHandler(
  (text) => console.log('Current text:', text),
  (finalResponse) => console.log('Done!', finalResponse),
  (error) => console.error('Error:', error)
);

await dih.getModel().createStreamingCompletion(
  {
    messages: [{ role: 'user', content: 'Tell me a short story' }],
    stream: true
  },
  (chunk) => handler.onChunk(chunk),
  (fullResponse) => handler.onComplete(fullResponse),
  (error) => handler.onError(error)
);
```

## Using Different Models

```javascript
import { DIH, AnthropicModel } from 'dih';

// Start with OpenAI
const dih = new DIH({ apiKey: process.env.OPENAI_API_KEY });
await dih.init();

// Switch to Anthropic
const anthropic = new AnthropicModel({ 
  apiKey: process.env.ANTHROPIC_API_KEY,
  modelName: 'claude-3-opus-20240229'
});
dih.setModel(anthropic);
```

## Using Function Calling

```javascript
import { DIH } from 'dih';

const dih = new DIH({ apiKey: process.env.OPENAI_API_KEY });
await dih.init();

// Define a tool
const weatherTool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g., San Francisco, CA'
        }
      },
      required: ['location']
    }
  }
};

// Call the model with tool definition
const response = await dih.getModel().createCompletion({
  messages: [
    { role: 'user', content: 'What\'s the weather in New York?' }
  ],
  tools: [weatherTool],
  toolChoice: 'auto'
});

// Process tool calls
if (response.choices[0].message.tool_calls) {
  console.log('Tool calls:', response.choices[0].message.tool_calls);
}
```

## Configuration

The DIH framework accepts the following configuration options:

- `apiKey`: Your API key for authentication
- `modelName`: The AI model to use (default: 'gpt-4')
- `maxTokens`: Maximum number of tokens to generate (default: 1000)

## License

MIT 