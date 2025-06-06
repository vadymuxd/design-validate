import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { VoteButton } from './VoteButton';
import { Tool, Category } from '../types/Tool';

interface ToolCardProps {
  tool: Tool;
  category: Category;
  voteCounts: { up: number; down: number };
  userVote: 'up' | 'down' | null;
  netScore: number;
  onVote: (direction: 'up' | 'down') => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  voteCounts,
  userVote,
  netScore,
  onVote
}) => {
  return (
    <Card className="w-full bg-white rounded-2xl">
      <CardContent className="flex items-center justify-center gap-6 p-8 max-[800px]:p-4 max-[800px]:gap-3 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-4">
        <div className="flex items-center gap-4 max-[480px]:w-full">
          <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0 max-[800px]:w-[42px] max-[800px]:h-[42px]">
            <img
              className="w-full h-full object-cover"
              alt={`${tool.name} Logo`}
              src={tool.logo}
            />
          </div>

          <div className="hidden max-[480px]:flex items-center gap-3 flex-1">
            <h3 className="font-h3 font-[number:var(--h3-font-weight)] text-black text-[length:var(--h3-font-size)] tracking-[var(--h3-letter-spacing)] leading-[var(--h3-line-height)] [font-style:var(--h3-font-style)] max-[800px]:text-[calc(var(--h3-font-size)*0.7)]">
              <a
                href={tool.url}
                rel="noopener noreferrer"
                target="_blank"
                className="hover:underline"
              >
                {tool.name}
              </a>
            </h3>
            {netScore !== 0 && (
              <Badge 
                variant="outline" 
                className={`text-xs max-[800px]:text-[10px] ${
                  netScore > 0 ? 'bg-green-50 text-green-700 border-green-200' : 
                  'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {netScore > 0 ? '+' : ''}{netScore}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 flex-1">
          <div className="flex items-center gap-3 max-[480px]:hidden">
            <h3 className="font-h3 font-[number:var(--h3-font-weight)] text-black text-[length:var(--h3-font-size)] tracking-[var(--h3-letter-spacing)] leading-[var(--h3-line-height)] [font-style:var(--h3-font-style)] max-[800px]:text-[calc(var(--h3-font-size)*0.7)]">
              <a
                href={tool.url}
                rel="noopener noreferrer"
                target="_blank"
                className="hover:underline"
              >
                {tool.name}
              </a>
            </h3>
            {netScore !== 0 && (
              <Badge 
                variant="outline" 
                className={`text-xs max-[800px]:text-[10px] ${
                  netScore > 0 ? 'bg-green-50 text-green-700 border-green-200' : 
                  'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {netScore > 0 ? '+' : ''}{netScore}
              </Badge>
            )}
          </div>

          <p className="self-stretch font-body font-[number:var(--body-font-weight)] text-black text-[length:var(--body-font-size)] tracking-[var(--body-letter-spacing)] leading-[var(--body-line-height)] [font-style:var(--body-font-style)] max-[800px]:text-[calc(var(--body-font-size)*0.7)]">
            {tool.description}
          </p>
        </div>

        <div className="flex flex-col w-[67px] items-start gap-2 max-[800px]:w-[47px] max-[480px]:hidden">
          <VoteButton
            direction="up"
            count={voteCounts.up}
            isActive={userVote === 'up'}
            onClick={() => onVote('up')}
          />
          <VoteButton
            direction="down"
            count={voteCounts.down}
            isActive={userVote === 'down'}
            onClick={() => onVote('down')}
          />
        </div>

        <div className="hidden max-[480px]:flex w-full gap-4">
          <div className="flex-1">
            <VoteButton
              direction="up"
              count={voteCounts.up}
              isActive={userVote === 'up'}
              onClick={() => onVote('up')}
            />
          </div>
          <div className="flex-1">
            <VoteButton
              direction="down"
              count={voteCounts.down}
              isActive={userVote === 'down'}
              onClick={() => onVote('down')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};