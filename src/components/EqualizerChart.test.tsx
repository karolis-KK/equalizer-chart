import { describe, expect, it, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { EqualizerChart } from './EqualizerChart';

const data = [
  { label: 'A', value: 10 },
  { label: 'B', value: 30 },
  { label: 'C', value: 20 },
];

afterEach(cleanup);

describe('<EqualizerChart />', () => {
  it('renders an accessible svg with one rect per datum', () => {
    const { container } = render(<EqualizerChart data={data} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('role')).toBe('img');
    // 3 bars + the stripe overlay rect + 3 clip rects + 1 pattern rect.
    const bars = svg!.querySelectorAll('rect[rx]');
    expect(bars.length).toBeGreaterThanOrEqual(3);
  });

  it('respects width and height', () => {
    const { container } = render(
      <EqualizerChart data={data} width={420} height={180} />,
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('420');
    expect(svg?.getAttribute('height')).toBe('180');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 420 180');
  });

  it('renders a linear gradient with the supplied stops', () => {
    const { container } = render(
      <EqualizerChart data={data} gradient={['#ff0000', '#00ff00', '#0000ff']} />,
    );
    const stops = container.querySelectorAll('linearGradient stop');
    expect(stops).toHaveLength(3);
    expect(stops[0].getAttribute('stop-color')).toBe('#ff0000');
    expect(stops[2].getAttribute('stop-color')).toBe('#0000ff');
  });

  it('uses a solid fill when fill="solid"', () => {
    const { container } = render(
      <EqualizerChart data={data} fill="solid" color="#abcdef" />,
    );
    const bars = Array.from(container.querySelectorAll('rect[rx]'));
    expect(bars.some((b) => b.getAttribute('fill') === '#abcdef')).toBe(true);
    expect(container.querySelector('linearGradient')).toBeNull();
  });

  it('renders segment stripes by default', () => {
    const { container } = render(<EqualizerChart data={data} />);
    expect(container.querySelector('pattern')).not.toBeNull();
  });

  it('can disable segment stripes', () => {
    const { container } = render(
      <EqualizerChart data={data} showSegments={false} />,
    );
    expect(container.querySelector('pattern')).toBeNull();
  });

  it('shows axis labels when enabled', () => {
    const { getByText } = render(
      <EqualizerChart
        data={data}
        showXAxis
        showYAxis
        xAxisLabel="week"
        yAxisLabel="reviews"
      />,
    );
    expect(getByText('week')).toBeTruthy();
    expect(getByText('reviews')).toBeTruthy();
  });

  it('hides axis labels when disabled', () => {
    const { queryByText } = render(
      <EqualizerChart
        data={data}
        showXAxis={false}
        showYAxis={false}
        xAxisLabel="week"
        yAxisLabel="reviews"
      />,
    );
    expect(queryByText('week')).toBeNull();
    expect(queryByText('reviews')).toBeNull();
  });

  it('positions the y-axis label on the right when requested', () => {
    const { getByText } = render(
      <EqualizerChart
        data={data}
        showYAxis
        yAxisLabel="level"
        yAxisPosition="right"
        width={400}
      />,
    );
    const label = getByText('level');
    // rotate(-90 cx cy) where cx is near the right edge.
    expect(label.getAttribute('transform')).toContain('rotate(-90');
    expect(Number(label.getAttribute('x'))).toBeGreaterThan(300);
  });

  it('scales bar heights relative to the largest value', () => {
    const { container } = render(
      <EqualizerChart data={data} height={100} minValue={0} maxValue={30} />,
    );
    const bars = Array.from(container.querySelectorAll('rect[rx]'));
    const heights = bars.map((b) => Number(b.getAttribute('height')));
    const max = Math.max(...heights);
    const min = Math.min(...heights.filter((h) => h > 0));
    expect(max).toBeCloseTo(100, 0);
    // value 10 of 30 → one third the height.
    expect(min).toBeCloseTo(100 / 3, 0);
  });

  it('clamps values outside the min/max domain', () => {
    const { container } = render(
      <EqualizerChart
        data={[{ value: -50 }, { value: 500 }]}
        minValue={0}
        maxValue={100}
        height={200}
      />,
    );
    const heights = Array.from(container.querySelectorAll('rect[rx]')).map((b) =>
      Number(b.getAttribute('height')),
    );
    expect(Math.min(...heights)).toBe(0);
    expect(Math.max(...heights)).toBeLessThanOrEqual(200);
  });

  it('renders without crashing for empty data', () => {
    const { container } = render(<EqualizerChart data={[]} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('keeps animating when animationLoop is true', () => {
    const callbacks: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        callbacks.push(cb);
        return callbacks.length;
      });
    const cancelSpy = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => {});
    let now = 0;
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => now);

    render(<EqualizerChart data={data} animationDuration={1000} animationLoop />);

    now = 600;
    callbacks.shift()?.(now);
    now = 1500;
    callbacks.shift()?.(now);

    // Still scheduling frames well past the duration.
    expect(callbacks.length).toBeGreaterThan(0);

    rafSpy.mockRestore();
    cancelSpy.mockRestore();
    nowSpy.mockRestore();
  });

  it('does not animate when animation is "none"', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    render(<EqualizerChart data={data} animation="none" />);
    expect(raf).not.toHaveBeenCalled();
    raf.mockRestore();
  });

  it('does not animate when animated={false}', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    render(<EqualizerChart data={data} animated={false} />);
    expect(raf).not.toHaveBeenCalled();
    raf.mockRestore();
  });

  it('animates by default', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    render(<EqualizerChart data={data} />);
    expect(raf).toHaveBeenCalled();
    raf.mockRestore();
  });

  it('plays once by default and settles on the real data heights', async () => {
    // Capture rAF callbacks so we can drive time deterministically.
    const callbacks: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        callbacks.push(cb);
        return callbacks.length;
      });
    const cancelSpy = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => {});

    let now = 0;
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => now);

    const { container } = render(
      <EqualizerChart data={data} animationDuration={1000} />,
    );

    const bars = () =>
      Array.from(container.querySelectorAll('rect[rx]')).map((r) =>
        Number(r.getAttribute('height')),
      );

    // Drive the animation past the 1000 ms duration.
    now = 500;
    callbacks.shift()?.(now);
    now = 1001;
    const callsBefore = callbacks.length;
    callbacks.shift()?.(now);

    // After the duration, no new frame should be scheduled.
    expect(callbacks.length).toBe(0);
    expect(callsBefore).toBeGreaterThan(0);

    // Heights must now equal the unanimated (real) values: 10/30, 30/30, 20/30
    // of a 300px plot height. The clip rects mirror the bars, so compare the
    // first three bar values.
    const heights = bars();
    expect(heights.slice(0, 3)).toEqual([100, 300, 200]);

    rafSpy.mockRestore();
    cancelSpy.mockRestore();
    nowSpy.mockRestore();
  });

  it('renders per-column labels when showColumnLabels is enabled', () => {
    const on = render(<EqualizerChart data={data} showColumnLabels />);
    expect(on.getByText('A')).toBeTruthy();
    expect(on.getByText('B')).toBeTruthy();
    expect(on.getByText('C')).toBeTruthy();
    on.unmount();

    const off = render(<EqualizerChart data={data} />);
    expect(off.queryByText('A')).toBeNull();
    off.unmount();
  });

  it('keeps column labels above a bottom x-axis label', () => {
    const { getByText } = render(
      <EqualizerChart
        data={data}
        showColumnLabels
        showXAxis
        xAxisLabel="week"
      />,
    );
    const columnY = Number(getByText('A').getAttribute('y'));
    const axisY = Number(getByText('week').getAttribute('y'));
    expect(columnY).toBeLessThan(axisY);
    expect(axisY).toBeLessThanOrEqual(300);
  });

  it('aligns the x-axis label start/center/end', () => {
    const x = (align: 'start' | 'center' | 'end') => {
      const { getByText, unmount } = render(
        <EqualizerChart
          data={data}
          width={400}
          showXAxis
          xAxisLabel="week"
          xAxisAlign={align}
        />,
      );
      const value = Number(getByText('week').getAttribute('x'));
      unmount();
      return value;
    };
    expect(x('start')).toBeLessThan(x('center'));
    expect(x('center')).toBeLessThan(x('end'));
  });

  it('aligns the y-axis label start/center/end', () => {
    // Rotated text reads bottom-to-top, so `start` sits low and `end` high.
    const y = (align: 'start' | 'center' | 'end') => {
      const { getByText, unmount } = render(
        <EqualizerChart
          data={data}
          height={300}
          showYAxis
          yAxisLabel="level"
          yAxisAlign={align}
        />,
      );
      const value = Number(getByText('level').getAttribute('y'));
      unmount();
      return value;
    };
    expect(y('start')).toBeGreaterThan(y('center'));
    expect(y('center')).toBeGreaterThan(y('end'));
  });

  it('prints each value above its bar when showValues is enabled', () => {
    const on = render(<EqualizerChart data={data} showValues />);
    const values = Array.from(on.container.querySelectorAll('text')).map(
      (t) => t.textContent,
    );
    expect(values).toEqual(['10', '30', '20']);
    on.unmount();

    const off = render(<EqualizerChart data={data} />);
    expect(off.container.querySelectorAll('text')).toHaveLength(0);
    off.unmount();
  });

  it('moves value labels with their bars during animation', () => {
    const callbacks: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        callbacks.push(cb);
        return callbacks.length;
      });
    const cancelSpy = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => {});
    let now = 0;
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => now);

    const { container } = render(
      <EqualizerChart data={data} showValues animationDuration={1000} />,
    );

    now = 450;
    callbacks.shift()?.(now);

    const barY = Number(
      container.querySelector('rect[rx]')?.getAttribute('y'),
    );
    const labelY = Number(
      container.querySelector('text[pointer-events="none"]')?.getAttribute('y'),
    );
    // Label should sit 4px above the bar's top edge.
    expect(labelY).toBeCloseTo(barY - 4, 5);

    rafSpy.mockRestore();
    cancelSpy.mockRestore();
    nowSpy.mockRestore();
  });

  it('generates unique gradient ids for multiple instances', () => {
    const { container } = render(
      <div>
        <EqualizerChart data={data} />
        <EqualizerChart data={data} />
      </div>,
    );
    const gradients = container.querySelectorAll('linearGradient');
    expect(gradients).toHaveLength(2);
    expect(gradients[0].id).not.toBe(gradients[1].id);
  });

  it('applies className, style and aria-label', () => {
    const { container } = render(
      <EqualizerChart
        data={data}
        className="chart-x"
        style={{ marginTop: 12 }}
        ariaLabel="weekly reviews"
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toBe('chart-x');
    expect(svg?.getAttribute('aria-label')).toBe('weekly reviews');
    expect(svg?.style.marginTop).toBe('12px');
  });

  it('renders a native tooltip when showTooltips is enabled', () => {
    const { container } = render(
      <EqualizerChart data={data} showTooltips />,
    );
    const titles = Array.from(container.querySelectorAll('title'));
    expect(titles.map((t) => t.textContent)).toContain('A: 10');
  });
});
