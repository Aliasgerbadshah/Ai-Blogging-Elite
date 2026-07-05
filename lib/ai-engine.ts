import OpenAI from 'openai';

export interface Topic {
  title: string;
  intent: string; // e.g., "Informational", "Commercial"
  priority: 'High' | 'Medium' | 'Low';
}

export interface ImageAsset {
  url: string;
  altText: string;
}

export interface BlogPost {
  title: string;
  outline: string[];
  content: string;
  metaDescription: string;
  keywords: string[];
  featuredImage: ImageAsset;
  internalLinkSuggestions: string[];
}

export class AIBlogEngine {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  // NEW: Generate a cluster of related topics to build authority
  async generateTopicCluster(keyword: string): Promise<Topic[]> {
    const prompt = `You are a master SEO strategist. For the seed keyword "${keyword}", create a content cluster of 5 related blog post topics.
    For each topic, provide:
    1. A catchy, SEO-optimized title.
    2. The search intent (Informational, Transactional, or Navigational).
    3. Priority level (High, Medium, Low).
    
    Return the response as a JSON array of objects: [{"title": "...", "intent": "...", "priority": "..."}]`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: 'Return ONLY valid JSON.' }, { role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const data = JSON.parse(response.choices[0].message.content || '{}');
    return (data as any).topics || Object.values(data).flat() as Topic[];
  }

  async generateBlog(keyword: string, cluster: Topic[] = []): Promise<BlogPost> {
    // 1. Generate Title
    const title = await this.generateTitle(keyword);

    // 2. Generate a Visual Prompt for DALL-E 3
    const imagePrompt = await this.generateImagePrompt(title);
    const featuredImage = await this.generateImage(imagePrompt);

    // 3. Generate Outline
    const outline = await this.generateOutline(title);

    // 4. Generate Content with Internal Linking
    const content = await this.generateContent(title, outline, cluster);

    // 5. SEO Optimization
    const { metaDescription, keywords } = await this.optimizeSEO(content);

    return {
      title,
      outline,
      content,
      metaDescription,
      keywords,
      featuredImage,
      internalLinkSuggestions: cluster.map(t => t.title),
    };
  }

  private async generateTitle(keyword: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: `Create a high-CTR SEO title for: ${keyword}. Return ONLY the title.` }],
    });
    return response.choices[0].message.content?.trim() || 'Untitled';
  }

  private async generateImagePrompt(title: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: `Create a highly detailed DALL-E 3 prompt for a professional blog featured image for the title: "${title}". The style should be modern, clean, and high-resolution. Avoid text in the image.` }],
    });
    return response.choices[0].message.content?.trim() || 'Professional blog image';
  }

  private async generateImage(prompt: string): Promise<ImageAsset> {
    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      });
      const url = response.data[0].url;
      return {
        url: url,
        altText: `Professional illustration for ${prompt.substring(0, 50)}...`,
      };
    } catch (e) {
      console.error('Image Gen Error:', e);
      return { url: 'https://via.placeholder.com/1024', altText: 'Default image' };
    }
  }

  private async generateOutline(title: string): Promise<string[]> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: `Create a detailed outline for: ${title}. Format as a numbered list.` }],
    });
    return (response.choices[0].message.content || '').split('\n').filter(l => l.trim());
  }

  private async generateContent(title: string, outline: string[], cluster: Topic[]): Promise<string> {
    const clusterTitles = cluster.map(t => t.title).join(', ');
    const prompt = `Write a professional, high-quality blog post.
    Title: ${title}
    Outline: ${outline.join('\n')}
    Related Cluster Topics (for internal linking): ${clusterTitles}
    
    Requirements:
    - Use HTML tags (<h2>, <h3>, <p>, <ul>, <li>, <strong>).
    - Naturally integrate internal links to the related topics mentioned above using <a href="#">link text</a>.
    - Write in a human-like, authoritative tone.
    - Avoid AI clichés.
    - Include a strong CTA in the conclusion.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content || '';
  }

  private async optimizeSEO(content: string): Promise<{ metaDescription: string, keywords: string[] }> {
    const prompt = `Analyze the content and provide:
    Meta: [max 160 chars]
    Keywords: [comma separated list]
    
    Content: ${content.substring(0, 4000)}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.choices[0].message.content || '';
    const metaMatch = text.match(/Meta: (.*)/);
    const keywordsMatch = text.match(/Keywords: (.*)/);
    return {
      metaDescription: metaMatch ? metaMatch[1].trim() : '',
      keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [],
    };
  }
}
