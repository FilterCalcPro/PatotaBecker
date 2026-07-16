export interface BalancerPlayer {
  id: string;
  type: "LINHA" | "GOLEIRO";
  overall: number;
}

export interface BalancedTeams {
  teamA: string[];
  teamB: string[];
}

function sumOverall(players: BalancerPlayer[], ids: string[]) {
  const byId = new Map(players.map((p) => [p.id, p.overall]));
  return ids.reduce((sum, id) => sum + (byId.get(id) ?? 0), 0);
}

export function balanceTeams(players: BalancerPlayer[]): BalancedTeams {
  const goalkeepers = players.filter((p) => p.type === "GOLEIRO").sort((a, b) => b.overall - a.overall);
  const outfield = players.filter((p) => p.type === "LINHA").sort((a, b) => b.overall - a.overall);

  const teamA: string[] = [];
  const teamB: string[] = [];

  goalkeepers.forEach((gk, index) => {
    if (index % 2 === 0) teamA.push(gk.id);
    else teamB.push(gk.id);
  });

  // Distribuição serpentina (draft snake) para equilíbrio inicial por overall.
  outfield.forEach((player, index) => {
    const cycle = index % 4;
    if (cycle === 0 || cycle === 3) teamA.push(player.id);
    else teamB.push(player.id);
  });

  // Busca local: troca pares entre os times enquanto reduzir a diferença de overall.
  let improved = true;
  let iterations = 0;
  while (improved && iterations < 200) {
    improved = false;
    iterations += 1;

    const diff = sumOverall(players, teamA) - sumOverall(players, teamB);
    if (Math.abs(diff) <= 1) break;

    for (const aId of teamA) {
      const aPlayer = players.find((p) => p.id === aId)!;
      for (const bId of teamB) {
        const bPlayer = players.find((p) => p.id === bId)!;
        if (aPlayer.type !== bPlayer.type) continue;

        const newDiff = diff - 2 * (aPlayer.overall - bPlayer.overall);
        if (Math.abs(newDiff) < Math.abs(diff)) {
          const aIndex = teamA.indexOf(aId);
          const bIndex = teamB.indexOf(bId);
          teamA[aIndex] = bId;
          teamB[bIndex] = aId;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return { teamA, teamB };
}
