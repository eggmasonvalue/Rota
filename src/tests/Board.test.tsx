import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Board } from '@/components/game/Board';
import { GameState, INITIAL_STATE, Player } from '@/lib/game-logic';

describe('Board', () => {
  it('renders the board with 9 cells', () => {
    const mockOnCellClick = vi.fn();
    render(<Board gameState={INITIAL_STATE} onCellClick={mockOnCellClick} />);

    for (let i = 0; i < 9; i++) {
      expect(screen.getByTestId(`cell-${i}`)).toBeInTheDocument();
    }
  });

  it('calls onCellClick with the correct index when an empty cell is clicked during placement', async () => {
    const user = userEvent.setup();
    const mockOnCellClick = vi.fn();

    render(<Board gameState={INITIAL_STATE} onCellClick={mockOnCellClick} />);

    for (let i = 0; i < 9; i++) {
      const cell = screen.getByTestId(`cell-${i}`);
      await user.click(cell);

      expect(mockOnCellClick).toHaveBeenCalledWith(i);
      expect(mockOnCellClick).toHaveBeenCalledTimes(i + 1);
    }
  });

  it('calls onCellClick with the correct index when a piece is clicked to select during movement', async () => {
    const user = userEvent.setup();
    const mockOnCellClick = vi.fn();

    const mockState: GameState = {
      ...INITIAL_STATE,
      phase: 'MOVEMENT',
      board: ['PLAYER1' as Player, null, null, null, null, null, null, null, null],
      piecesCount: { PLAYER1: 3, PLAYER2: 3 }
    };

    render(<Board gameState={mockState} onCellClick={mockOnCellClick} />);

    const cell = screen.getByTestId('cell-0');
    await user.click(cell);

    expect(mockOnCellClick).toHaveBeenCalledWith(0);
    expect(mockOnCellClick).toHaveBeenCalledTimes(1);
  });

  it('calls onCellClick with the correct index when a valid empty destination is clicked during movement', async () => {
    const user = userEvent.setup();
    const mockOnCellClick = vi.fn();

    const mockState: GameState = {
      ...INITIAL_STATE,
      phase: 'MOVEMENT',
      board: ['PLAYER1' as Player, null, null, null, null, null, null, null, null],
      piecesCount: { PLAYER1: 3, PLAYER2: 3 },
      selectedCell: 0
    };

    render(<Board gameState={mockState} onCellClick={mockOnCellClick} />);

    const adjacentCell = screen.getByTestId('cell-1');
    await user.click(adjacentCell);

    expect(mockOnCellClick).toHaveBeenCalledWith(1);
    expect(mockOnCellClick).toHaveBeenCalledTimes(1);
  });
});