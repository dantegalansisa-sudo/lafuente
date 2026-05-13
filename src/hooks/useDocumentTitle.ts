import { useEffect } from 'react';

const SUFFIX = ' — La Fuente Supermarket';
const DEFAULT_TITLE =
  'La Fuente Supermarket — Delivery y Pick-up en Villa Mella, Santo Domingo';

/**
 * Sets `document.title` while the component is mounted. Restores the default
 * title on unmount so navigating back to the home route still reads correctly
 * for crawlers and the browser tab.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title.endsWith(SUFFIX) ? title : `${title}${SUFFIX}`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}
