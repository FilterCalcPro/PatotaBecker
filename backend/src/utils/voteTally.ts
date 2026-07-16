interface VoteRecord {
  category: "MVP" | "ARTILHEIRO" | "GOLEIRO";
  candidateId: string;
  rank: number | null;
}

export interface MvpTallyEntry {
  candidateId: string;
  points: number;
  placement: 1 | 2 | 3;
}

export interface MatchVoteResults {
  mvp: MvpTallyEntry[];
  topScorerWinnerId: string | null;
  bestGoalkeeperWinnerId: string | null;
}

const MVP_RANK_POINTS: Record<number, number> = { 1: 3, 2: 2, 3: 1 };

function winnerByCount(votes: VoteRecord[], category: "ARTILHEIRO" | "GOLEIRO"): string | null {
  const counts = new Map<string, number>();
  for (const vote of votes) {
    if (vote.category !== category) continue;
    counts.set(vote.candidateId, (counts.get(vote.candidateId) ?? 0) + 1);
  }
  let winnerId: string | null = null;
  let maxCount = 0;
  for (const [candidateId, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      winnerId = candidateId;
    }
  }
  return winnerId;
}

export function tallyMatchVotes(votes: VoteRecord[]): MatchVoteResults {
  const mvpPoints = new Map<string, number>();
  for (const vote of votes) {
    if (vote.category !== "MVP" || !vote.rank) continue;
    const points = MVP_RANK_POINTS[vote.rank] ?? 0;
    mvpPoints.set(vote.candidateId, (mvpPoints.get(vote.candidateId) ?? 0) + points);
  }

  const mvp: MvpTallyEntry[] = Array.from(mvpPoints.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([candidateId, points], index) => ({ candidateId, points, placement: (index + 1) as 1 | 2 | 3 }));

  return {
    mvp,
    topScorerWinnerId: winnerByCount(votes, "ARTILHEIRO"),
    bestGoalkeeperWinnerId: winnerByCount(votes, "GOLEIRO"),
  };
}
