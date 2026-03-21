import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RankIcon } from '@/components/game/RankIcon';
import { PlayerStats, getRankForElo, RANKS, DifficultyStats, AI_RATINGS } from '@/lib/scoring';
import { Difficulty } from '@/lib/game-logic';

interface PlayerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onReset: () => void;
}

export const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({ isOpen, onClose, stats, onReset }) => {
  const currentRankInfo = getRankForElo(stats.elo);
  const nextRank = RANKS.find(r => r.minElo > stats.elo);

  // Calculate progress to next rank
  let progressPercentage = 100;
  if (nextRank) {
      const eloRange = nextRank.minElo - currentRankInfo.minElo;
      const eloProgress = stats.elo - currentRankInfo.minElo;
      progressPercentage = Math.max(0, Math.min(100, (eloProgress / eloRange) * 100));
  }

  // Reverse difficulties to show Consul at the top
  const difficulties: Difficulty[] = ['CONSUL', 'SENATOR', 'EQUES', 'MERCHANT', 'PLEBEIAN'];

  const getStreakDisplay = (streak: number) => {
      if (streak === 0) return '-';
      const type = streak > 0 ? 'W' : 'L';
      const absStreak = Math.abs(streak);
      const isHot = streak >= 3;
      return (
          <span className={`inline-flex items-center gap-1 ${streak > 0 ? 'text-primary' : 'text-foreground/60'}`}>
             {type}{absStreak} {isHot && <span className="text-base leading-none">🔥</span>}
          </span>
      );
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="flex flex-col gap-6 p-4 w-full max-w-md mx-auto">

        {/* Header: Rank, Elo, and Daily Streak */}
        <div className="flex flex-col items-center gap-2">
           <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${currentRankInfo.glowClass}`}>
                  <RankIcon colorClass={currentRankInfo.colorClass} />
              </div>
              <div className="flex flex-col items-start">
                  <h2 className={`text-3xl font-heading font-bold tracking-widest uppercase ${currentRankInfo.colorClass} ${currentRankInfo.glowClass}`}>
                      {currentRankInfo.name}
                  </h2>
                  <div className="text-xl text-foreground font-body">
                      Elo: <span className="font-bold">{stats.elo}</span>
                  </div>
              </div>
           </div>

           {stats.dailyStreak > 0 && (
               <div className="mt-2 bg-[var(--glass-bg)] border border-primary/40 px-4 py-2 rounded-full flex items-center gap-2 text-primary font-heading tracking-widest shadow-[0_0_10px_rgba(var(--color-primary),0.2)]">
                   🔥 {stats.dailyStreak} Day Triumph
               </div>
           )}
        </div>

        {/* Progress Bar */}
        {nextRank && (
            <div className="w-full flex flex-col gap-1 px-4">
                <div className="flex justify-between text-xs text-foreground/60 font-heading tracking-widest uppercase">
                    <span>{currentRankInfo.name}</span>
                    <span>{nextRank.name} ({nextRank.minElo})</span>
                </div>
                <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${currentRankInfo.colorClass.replace('text-', 'bg-')} transition-all duration-1000 ease-out`}
                        style={{ width: `${progressPercentage}%`, backgroundColor: currentRankInfo.colorClass.includes('var') ? currentRankInfo.colorClass.split('[')[1].split(']')[0] : undefined }}
                    />
                </div>
            </div>
        )}
        {!nextRank && (
             <div className="w-full text-center text-xs text-primary font-heading tracking-widest uppercase mt-2">
                 Max Rank Achieved
             </div>
        )}

        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent my-2" />

        {/* Stats Table */}
        <div className="w-full overflow-x-auto">
            <table className="w-full text-sm font-body">
                <thead>
                    <tr className="text-foreground/60 font-heading tracking-widest border-b border-[var(--glass-border)]">
                        <th className="text-left pb-2 font-normal">Opponent</th>
                        <th className="text-center pb-2 font-normal w-10">W</th>
                        <th className="text-center pb-2 font-normal w-10">L</th>
                        <th className="text-center pb-2 font-normal w-10">D</th>
                        <th className="text-right pb-2 font-normal w-16">Strk</th>
                    </tr>
                </thead>
                <tbody>
                    {difficulties.map((diff) => {
                        const rowStats: DifficultyStats = stats.statsByDifficulty[diff];
                        const aiRating = AI_RATINGS[diff];
                        const rankInfo = getRankForElo(aiRating);

                        return (
                            <tr key={diff} className="border-b border-[var(--glass-border)]/50 last:border-0 hover:bg-[var(--glass-border)]/5 transition-colors">
                                <td className="py-3 flex items-center gap-2">
                                    <div className={`w-5 h-5 ${rankInfo.glowClass}`}>
                                        <RankIcon colorClass={rankInfo.colorClass} />
                                    </div>
                                    <span className={`font-heading tracking-wider text-xs sm:text-sm ${rankInfo.colorClass}`}>
                                        {diff}
                                    </span>
                                </td>
                                <td className="py-3 text-center text-primary">{rowStats.wins}</td>
                                <td className="py-3 text-center text-foreground/80">{rowStats.losses}</td>
                                <td className="py-3 text-center text-foreground/50">{rowStats.draws}</td>
                                <td className="py-3 text-right pr-1">
                                    {getStreakDisplay(rowStats.currentStreak)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {/* Controls */}
        <div className="w-full flex justify-between items-center mt-4">
             <button
                onClick={() => {
                    if (window.confirm("Are you sure you want to reset all your stats and Elo back to 1000? This cannot be undone.")) {
                        onReset();
                        onClose();
                    }
                }}
                className="text-xs text-foreground/50 hover:text-red-500 transition-colors uppercase font-heading tracking-widest"
             >
                 Reset Stats
             </button>
             <Button
                onClick={onClose}
                variant="glass"
                className="px-6 py-2 text-sm font-heading tracking-wider"
             >
                Close
             </Button>
        </div>

      </div>
    </Modal>
  );
};
