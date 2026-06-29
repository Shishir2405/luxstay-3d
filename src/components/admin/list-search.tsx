'use client';

import { useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';

export function ListSearch({
  onSearch,
  placeholder = 'Search…',
}: {
  onSearch: (q: string) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(q);
      }}
      className="relative mb-4 max-w-xs"
    >
      <MagnifyingGlass
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
      />
    </form>
  );
}
