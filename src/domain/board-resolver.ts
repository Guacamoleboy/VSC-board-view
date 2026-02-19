import { BOARDS, BoardConfig } from "./board-config";

export function resolveBoardFromToken(token: string): BoardConfig | undefined {
  const upper = token.toUpperCase();
  return BOARDS.find(board =>
    board.tags.includes(upper)
  );

}