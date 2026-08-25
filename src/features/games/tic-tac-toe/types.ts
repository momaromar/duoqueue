export type GamePresetKey = "classic" | "quick" | "extended" | "large";
export type GameStatus =
  | "pending"
  | "active"
  | "won"
  | "draw"
  | "resigned"
  | "declined"
  | "cancelled"
  | "closed";
export type GameMark = "X" | "O";
export type GameCallerRole = "challenger" | "eligible" | "invited" | "player_x" | "player_o" | "spectator";

export type GamePreset = {
  key: GamePresetKey;
  label: string;
  boardSize: number;
  winLength: number;
};

export type GameParticipant = {
  userId: string;
  displayName: string;
  duoId: string;
  duoName: string;
};

export type GamePlayer = GameParticipant & {
  mark: GameMark;
  playerOrder: 1 | 2;
};

export type GameMove = {
  id: string;
  moveNumber: number;
  row: number;
  column: number;
  mark: GameMark;
  userId: string;
  createdAt: string;
};

export type WinningCell = { row: number; column: number; index: number };

export type GameSnapshot = {
  id: string;
  conversationId: string;
  presetKey: GamePresetKey;
  status: GameStatus;
  stateVersion: number;
  challenger: GameParticipant;
  invited: GameParticipant | null;
  invitationMessageId: string | null;
  players: GamePlayer[];
  moves: GameMove[];
  nextTurnUserId: string | null;
  winnerUserId: string | null;
  winningLine: WinningCell[];
  previousGameId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GameBoardValue = GameMark | null;
export type GameBoardGrid = GameBoardValue[][];

export type ReconstructedGame = {
  board: GameBoardGrid;
  winner: GameMark | null;
  winningLine: WinningCell[];
  isDraw: boolean;
};
