import React, { useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { ToolCard } from "../../components/ToolCard";
import { useVoting } from "../../hooks/useVoting";
import { usabilityTestingTools, eventTrackingTools, sessionReplayTools } from "../../data/tools";
import { Category } from "../../types/Tool";

export const ToolsGallery = (): JSX.Element => {
  const { vote, getVoteCount, getUserVote, getNetScore } = useVoting();
  const [activeCategory, setActiveCategory] = useState<Category>('usability-testing');

  // Get current tools based on active category
  const currentTools = useMemo(() => {
    switch (activeCategory) {
      case 'usability-testing':
        return usabilityTestingTools;
      case 'event-tracking':
        return eventTrackingTools;
      case 'session-replay':
        return sessionReplayTools;
      default:
        return [];
    }
  }, [activeCategory]);

  // Sort tools by net score (upvotes - downvotes) in descending order
  const sortedTools = useMemo(() => {
    return [...currentTools].sort((a, b) => {
      const scoreA = getNetScore(activeCategory, a.name);
      const scoreB = getNetScore(activeCategory, b.name);
      return scoreB - scoreA; // Highest score first
    });
  }, [currentTools, getNetScore, activeCategory]);

  // Categories data
  const categories = [
    { name: "Usability Testing", key: 'usability-testing' as Category, active: activeCategory === 'usability-testing' },
    { name: "Event Tracking", key: 'event-tracking' as Category, active: activeCategory === 'event-tracking' },
    { name: "Session Replay", key: 'session-replay' as Category, active: activeCategory === 'session-replay' },
  ];

  const handleVote = (toolName: string, direction: 'up' | 'down') => {
    vote(activeCategory, toolName, direction);
  };

  const handleCategoryChange = (categoryKey: Category) => {
    setActiveCategory(categoryKey);
  };

  return (
    <div className="bg-[#000000] flex flex-row justify-center w-full">
      <div className="bg-black w-full max-w-[1728px] min-h-[1117px]">
        <div className="flex flex-col items-center justify-center gap-10 pt-[214px] px-6 max-[480px]:px-4 md:px-0">
          {/* Logo and Title */}
          <div className="flex flex-col w-full max-w-[317px] items-center gap-4">
            <div className="w-[60px] h-[60px] rounded-[30px] [background:linear-gradient(180deg,rgba(255,54,84,1)_0%,rgba(0,0,0,1)_100%)]" />
            <h1 className="font-h1 font-[number:var(--h1-font-weight)] text-white text-[length:var(--h1-font-size)] tracking-[var(--h1-letter-spacing)] leading-[var(--h1-line-height)] [font-style:var(--h1-font-style)] max-[800px]:text-[calc(var(--h1-font-size)*0.7)]">
              Design. Validate
            </h1>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full px-6 max-[480px]:px-0">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={category.active ? "default" : "outline"}
                className={`rounded-[36px] ${
                  category.active
                    ? "bg-white text-black"
                    : "bg-transparent text-white border border-solid border-white"
                } max-[800px]:text-[calc(var(--label-font-size)*0.7)]`}
                onClick={() => handleCategoryChange(category.key)}
              >
                <span className="font-label font-[number:var(--label-font-weight)] text-[length:var(--label-font-size)] tracking-[var(--label-letter-spacing)] leading-[var(--label-line-height)] [font-style:var(--label-font-style)]">
                  {category.name}
                </span>
              </Button>
            ))}
          </div>

          {/* Tool Cards */}
          <div className="flex flex-col w-full max-w-[730px] items-start gap-2 px-6 max-[800px]:px-6">
            {sortedTools.map((tool) => {
              const voteCounts = getVoteCount(activeCategory, tool.name);
              const userVote = getUserVote(activeCategory, tool.name);
              const netScore = getNetScore(activeCategory, tool.name);
              
              return (
                <ToolCard
                  key={`${activeCategory}-${tool.name}`}
                  tool={tool}
                  category={activeCategory}
                  voteCounts={voteCounts}
                  userVote={userVote}
                  netScore={netScore}
                  onVote={(direction) => handleVote(tool.name, direction)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}; 