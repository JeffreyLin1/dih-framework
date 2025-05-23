# DIH Framework with Next.js

This is a [Next.js](https://nextjs.org/) project bootstrapped with [DIH 🥀](https://github.com/jeffreylin1/dih-framework), providing you with AI-powered capabilities out of the box.

## 🚀 Getting Started

First, set up your environment variables:

Create a `.env.local` file in the root directory and add your API keys:

```bash
# OpenAI API key for GPT models
OPENAI_API_KEY=your_openai_api_key

# Optional: Anthropic API key for Claude models
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📚 What's Included

This template provides several examples demonstrating how to use DIH Framework with Next.js:

- **Chat Interface**: A basic chat interface using the DIH Framework's chat completion capabilities (`/pages/chat.tsx`)
- **Tool Usage**: Example of using AI with tools to perform actions (`/pages/tools.tsx`)
- **Prompt Templates**: How to use prompt templates for consistent AI interactions (`/pages/templates.tsx`)
- **API Routes**: Backend API implementation using DIH Framework (`/pages/api/chat.ts`)

## 🧩 DIH Framework Features

The DIH Framework provides these key features that you can use in your app:

### Chat Completions

```typescript
import { DIH, ChatMessage } from '@tr1jeffrey/dih';

// Create a DIH instance
const dih = new DIH({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo'
});

// Initialize
await dih.init();

// Get the model and generate a response
const model = dih.getModel();
const response = await model.createCompletion({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello, who are you?' }
  ]
});
```

### Prompt Templates

```typescript
import { PromptTemplate } from '@tr1jeffrey/dih';

// Create a reusable template
const template = new PromptTemplate(
  `You are a {role} expert in {topic}. Answer this question: {question}`
);

// Format with values
const prompt = template.format({
  role: 'friendly',
  topic: 'JavaScript',
  question: 'How do promises work?'
});
```

### Streaming Responses

```typescript
import { DIH, DefaultStreamingHandler } from '@tr1jeffrey/dih';

// Create streaming handler
const handler = new DefaultStreamingHandler(
  (text) => console.log('New text:', text),
  (response) => console.log('Complete:', response),
  (error) => console.error('Error:', error)
);

// Stream response
await dih.getModel().createStreamingCompletion(
  {
    messages: [
      { role: 'user', content: 'Write a poem about coding.' }
    ],
    stream: true
  },
  (chunk) => handler.onChunk(chunk),
  (response) => handler.onComplete(response),
  (error) => handler.onError(error)
);
```

## 📁 Project Structure

```
├── pages/                 # Next.js pages
│   ├── api/               # API routes
│   │   └── chat.ts        # Chat completion API endpoint
│   ├── _app.tsx           # App component
│   ├── index.tsx          # Home page
│   ├── chat.tsx           # Chat interface example
│   ├── tools.tsx          # Tool usage example
│   └── templates.tsx      # Prompt templates example
├── components/            # React components
│   ├── ChatInterface.tsx  # Chat UI component
│   └── ToolPanel.tsx      # Tool usage component
├── lib/                   # Utility functions
│   └── dih.ts             # DIH Framework configuration
├── styles/                # CSS styles
├── public/                # Static assets
└── .env.local             # Environment variables (create this)
```

## 🔄 Switching Models

DIH Framework supports both OpenAI and Anthropic models. To switch models:

```typescript
import { DIH, AnthropicModel } from '@tr1jeffrey/dih';

// Initialize with OpenAI (default)
const dih = new DIH({ apiKey: process.env.OPENAI_API_KEY });
await dih.init();

// Switch to Anthropic
const anthropicModel = new AnthropicModel({ 
  apiKey: process.env.ANTHROPIC_API_KEY,
  modelName: 'claude-3-opus-20240229'
});
dih.setModel(anthropicModel);
```

## 📖 Learn More

- [DIH Framework Documentation](https://github.com/jeffreylin1/dih-framework) - Learn about DIH Framework features and API
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [OpenAI Documentation](https://platform.openai.com/docs) - Learn about OpenAI's capabilities
- [Anthropic Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api) - Learn about Claude's capabilities

## 🚢 Deployment

This project can be deployed on any platform that supports Next.js applications, including:

- [Vercel](https://vercel.com/) (recommended for Next.js apps)
- [Netlify](https://www.netlify.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)

Make sure to set your environment variables in your deployment platform's dashboard.

## 📝 License

This project is MIT Licensed. 