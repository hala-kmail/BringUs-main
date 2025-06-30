import { useEffect } from 'react';

export default function useScrollToTopOnChange(deps = []) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // eslint-disable-next-line
  }, deps);
} 