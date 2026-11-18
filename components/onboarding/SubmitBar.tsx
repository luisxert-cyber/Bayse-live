'use client';
import { useFormStatus } from 'react-dom';
import { buttonClass } from '@/components/ui/Button';

/** Sticky bottom actions. "Skip" submits the same form with skip=1 so the server records the skip. */
export function SubmitBar({ label = 'Continue', skippable = false, skipLabel = 'Skip for now' }: { label?: string; skippable?: boolean; skipLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-0 -mx-4 mt-8 border-t border-stone/70 bg-bg/95 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
      <button type="submit" disabled={pending} className={buttonClass('primary', true)}>{pending ? 'Saving…' : label}</button>
      {skippable && (
        <button type="submit" name="skip" value="1" formNoValidate disabled={pending} className="mt-2 block w-full py-2 text-center text-sm text-muted hover:text-ink">
          {skipLabel}
        </button>
      )}
    </div>
  );
}
