import { NextResponse } from 'next/server';
import { BloggerService } from '@/lib/blogger';

export async function POST(request: Request) {
  try {
    const { blogId, accessToken, title, content } = await request.json();

    if (!blogId || !accessToken || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const blogger = new BloggerService();
    const result = await blogger.publishPost(accessToken, blogId, { title, content });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Blogger Publish Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
