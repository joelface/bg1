import { useState } from 'react';

import FloatingButton from '@/components/FloatingButton';
import News from '@/components/screens/News';
import kvdb from '@/kvdb';

export const NEWS_VERSION_KEY = ['bg1', 'news', 'version'];

export default function useNews(version: number) {
  const [lastSeenVersion, setLastSeenVersion] = useState(() => {
    const v = Number(kvdb.get(NEWS_VERSION_KEY));
    return Number.isInteger(v) ? v : 0;
  });

  return lastSeenVersion < version ? (
    <>
      <News />
      <FloatingButton
        onClick={() => {
          kvdb.set<number>(NEWS_VERSION_KEY, version);
          setLastSeenVersion(version);
        }}
      >
        Close
      </FloatingButton>
    </>
  ) : null;
}
