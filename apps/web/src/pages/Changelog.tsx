import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import changelogData from '../data/changelog.json';

interface ChangelogEntry {
  id: string;
  date: string;
  category: 'feature' | 'fix' | 'improvement' | 'api' | 'launch' | 'announcement';
  title: string;
  description: string;
  image?: string;
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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMonthYear(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function groupByMonth(entries: ChangelogEntry[]): Map<string, ChangelogEntry[]> {
  const grouped = new Map<string, ChangelogEntry[]>();

  entries.forEach((entry) => {
    const monthYear = formatMonthYear(entry.date);
    if (!grouped.has(monthYear)) {
      grouped.set(monthYear, []);
    }
    grouped.get(monthYear)!.push(entry);
  });

  return grouped;
}

export default function Changelog() {
  const navigate = useNavigate();
  const entries = changelogData.entries as ChangelogEntry[];

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => {
    const [yearA, monthA, dayA] = a.date.split('-').map(Number);
    const [yearB, monthB, dayB] = b.date.split('-').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB.getTime() - dateA.getTime();
  });

  const groupedEntries = groupByMonth(sortedEntries);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-sniff-bg text-sniff-text-primary">
        <div className="max-w-3xl mx-auto px-6 py-24">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-4xl font-bold mb-4">Changelog</h1>
            <p className="text-sniff-text-secondary text-lg">
              All the latest updates, improvements, and fixes to Sniff.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-12">
            {Array.from(groupedEntries.entries()).map(([monthYear, monthEntries]) => (
              <div key={monthYear}>
                {/* Month Header */}
                <div className="sticky top-0 bg-sniff-bg/95 backdrop-blur-sm py-4 mb-6 border-b border-sniff-border">
                  <h2 className="text-xl font-semibold text-sniff-text-secondary">{monthYear}</h2>
                </div>

                {/* Entries for this month */}
                <div className="space-y-6">
                  {monthEntries.map((entry) => (
                    <button
                      key={entry.id}
                      id={entry.id}
                      onClick={() => navigate(`/changelog/${entry.id}`)}
                      className="w-full text-left border border-sniff-border rounded-xl bg-sniff-surface/50 p-6 hover:border-sniff-accent-muted transition-colors cursor-pointer"
                    >
                      {/* Entry Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
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
                        </div>
                        <time className="text-sm text-sniff-text-secondary whitespace-nowrap">
                          {formatDate(entry.date)}
                        </time>
                      </div>

                      {/* Entry Content */}
                      <h3 className="text-xl font-semibold mb-2">{entry.title}</h3>
                      <p className="text-sniff-text-secondary leading-relaxed mb-4">
                        {entry.description}
                      </p>

                      {/* Optional Image */}
                      {entry.image && (
                        <div className="mt-4">
                          <img
                            src={entry.image}
                            alt={entry.title}
                            className="w-full rounded-lg border border-sniff-border"
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {entries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sniff-text-secondary">No changelog entries yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
