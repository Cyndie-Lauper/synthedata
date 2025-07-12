## Cynthedata

[](https://www.google.com/search?q=https://www.npmjs.com/package/%40cyndie/synthedata)
[](https://opensource.org/licenses/MIT)

A powerful TypeScript library for generating realistic, context-aware fake data for your applications. It leverages the power of Google's Gemini AI and the robustness of Zod schemas to create mock data that respects your data model's types, constraints, and even relationships.

### ✨ Key Features

  - **🤖 AI-Powered:** Uses Google's Gemini Pro to generate realistic and contextually relevant data (e.g., a plausible product name for an e-commerce store).
  - **🔒 Zod Integration:** Defines data structure and validation using Zod, the standard for modern TypeScript data validation.
  - **🔗 Relationship-Aware:** Automatically handles basic foreign key relationships between your models.
  - **✅ Constraint-Aware:** Smartly analyzes your Zod schema to respect constraints like `.min()`, `.max()`, `.email()`, and `.enum()`.
  - **⚡️ Batch Processing:** Efficiently create any number of data records with a single asynchronous call.
  - **🧩 Modular & Extensible:** Built with a modular AI provider system, making it easy to adapt to other AI services in the future.

### 📦 Installation

Install the package using npm or your favorite package manager:

```bash
npm i @cyndie/synthedata
```


### 🔑 Setup: Gemini API Key

Before using the library, you need a Google Gemini API key.

1.  Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

2.  Set it as an environment variable. The library will automatically detect it.

    **On macOS/Linux:**

    ```bash
    export GOOGLE_API_KEY="YOUR_API_KEY_HERE"
    ```

    **On Windows (Command Prompt):**

    ```bash
    set GOOGLE_API_KEY="YOUR_API_KEY_HERE"
    ```

    Alternatively, you can pass the key directly to the `GeminiProvider` constructor.

### 🚀 Getting Started

Here's how to generate fake data in just a few steps:

```typescript
import { z } from 'zod';
// Import from the library you installed
import { FakedataGenerator, GeminiProvider } from '@cyndie/synthedata';

// 1. Define your data models using Zod schemas
const UserSchema = z.object({
    id: z.number(),
    fullName: z.string().min(5, "Full name must be at least 5 characters long"),
    email: z.string().email(),
    role: z.enum(['admin', 'editor', 'viewer'])
});

const PostSchema = z.object({
    id: z.number(),
    title: z.string().max(60, "Title cannot exceed 60 characters"),
    content: z.string(),
    // Use .describe() to specify the parent model for foreign key relationships
    userId: z.number().describe('UserSchema'),
});

// Define an async function to run the generator
async function generateMockData() {
    try {
        // 2. Instantiate the generator with an AI provider
        const generator = new FakedataGenerator(new GeminiProvider());

        // 3. (Optional) Provide a general context to make the data more specific
        const context = { topic: "the future of renewable energy" };

        // 4. Generate data!
        // First, generate users. The library caches this data for relationship handling.
        console.log("--- Generating Users ---");
        const users = await generator.generate(UserSchema, 3, context);
        console.log(users);

        // Now, generate posts. The `userId` will automatically be populated
        // with IDs from the users created above.
        console.log("\n--- Generating Posts ---");
        const posts = await generator.generate(PostSchema, 5, context);
        console.log(posts);

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

// Run the main function
generateMockData();
```

### API Reference

#### `FakedataGenerator`

The main class for generating data.

##### `new FakedataGenerator(provider: AIProvider)`

Creates a new generator instance. It requires an AI provider that conforms to the `AIProvider` interface.

#### `GeminiProvider`

The default provider for using the Google Gemini API.

##### `new GeminiProvider(apiKey?: string)`

Creates a new Gemini provider. If `apiKey` is not provided, it falls back to the `GOOGLE_API_KEY` environment variable.

##### `generator.generate<T>(schema: T, count: number, context?: object)`

The core method for generating data.

  - `schema`: A Zod schema (`z.ZodObject`) that defines the structure of the data.
  - `count`: The number of records to generate.
  - `context` (optional): An object providing general context to the AI, which helps in generating more relevant data.
  - **Returns**: A `Promise` that resolves to an array of generated data objects.

### 🤝 Contributing

Contributions are welcome\! If you find a bug or have a feature request, please open an issue. If you'd like to contribute code, please feel free to fork the repository and submit a pull request.

### 📜 License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.
