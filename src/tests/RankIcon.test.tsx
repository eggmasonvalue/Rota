import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RankIcon } from '../components/game/RankIcon';

describe('RankIcon Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<RankIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies the correct default color class', () => {
    const { container } = render(<RankIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-current');
  });

  it('applies custom color class and generic class names correctly', () => {
    const { container } = render(<RankIcon colorClass="text-primary" className="my-custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-primary');
    expect(svg).toHaveClass('my-custom-class');
  });

  it('contains the necessary SVG elements for the Rota board', () => {
    const { container } = render(<RankIcon />);
    const svg = container.querySelector('svg');

    // Check for circles (outer, inner hub, inner dot)
    const circles = svg?.querySelectorAll('circle');
    expect(circles?.length).toBe(3);

    // Check for spokes (lines)
    const lines = svg?.querySelectorAll('line');
    expect(lines?.length).toBe(4);
  });
});