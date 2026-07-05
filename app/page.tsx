'use client';

import React, { useState } from 'react';
import { Sparkles, Send, FileText, Search, Loader2, Globe, CheckCircle, LayoutGrid, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [blogId, setBlogId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cluster, setCluster] = useState<any[]>([]);
  const [isGeneratingCluster, setIsGeneratingCluster] = useState(false);

  const handleGenerateCluster = async () => {
    if (!keyword || !apiKey) {
      alert('Please enter both a keyword and your OpenAI API key.');
      return;
    }
    setIsGeneratingCluster(true);
    try {
      const response = await fetch('/api/generate-cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, apiKey }),
      });
      const data = await response.json();
      if (response.ok) setCluster(data.topics);
      else alert(`Error: ${data.error}`);
    } catch (err) {
      alert('Error generating cluster.');
    } finally {
      setIsGeneratingCluster(false);
    }
  };

  const handleGeneratePost = async (targetTitle?: string) => {
    const finalTitle = targetTitle || keyword;
    if (!apiKey) {
      alert('Please enter your OpenAI API key.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: finalTitle, apiKey, cluster }),
      });

      const data = await response.json();
      if (response.ok) setResult(data);
      else alert(`Error: ${data.error}`);
    } catch (err) {
      alert('An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!blogId || !accessToken || !result) {
      alert('Please enter Blog ID, Access Token, and generate a post first.');
      return;
    }
    setPublishing(true);
    try {
      const response = await fetch('/api/blogger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId,
          accessToken,
          title: result.title,
          content: `<img src="${result.featuredImage.url}" alt="${result.featuredImage.altText}" style="width:100%; height:auto;"><br>${result.content}`,
        }),
      });
      if (response.ok) alert('🚀 Successfully published to Blogger!');
      else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('An error occurred while publishing.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-3 mb-12">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI AutoBlogger <span className="text-indigo-600">Elite</span></h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Config */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" /> AI Config</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">OpenAI API Key</label>
                  <input type="password" placeholder="sk-..." className="w-full p-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-600" /> Blogger Config</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Blog ID</label>
                  <input type="text" placeholder="Blog ID" className="w-full p-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={blogId} onChange={(e) => setBlogId(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Access Token</label>
                  <input type="password" placeholder="ya29..." className="w-full p-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-2"><Search className="w-4 h-4" /> Seed Keyword for Authority Cluster</label>
              <div className="flex gap-2">
                <input type="text" placeholder="e.g. Artificial Intelligence in Healthcare" className="flex-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                <button onClick={handleGenerateCluster} disabled={isGeneratingCluster} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50">
                  {isGeneratingCluster ? <Loader2 className="w-5 h-5 animate-spin" /> : <LayoutGrid className="w-5 h-5" />}
                  Plan Cluster
                </button>
              </div>
            </div>

            {/* Topic Cluster Display */}
            {cluster.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
                {cluster.map((topic, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center hover:border-indigo-300 transition-all group">
                    <div>
                      <h4 className="font-bold text-slate-800">{topic.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${topic.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{topic.priority} Priority</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-600 ml-1">{topic.intent}</span>
                    </div>
                    <button onClick={() => handleGeneratePost(topic.title)} disabled={loading} className="bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white p-2 rounded-lg transition-all">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Result Section */}
            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-bold pr-12">{result.title}</h2>
                    <button onClick={handlePublish} disabled={publishing} className="absolute top-8 right-8 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-4 rounded-full transition-all flex items-center gap-2 disabled:opacity-50">
                      {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Publish to Blogger
                    </button>
                  </div>
                  
                  <div className="mb-6 rounded-xl overflow-hidden border border-slate-100">
                    <img src={result.featuredImage.url} alt={result.featuredImage.altText} className="w-full h-auto max-h-[400px] object-cover" />
                    <p className="text-xs text-slate-400 p-2 italic">AI Generated Featured Image: {result.featuredImage.altText}</p>
                  </div>

                  <div className="prose max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: result.content }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                    <h3 className="text-indigo-900 font-bold mb-2">SEO Meta Description</h3>
                    <p className="text-indigo-800 text-sm italic">{result.metaDescription}</p>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <h3 className="text-emerald-900 font-bold mb-2">Target Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((kw: string, i: number) => (
                        <span key={i} className="bg-white px-3 py-1 rounded-full text-xs font-medium text-emerald-700 border border-emerald-200">{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <h3 className="text-amber-900 font-bold mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Image Alt-Text</h3>
                    <p className="text-amber-800 text-sm italic">{result.featuredImage.altText}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
