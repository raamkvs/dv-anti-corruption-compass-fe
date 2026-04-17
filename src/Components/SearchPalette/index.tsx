import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Modal } from '@undp/design-system-react/Modal';
import { BarChart2, FileText, Globe2, Hash, Search } from 'lucide-react';

import { useSearchItems } from './useSearchItems';
import { searchItems } from './searchUtils';
import { SearchItem, SearchItemCategory } from './types';

const CATEGORY_ICONS: Record<
  SearchItemCategory,
  React.ComponentType<{ size?: number; color?: string }>
> = {
  page: FileText,
  indicator: BarChart2,
  'sub-indicator': Hash,
  country: Globe2,
};

const CATEGORY_BADGE_LABELS: Record<SearchItemCategory, string> = {
  page: 'Page',
  indicator: 'Indicator',
  'sub-indicator': 'Sub-indicator',
  country: 'Country',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

function buildUrl(item: SearchItem): string {
  if (item.category === 'country') {
    return `/countries/${item.params?.isoCode ?? ''}`;
  }
  if (item.category === 'indicator' || item.category === 'sub-indicator') {
    return `/main-indicators/${item.params?.indicator ?? ''}`;
  }
  return item.to;
}

export function SearchPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const allItems = useSearchItems();
  const groups = searchItems(allItems, query);
  const flatResults = groups.flatMap(g => g.items);

  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlightedIndex(0);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const navigateToItem = useCallback(
    (item: SearchItem) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigate({ to: buildUrl(item) as any });
      onClose();
    },
    [navigate, onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(i =>
          flatResults.length ? (i + 1) % flatResults.length : 0,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(i =>
          flatResults.length
            ? (i - 1 + flatResults.length) % flatResults.length
            : 0,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = flatResults[highlightedIndex];
        if (target) navigateToItem(target);
      }
    },
    [flatResults, highlightedIndex, navigateToItem],
  );

  return (
    <Modal
      open={open}
      overlayClassName='modal-overlay'
      onClose={onClose}
      showCloseButton={false}
      className='!bg-[#17232B] !border-0 !rounded-[8px] !shadow-[0_5px_60px_0_rgba(0,0,0,0.40)] !p-4 !w-full !max-w-[600px]'
    >
      <div>
        <div className='relative w-full'>
          <Search
            size={16}
            className='absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 z-[1]'
            color='#fff'
            aria-hidden
          />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Search pages, countries, indicators…'
            className='bg-[#ffffff12] rounded-full py-3 pl-10 pr-4 border border-[#ffffff20] text-[var(--color-text-white)] placeholder:text-white placeholder:opacity-40 poppins-regular !text-[14px] w-full outline-none focus:border-[#4B6E91] transition-colors'
          />
        </div>

        {query.trim() && (
          <div className='mt-3 max-h-[420px] overflow-y-auto flex flex-col gap-1'>
            {groups.length === 0 ? (
              <p className='poppins-regular !text-[14px] text-[var(--color-text-white)] opacity-50 text-center px-3 py-8'>
                No results for &ldquo;{query}&rdquo;
              </p>
            ) : (
              groups.map(group => (
                <div key={group.category}>
                  <p className='px-3 py-2 poppins-semibold !text-[11px] text-[var(--color-text-white)] opacity-40 uppercase tracking-widest'>
                    {group.label}
                  </p>
                  {group.items.map(item => {
                    const isHighlighted =
                      flatResults[highlightedIndex]?.id === item.id;
                    const Icon = CATEGORY_ICONS[item.category];
                    return (
                      <button
                        key={item.id}
                        type='button'
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-[6px] cursor-pointer transition-colors text-left ${
                          isHighlighted
                            ? 'bg-[#4B6E91]'
                            : 'hover:bg-[#ffffff0a]'
                        }`}
                        onClick={() => navigateToItem(item)}
                        onMouseEnter={() => {
                          const idx = flatResults.findIndex(
                            r => r.id === item.id,
                          );
                          if (idx !== -1) setHighlightedIndex(idx);
                        }}
                      >
                        <div className='w-8 h-8 rounded-full bg-[#ffffff12] flex items-center justify-center flex-shrink-0'>
                          <Icon size={14} color='#fff' />
                        </div>
                        <div className='flex flex-col gap-0.5 min-w-0 flex-1'>
                          <span className='poppins-medium !text-[14px] text-[var(--color-text-white)] truncate block'>
                            {item.label}
                          </span>
                          {item.description && (
                            <span className='poppins-regular !text-[12px] text-[var(--color-text-white)] opacity-50 truncate block'>
                              {item.description}
                            </span>
                          )}
                        </div>
                        <span className='ml-auto flex-shrink-0 bg-[#FFFFFF1F] rounded-[4px] px-2 py-0.5 poppins-medium !text-[11px] text-[var(--color-text-white)]'>
                          {CATEGORY_BADGE_LABELS[item.category]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        )}

        <div className='border-t border-[#ffffff10] mt-3 pt-3 px-3 flex items-center gap-6'>
          <span className='poppins-regular !text-[11px] text-[var(--color-text-white)] opacity-30'>
            ↑↓ Navigate
          </span>
          <span className='poppins-regular !text-[11px] text-[var(--color-text-white)] opacity-30'>
            ↵ Open
          </span>
          <span className='poppins-regular !text-[11px] text-[var(--color-text-white)] opacity-30'>
            Esc Close
          </span>
        </div>
      </div>
    </Modal>
  );
}
