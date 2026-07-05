import { NextResponse } from 'next/server';
import { AIBlogEngine } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const { keyword, apiKey, cluster } = await request.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const finalApiKey = apiKey || process.env.OPENAI_API_KEY;
    if (!finalApiKey) {
      return NextResponse.json({ error: 'OpenAI API Key is required' }, { status: 400 });
    }

    const engine = new AIBlogEngine(finalApiKey);
    const blogPost = await engine.generateBlog(keyword, cluster || []);

    return NextResponse.json(blogPost);
  } catch (error: any) {
    console.error('Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
