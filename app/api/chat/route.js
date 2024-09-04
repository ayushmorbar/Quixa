import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with custom configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // Ensure to set this environment variable
  defaultHeaders: {
    "HTTP-Referer": process.env.YOUR_SITE_URL, // Optional, for including your app on openrouter.ai rankings
    "X-Title": process.env.YOUR_SITE_NAME, // Optional, shows in rankings on openrouter.ai
  }
});

// Define the system prompt
const systemPrompt = "Your system prompt here";

// Handle POST request
export async function POST(req) {
  try {
    const data = await req.json();

    // Create chat completion request
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free", // Model can be switched here
      messages: [
        { role: 'system', content: systemPrompt },
        ...data,
      ],
      stream: true,
    });

    // Create a readable stream to handle the response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const text = encoder.encode(content);
              controller.enqueue(text);
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    // Return the response as a stream
    return new NextResponse(stream);

  } catch (error) {
    // Handle errors appropriately
    if (error.code === 'insufficient_quota') {
      return new NextResponse('Quota exceeded. Please check your plan and billing details.', { status: 429 });
    } else {
      return new NextResponse('An error occurred. Please try again later.', { status: 500 });
    }
  }
}