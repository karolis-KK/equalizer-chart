import type { CSSProperties } from 'react';

/** A single data point (one bar / pillar). */
export interface EqualizerDatum {
  /** The label for the bar (shown in the tooltip / accessible name). */
  label?: string;
  /** The numeric value for the bar. */
  value: number;
  /** Optional per-bar color override (only used when `fill === 'solid'`). */
  color?: string;
  /** Optional per-bar corner radius (overrides `barRadius`). */
  radius?: number;
}

/** A named gradient stop used for the color gradient. */
export interface GradientStop {
  /** CSS color, e.g. `#22c55e` or `rgb(255, 99, 71)`. */
  color: string;
  /** Position in the gradient, from `0` to `1`. Defaults to evenly spaced. */
  offset?: number;
}

/** Configuration for the color gradient applied to the bars. */
export interface GradientConfig {
  /** The list of gradient stops, from bottom to top. */
  stops: GradientStop[];
  /**
   * When `true` (default) the gradient spans the whole chart, so taller bars
   * reach the "hot" end of the scale. When `false` each bar gets its own
   * gradient from its base to its top.
   */
  fixed?: boolean;
}

/** The fill style for the bars. */
export type FillMode = 'gradient' | 'solid';

/** The direction the gradient travels. */
export type GradientDirection = 'vertical' | 'horizontal';

/** Animation mode for the equalizer effect. */
export type AnimationMode = 'wave' | 'random' | 'none';

/** The side of the chart where an axis label is rendered. */
export type AxisPosition = 'left' | 'right' | 'top' | 'bottom';

/** Where the axis label sits along its axis. */
export type AxisAlign = 'start' | 'center' | 'end';

/** The corner radius shape for a bar. */
export type BarShape = 'rect' | 'rounded';

export interface EqualizerChartProps {
  /** The data to render. */
  data: EqualizerDatum[];

  /** Width of the chart in pixels. Default: `600`. */
  width?: number;
  /** Height of the chart in pixels. Default: `300`. */
  height?: number;

  /**
   * Fill mode for the bars.
   * - `gradient` applies the configured color gradient to every bar.
   * - `solid` uses a single color for every bar.
   * Default: `'gradient'`.
   */
  fill?: FillMode;

  /** Solid color used when `fill === 'solid'`. Default: `'#22c55e'`. */
  color?: string;

  /**
   * The gradient applied to the bars when `fill === 'gradient'`.
   * Accepts a list of CSS colors (evenly spaced) or a `GradientConfig`.
   */
  gradient?: GradientConfig | string[];

  /** Direction of the gradient. Default: `'vertical'`. */
  gradientDirection?: GradientDirection;

  /** Background color of the chart. Default: `'transparent'`. */
  background?: string;

  /** Gap (in pixels) between each bar. Default: `6`. */
  gap?: number;

  /** Thickness / width of each bar in pixels. Default: auto-calculated. */
  barWidth?: number;

  /** Corner radius of each bar in pixels. Default: `0`. */
  barRadius?: number;

  /** Shape preset for the bars. Default: `'rect'`. */
  barShape?: BarShape;

  /** Border radius of the whole chart container. Default: `0`. */
  borderRadius?: number;

  /** Inner padding (in px) of the plot area. `0` by default; axis labels add space. */
  padding?: number;

  /** Maximum value for the y-axis scale. Default: auto-detected from data. */
  maxValue?: number;

  /** Minimum value for the y-axis scale. Default: `0`. */
  minValue?: number;

  /** Animation mode. Default: `'wave'`. */
  animation?: AnimationMode;

  /** Duration of the on-load animation, in milliseconds. Default: `1000`. */
  animationDuration?: number;

  /** Maximum animation amplitude as a fraction of bar height. Default: `0.08`. */
  animationAmplitude?: number;

  /** When `false`, bars are not animated. Shorthand for `animation: 'none'`. */
  animated?: boolean;

  /**
   * When `true` the equalizer animation loops forever. When `false` (default)
   * it plays once on mount — for `animationDuration` — then settles on the
   * real data values.
   */
  animationLoop?: boolean;

  /** When `true`, the x-axis label is shown. Default: `false`. */
  showXAxis?: boolean;

  /** When `true`, the y-axis label is shown. Default: `false`. */
  showYAxis?: boolean;

  /** Label rendered on the x-axis. */
  xAxisLabel?: string;

  /** Label rendered on the y-axis. */
  yAxisLabel?: string;

  /** Position of the x-axis label. Default: `'bottom'`. */
  xAxisPosition?: AxisPosition;

  /** Position of the y-axis label. Default: `'left'`. */
  yAxisPosition?: AxisPosition;

  /** Where the x-axis label sits along the bottom/top edge. Default: `'center'`. */
  xAxisAlign?: AxisAlign;

  /** Where the y-axis label sits along the left/right edge. Default: `'center'`. */
  yAxisAlign?: AxisAlign;

  /**
   * Shows each datum's `label` beneath its bar. Default: `false`.
   * Per-bar labels are also what screen readers and tooltips use.
   */
  showColumnLabels?: boolean;

  /** Font size (in px) for the per-column labels. Default: `12`. */
  columnLabelFontSize?: number;

  /** Color of the per-column labels. Defaults to `axisColor`. */
  columnLabelColor?: string;

  /** Font size (in px) for the axis labels. Default: `14`. */
  axisFontSize?: number;

  /** Color of the axis labels. Default: `'currentColor'`. */
  axisColor?: string;

  /** Font weight of the axis labels. Default: `500`. */
  axisFontWeight?: number | string;

  /**
   * When `true`, thin horizontal separator lines are drawn across the bars,
   * giving them the "stacked blocks" equalizer look from the reference
   * images. Default: `true`.
   */
  showSegments?: boolean;

  /** Vertical spacing between segment lines, in pixels. Default: `14`. */
  segmentSize?: number;

  /** Thickness of the segment lines, in pixels. Default: `2`. */
  segmentLineWidth?: number;

  /** Color of the segment lines. Defaults to the chart background. */
  segmentLineColor?: string;

  /** Opacity of the segment lines. Default: `1`. */
  segmentLineOpacity?: number;

  /** When `true`, each bar renders a `<title>` tooltip with its value. Default: `false`. */
  showTooltips?: boolean;

  /** Extra CSS properties applied to the chart container. */
  style?: CSSProperties;

  /** Extra CSS class applied to the chart container. */
  className?: string;

  /** Accessible description of the chart. */
  ariaLabel?: string;
}
