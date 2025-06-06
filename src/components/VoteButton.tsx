import React from 'react';
import { Badge } from './ui/badge';

interface VoteButtonProps {
  direction: 'up' | 'down';
  count: number;
  isActive: boolean;
  onClick: () => void;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  direction,
  count,
  isActive,
  onClick
}) => {
  const isUp = direction === 'up';
  const activeColor = isUp ? 'bg-green-100' : 'bg-red-100';
  const defaultColor = 'bg-grey';
  
  return (
    <Badge
      variant="outline"
      className={`flex items-center justify-center gap-1 px-2 py-1.5 w-full rounded-lg cursor-pointer border-0 ${
        isActive ? activeColor : defaultColor
      } max-[800px]:px-1.5 max-[800px]:py-1`}
      onClick={onClick}
    >
      <div className={`relative w-4 h-4 max-[800px]:w-3 max-[800px]:h-3 ${!isUp ? '-rotate-180' : ''}`}>
        <img
          className={`absolute w-3.5 h-3 top-0.5 left-px max-[800px]:w-2.5 max-[800px]:h-2 ${!isUp ? 'rotate-180' : ''}`}
          alt={isUp ? "Upvote" : "Downvote"}
          src={isUp ? "/polygon-1.svg" : "/polygon-1-2.svg"}
        />
      </div>
      <span className="font-body font-[number:var(--body-font-weight)] text-black text-[length:var(--body-font-size)] tracking-[var(--body-letter-spacing)] leading-[var(--body-line-height)] [font-style:var(--body-font-style)] max-[800px]:text-[calc(var(--body-font-size)*0.7)]">
        {count}
      </span>
    </Badge>
  );
};