'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for our client component
const SpreadsheetPreview = dynamic(
  () => import('./SpreadsheetPreview'),
  { ssr: false }
);

export default function ClientSpreadsheet() {
  return <SpreadsheetPreview />;
} 