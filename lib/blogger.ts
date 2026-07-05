export class BloggerService {
  private baseUrl = 'https://www.googleapis.com/blogger/v3';

  async publishPost(accessToken: string, blogId: string, postData: { title: string, content: string }) {
    const url = `${this.baseUrl}/blogs/${blogId}/posts/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kind: 'blogger#post',
        blog: {
          id: blogId,
        },
        title: postData.title,
        content: postData.content,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to publish to Blogger');
    }

    return await response.json();
  }
}
