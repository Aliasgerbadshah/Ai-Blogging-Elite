import { NextResponse } from 'next/server';
import { AIBlogEngine } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const { keyword, apiKey } = await request.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const finalApiKey = apiKey || process.env.OPENAI_API_KEY;
    if (!finalApiKey) {
      return NextResponse.json({ error: 'OpenAI API Key is required' }, { status: 400 });
    }

    const engine = new AIBlogEngine(finalApiKey);
    const topics = await engine.generateTopicCluster(keyword);

    return NextResponse.json({ topics });
  } catch (error: any) {
    console.error('Cluster Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
