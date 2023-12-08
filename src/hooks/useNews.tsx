import { useState } from 'react';

import FloatingButton from '@/components/FloatingButton';
import News from '@/components/screens/News';

export const NEWS_VERSION_KEY = 'bg1.news.version';

export default function useNews(version: number) {
  const [lastSeenVersion, setLastSeenVersion] = useState(() => {
    const v = Number(localStorage.getItem(NEWS_VERSION_KEY));
    return Number.isInteger(v) ? v : 0;
  });

  return lastSeenVersion < version ? (
    <>
      <News />
      <FloatingButton
        onClick={() => {
          localStorage.setItem(NEWS_VERSION_KEY, String(version));
          setLastSeenVersion(version);
        }}
      >
        Close
      </FloatingButton>
    </>
  ) : null;
}
