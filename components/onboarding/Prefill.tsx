'use client';
// Fills empty sign-up fields with what the visitor typed in "Create your account" on the homepage.
import { useEffect } from 'react';

export function Prefill({ fields }: { fields: Record<string, 'name' | 'email'> }) {
  useEffect(() => {
    let saved: { name?: string; email?: string } = {};
    try { saved = JSON.parse(sessionStorage.getItem('bayse_signup') || '{}'); } catch { return; }
    for (const [id, key] of Object.entries(fields)) {
      const el = document.getElementById(id) as HTMLInputElement | null;
      const v = saved[key];
      if (el && !el.value && v) el.value = v;
    }
  }, [fields]);
  return null;
}
