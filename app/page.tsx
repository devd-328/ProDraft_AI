'use client';

import { useState } from 'react';
import { Sparkles, Copy, RefreshCw, Send, FileText, Mail, Share2, AlignLeft } from 'lucide-react';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [format, setFormat] = useState('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setOutputText(''); // Clear previous output
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, format }),
      });

      const data = await response.json();
      if (response.ok) {
        setOutputText(data.output);
      } else {
        console.error(data.error);
        setOutputText('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Request failed', error);
      setOutputText('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const options = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'social', label: 'Social Post', icon: Share2 },
    { id: 'report', label: 'Report', icon: FileText },
    { id: 'summary', label: 'Summary', icon: AlignLeft },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">ProDraft AI</h1>
          </div>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            v1.0 MVP
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Input</h2>
              <p className="text-gray-500 mb-4">Paste your rough notes, drafts, or ideas here.</p>
              <textarea
                className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none text-base outline-none shadow-sm"
                placeholder="e.g., met with client, they want changes to the logo, need to send update by friday..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Choose Output Format</label>
              <div className="grid grid-cols-2 gap-3">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormat(opt.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                      format === opt.id
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <opt.icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !inputText.trim()}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Polishing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Polish
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
             <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Result</h2>
                    <p className="text-gray-500">Your AI-polished content.</p>
                </div>
                {outputText && (
                    <button 
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                        {isCopied ? <span className="text-green-600">Copied!</span> : <><Copy className="w-4 h-4" /> Copy</>}
                    </button>
                )}
             </div>
            
            <div className={`w-full h-[500px] md:h-[calc(100%-5rem)] p-6 rounded-xl border border-gray-200 bg-white overflow-y-auto relative shadow-sm ${!outputText && 'flex items-center justify-center'}`}>
                {outputText ? (
                    <div className="prose prose-indigo max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {outputText}
                    </div>
                ) : (
                    <div className="text-center text-gray-400">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Generated content will appear here.</p>
                    </div>
                )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}