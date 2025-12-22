import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navigation from '../components/Navigation';
import { Button } from '../components/Button';
import changelogData from '../data/changelog.json';

interface ChangelogEntry {
  id: string;
  date: string;
  category: 'feature' | 'fix' | 'improvement' | 'api' | 'launch' | 'announcement';
  title: string;
  description: string;
  image?: string;
  content?: string;
  contentFile?: string;
}

const categoryConfig = {
  launch: {
    label: 'Launch',
    color:
      'bg-gradient-to-r from-sniff-accent/10 to-sniff-accent-muted/10 text-transparent bg-clip-text',
    badgeColor:
      'border-sniff-accent/30 bg-gradient-to-r from-sniff-accent/10 to-sniff-accent-muted/10',
    textColor:
      'bg-gradient-to-r from-sniff-accent to-sniff-accent-muted bg-clip-text text-transparent',
  },
  announcement: {
    label: 'Announcement',
    color:
      'bg-gradient-to-r from-sniff-accent/10 to-sniff-accent-hover/10 text-transparent bg-clip-text',
    badgeColor:
      'border-sniff-accent/30 bg-gradient-to-r from-sniff-accent/10 to-sniff-accent-hover/10',
    textColor:
      'bg-gradient-to-r from-sniff-accent to-sniff-accent-hover bg-clip-text text-transparent',
  },
  feature: {
    label: 'Feature',
    color: 'bg-sniff-accent/10 text-sniff-accent border-sniff-accent/20',
  },
  fix: {
    label: 'Fix',
    color: 'bg-sniff-success/10 text-sniff-success border-sniff-success/20',
  },
  improvement: {
    label: 'Improvement',
    color: 'bg-sniff-accent-muted/10 text-sniff-accent-muted border-sniff-accent-muted/20',
  },
  api: {
    label: 'API',
    color: 'bg-sniff-accent-hover/10 text-sniff-accent-hover border-sniff-accent-hover/20',
  },
};

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ChangelogPost() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const entries = changelogData.entries as ChangelogEntry[];
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const entry = entries.find((e) => e.id === id);

  useEffect(() => {
    if (entry?.contentFile) {
      setIsLoading(true);
      fetch(entry.contentFile)
        .then((response) => response.text())
        .then((text) => {
          setMarkdownContent(text);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error loading markdown:', error);
          setIsLoading(false);
        });
    }
  }, [entry?.contentFile]);

  if (!entry) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-sniff-bg text-sniff-text-primary">
          <div className="max-w-3xl mx-auto px-6 py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Post not found</h1>
              <p className="text-sniff-text-secondary mb-8">
                The changelog entry you're looking for doesn't exist.
              </p>
              <Button variant="primary" size="md" onClick={() => navigate('/changelog')}>
                Back to Changelog
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-sniff-bg text-sniff-text-primary">
        <div className="max-w-3xl mx-auto px-6 py-24">
          {/* Back Button */}
          <button
            onClick={() => navigate('/changelog')}
            className="inline-flex items-center gap-2 text-sniff-text-secondary hover:text-sniff-accent transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Changelog
          </button>

          {/* Post Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {entry.category === 'launch' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border border-sniff-accent/30 bg-gradient-to-r from-sniff-accent/10 to-sniff-accent-muted/10">
                  <span className="bg-gradient-to-r from-sniff-accent to-sniff-accent-muted bg-clip-text text-transparent">
                    {categoryConfig[entry.category].label}
                  </span>
                </span>
              ) : entry.category === 'announcement' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border border-sniff-accent/30 bg-gradient-to-r from-sniff-accent/10 to-sniff-accent-hover/10">
                  <span className="bg-gradient-to-r from-sniff-accent to-sniff-accent-hover bg-clip-text text-transparent">
                    {categoryConfig[entry.category].label}
                  </span>
                </span>
              ) : (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${
                    categoryConfig[entry.category].color
                  }`}
                >
                  {categoryConfig[entry.category].label}
                </span>
              )}
              <time className="text-sm text-sniff-text-secondary">{formatDate(entry.date)}</time>
            </div>
            <h1 className="text-4xl font-bold mb-4">{entry.title}</h1>
            <p className="text-xl text-sniff-text-secondary leading-relaxed">{entry.description}</p>
          </div>

          {/* Featured Image */}
          {entry.image && (
            <div className="mb-8">
              <img
                src={entry.image}
                alt={entry.title}
                className="w-full rounded-xl border border-sniff-border"
              />
            </div>
          )}

          {/* Detailed Content */}
          {isLoading && (
            <div className="border border-sniff-border rounded-xl bg-sniff-surface/50 p-6">
              <p className="text-sniff-text-secondary leading-relaxed">Loading content...</p>
            </div>
          )}

          {!isLoading && markdownContent && (
            <div className="prose prose-invert max-w-none">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-sniff-text-primary">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold mt-6 mb-3 text-sniff-text-primary">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-sniff-text-secondary leading-relaxed mb-4">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 mb-4 text-sniff-text-secondary">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-sniff-text-secondary leading-relaxed">{children}</li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sniff-accent hover:text-sniff-accent-hover underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {markdownContent}
              </Markdown>
            </div>
          )}

          {!isLoading && !markdownContent && entry.content && (
            <div className="prose prose-invert max-w-none">
              <div className="text-sniff-text-secondary leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </div>
            </div>
          )}

          {/* Default Content if no detailed content */}
          {!isLoading && !markdownContent && !entry.content && (
            <div className="border border-sniff-border rounded-xl bg-sniff-surface/50 p-6">
              <p className="text-sniff-text-secondary leading-relaxed">
                This changelog entry doesn't have additional details yet. Check back later for more
                information.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
