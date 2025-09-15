export interface GameSession {
  id: string;
  betAmount: number;
  creator: string;
  teamA: {
    players: string[];
    playerKills: number[];
    playerSpawns: number[];
  };
  teamB: {
    players: string[];
    playerKills: number[];
    playerSpawns: number[];
  };
  status: 'waitingForPlayers' | 'inProgress' | 'completed';
}

export enum GameMode {
  winnerTakesAllOneVsOne = "winnerTakesAllOneVsOne",
  winnerTakesAllThreeVsThree = "winnerTakesAllThreeVsThree",
  winnerTakesAllFiveVsFive = "winnerTakesAllFiveVsFive",
  payToSpawnOneVsOne = "payToSpawnOneVsOne",
  payToSpawnThreeVsThree = "payToSpawnThreeVsThree",
  payToSpawnFiveVsFive = "payToSpawnFiveVsFive",
} 