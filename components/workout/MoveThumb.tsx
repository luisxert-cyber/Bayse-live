// Small picture of a move: a still from its demo clip when there is one, otherwise the drawing.
import { FigureStill } from './Figure';
import { previewPoster } from '@/lib/workouts/preview-clips';

export function MoveThumb({ move, t = 0.7, className = '' }: { move: string; t?: number; className?: string }) {
  const poster = previewPoster(move);
  if (poster) return <img src={poster} alt="" loading="lazy" className={`aspect-[16/10] w-full object-cover ${className}`} />;
  return <FigureStill move={move} t={t} className={className} />;
}
