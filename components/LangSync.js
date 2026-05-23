'use client';
import { useEffect } from 'react';

export default function LangSync() {
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => {
      el.lang = el.dataset.lang === 'CN' ? 'zh-CN' : 'en';
    };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(el, { attributes: true, attributeFilter: ['data-lang'] });
    return () => obs.disconnect();
  }, []);
  return null;
}
