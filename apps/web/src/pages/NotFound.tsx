import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '../components/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-sniff-bg text-sniff-text-primary flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-sniff-surface rounded-full border border-sniff-border">
              <div className="relative">
                <div className="w-3 h-3 bg-sniff-accent-muted rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-sniff-accent-muted rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-mono text-sniff-text-secondary">Trail gone cold</span>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-sniff-accent to-sniff-accent-muted bg-clip-text text-transparent">
              404
            </span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Lost the scent</h2>
          <p className="text-xl text-sniff-text-secondary mb-10">
            Sniff couldn't track down this page. The trail ends here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/')}
              className="group hover:pr-10"
            >
              <span className="inline-flex items-center gap-1">
                Back to Home
                <span className="inline-block w-0 overflow-hidden transition-all duration-300 group-hover:w-4 group-hover:ml-1">
                  →
                </span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
