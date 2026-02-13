export interface Player {
  name: string;
  buyInCount: number;
  cashInHand: number;
}

export interface GameSession {
  buyInAmount: number;
  players: Player[];
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface PlayerSummary {
  name: string;
  totalIn: number;
  cashInHand: number;
  net: number;
}

export interface SettleResponse {
  settlements: Settlement[];
  summary: PlayerSummary[];
}

export interface SettleError {
  error: string;
}
