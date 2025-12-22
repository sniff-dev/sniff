import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import Changelog from './pages/Changelog';
import ChangelogPost from './pages/ChangelogPost';
import NotFound from './pages/NotFound';

function ExternalRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/changelog/:id" element={<ChangelogPost />} />
        <Route path="/docs" element={<ExternalRedirect url="https://docs.sniff.to" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
