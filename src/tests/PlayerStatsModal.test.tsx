import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayerStatsModal } from '../components/game/PlayerStatsModal';
import { INITIAL_PLAYER_STATS, PlayerStats } from '../lib/scoring';

describe('PlayerStatsModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnReset = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnReset.mockClear();
    // Prevent window.confirm from blocking the test
    window.confirm = vi.fn(() => true);
  });

  it('renders correctly with initial stats', () => {
    render(<PlayerStatsModal isOpen={true} onClose={mockOnClose} stats={INITIAL_PLAYER_STATS} onReset={mockOnReset} />);

    // Check Header
    expect(screen.getAllByText('Merchant')[0]).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.queryByText(/Day Triumph/i)).not.toBeInTheDocument(); // Streak 0, shouldn't show

    // Check Table Headers
    expect(screen.getByText('Opponent')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('Strk')).toBeInTheDocument();

    // Check Rows (Difficulties)
    expect(screen.getByText('CONSUL')).toBeInTheDocument();
    expect(screen.getByText('SENATOR')).toBeInTheDocument();
    expect(screen.getByText('EQUES')).toBeInTheDocument();
    expect(screen.getByText('MERCHANT')).toBeInTheDocument();
    expect(screen.getByText('PLEBEIAN')).toBeInTheDocument();
  });

  it('displays the daily streak if > 0', () => {
    const stats: PlayerStats = { ...INITIAL_PLAYER_STATS, dailyStreak: 5 };
    render(<PlayerStatsModal isOpen={true} onClose={mockOnClose} stats={stats} onReset={mockOnReset} />);
    expect(screen.getByText('🔥 5 Day Triumph')).toBeInTheDocument();
  });

  it('calculates and displays progress to the next rank', () => {
    const stats: PlayerStats = { ...INITIAL_PLAYER_STATS, elo: 1100 }; // Halfway to Eques
    render(<PlayerStatsModal isOpen={true} onClose={mockOnClose} stats={stats} onReset={mockOnReset} />);

    expect(screen.getAllByText('Merchant')[0]).toBeInTheDocument();
    expect(screen.getByText('Eques (1200)')).toBeInTheDocument();

    // The progress bar width should be 50%
    // We can check the DOM node directly
    const progressBarContainer = screen.getByText('Eques (1200)').parentElement?.nextElementSibling?.querySelector('div');
    expect(progressBarContainer).toHaveStyle('width: 50%');
  });

  it('displays "Max Rank Achieved" when reaching Consul', () => {
    const stats: PlayerStats = { ...INITIAL_PLAYER_STATS, elo: 1700 }; // Consul
    render(<PlayerStatsModal isOpen={true} onClose={mockOnClose} stats={stats} onReset={mockOnReset} />);

    expect(screen.getAllByText('Consul')[0]).toBeInTheDocument();
    expect(screen.getByText('Max Rank Achieved')).toBeInTheDocument();
    // The modal table contains the word 'EQUES', so we need to be more specific to ensure
    // the progress bar target "Eques" is NOT there.
    expect(screen.queryByText('Eques (1200)')).not.toBeInTheDocument();
  });

  it('formats streaks correctly in the table', () => {
    const stats: PlayerStats = {
        ...INITIAL_PLAYER_STATS,
        statsByDifficulty: {
            ...INITIAL_PLAYER_STATS.statsByDifficulty,
            CONSUL: { wins: 0, losses: 5, draws: 0, currentStreak: -5 }, // L5
            SENATOR: { wins: 3, losses: 0, draws: 0, currentStreak: 3 }, // W3 🔥
        }
    };
    render(<PlayerStatsModal isOpen={true} onClose={mockOnClose} stats={stats} onReset={mockOnReset} />);

    // Consul row streak: L5
    expect(screen.getByText('L5')).toBeInTheDocument();

    // Senator row streak: W3 and a fire emoji
    expect(screen.getByText('W3')).toBeInTheDocument();
    // Fire emoji might be in a span inside W3
    expect(screen.getAllByText('🔥').length).toBeGreaterThan(0);
  });

  it('calls onClose when the close button is clicked', () => {
    render(<PlayerStatsModal isOpen={true} onClose={mockOnClose} stats={INITIAL_PLAYER_STATS} onReset={mockOnReset} />);
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onReset when the reset button is clicked and confirmed', () => {
    render(<PlayerStatsModal isOpen={true} onClose={mockOnClose} stats={INITIAL_PLAYER_STATS} onReset={mockOnReset} />);
    const resetBtn = screen.getByRole('button', { name: 'Reset Stats' });
    fireEvent.click(resetBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnReset).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});