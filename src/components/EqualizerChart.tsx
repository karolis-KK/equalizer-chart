import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import * as React from 'react';
import {
  type AxisAlign,
  type AxisPosition,
  type EqualizerChartProps,
  type GradientStop,
} from '../types';
import { normalizeStops } from '../utils/color';

/** Default gradient: green → yellow → orange → red → pink (reference image 1). */
const DEFAULT_GRADIENT: GradientStop[] = [
  { color: '#22c55e', offset: 0 },
  { color: '#facc15', offset: 0.3 },
  { color: '#f97316', offset: 0.55 },
  { color: '#ef4444', offset: 0.8 },
  { color: '#ec4899', offset: 1 },
];

interface BarGeometry {
  x: number;
  width: number;
  baseHeight: number;
  label?: string;
  color?: string;
  radius?: number;
}

interface ResolvedGradient {
  stops: GradientStop[];
  fixed: boolean;
}

/** Convert the `gradient` prop into normalised stops plus the `fixed` flag. */
function resolveGradient(
  gradient: EqualizerChartProps['gradient'],
): ResolvedGradient {
  if (!gradient) return { stops: DEFAULT_GRADIENT, fixed: true };

  if (Array.isArray(gradient)) {
    return {
      stops: normalizeStops(
        gradient.map((color) => ({ color })),
      ),
      fixed: true,
    };
  }

  if (gradient.stops.length > 0) {
    return {
      stops: normalizeStops(gradient.stops),
      fixed: gradient.fixed ?? true,
    };
  }

  return { stops: DEFAULT_GRADIENT, fixed: true };
}

/** Deterministic pseudo-random in [0, 1) based on an index. */
function pseudoRandom(index: number): number {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Animation offset multiplier for bar `index` at `seconds`. */
function animationOffset(
  index: number,
  seconds: number,
  mode: 'wave' | 'random',
  duration: number,
  amplitude: number,
): number {
  const t = (seconds * 1000) / duration;
  const phase =
    mode === 'random' ? pseudoRandom(index) * Math.PI * 2 : index * 0.55;
  const speed = mode === 'random' ? 0.6 + pseudoRandom(index + 97) * 0.9 : 1;
  return Math.sin(t * Math.PI * 2 * speed + phase) * amplitude;
}

/** Monotonic counter used to generate unique SVG ids on React 17. */
let instanceCounter = 0;

/** Fallback id generator for React < 18 (no `useId`). */
function useFallbackId(): string {
  const [id] = useState(() => `eq${instanceCounter++}`);
  return id;
}

/**
 * `useId` is only available in React 18+. Pick the implementation once at
 * module load so the same hook is always called for a given React version.
 */
const useStableId: () => string =
  typeof (React as { useId?: unknown }).useId === 'function'
    ? (React as unknown as { useId: () => string }).useId
    : useFallbackId;

/**
 * A lightweight, customisable waveform / equalizer bar chart for React.
 *
 * Bars are rendered as SVG rects filled with a color gradient and overlaid
 * with thin horizontal separator lines to create the "stacked blocks" look.
 * The animation is driven by a single `requestAnimationFrame` loop that writes
 * directly to the DOM, so it never triggers a React re-render.
 */
export function EqualizerChart(props: EqualizerChartProps): ReactElement {
  const {
    data,
    width = 600,
    height = 300,
    fill = 'gradient',
    color = '#22c55e',
    gradient,
    gradientDirection = 'vertical',
    background = 'transparent',
    gap = 6,
    barWidth,
    barRadius = 0,
    barShape = 'rect',
    borderRadius = 0,
    padding = 0,
    maxValue,
    minValue = 0,
    animation = 'wave',
    animationDuration = 1000,
    animationAmplitude = 0.08,
    animated = true,
    animationLoop = false,
    showXAxis = false,
    showYAxis = false,
    xAxisLabel,
    yAxisLabel,
    xAxisPosition = 'bottom',
    yAxisPosition = 'left',
    xAxisAlign = 'center',
    yAxisAlign = 'center',
    showColumnLabels = false,
    columnLabelFontSize = 12,
    columnLabelColor,
    axisFontSize = 14,
    axisColor = 'currentColor',
    axisFontWeight = 500,
    showSegments = true,
    segmentSize = 14,
    segmentLineWidth = 2,
    segmentLineColor,
    segmentLineOpacity = 1,
    showTooltips = false,
    style,
    className,
    ariaLabel = 'equalizer chart',
  } = props;

  const uid = useStableId().replace(/:/g, '_');
  const gradientId = `${uid}-grad`;
  const patternId = `${uid}-stripes`;
  const clipId = `${uid}-clip`;

  // --- Layout ----------------------------------------------------------------
  const hasColumnLabels = showColumnLabels && data.some((d) => d.label);
  const columnRow = hasColumnLabels ? columnLabelFontSize + 8 : 0;

  const labelSpace = useMemo(() => {
    const space: Record<AxisPosition, number> = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
    if (showXAxis && xAxisLabel) space[xAxisPosition] = axisFontSize + 12;
    if (showYAxis && yAxisLabel) {
      space[yAxisPosition] = Math.max(space[yAxisPosition], axisFontSize + 12);
    }
    // Column labels sit directly under the bars; a bottom x-axis label goes
    // below them so the two rows never overlap.
    if (columnRow > 0) space.bottom += columnRow;
    return space;
  }, [showXAxis, showYAxis, xAxisLabel, yAxisLabel, xAxisPosition, yAxisPosition, axisFontSize, columnRow]);

  const xAxisLabelY =
    xAxisPosition === 'bottom'
      ? height - (axisFontSize + 12) / 2
      : (axisFontSize + 12) / 2;

  const columnLabelY =
    height - (xAxisPosition === 'bottom' && showXAxis && xAxisLabel ? axisFontSize + 12 : 0) - columnRow / 2;

  const plot = useMemo(
    () => ({
      x: padding + labelSpace.left,
      y: padding + labelSpace.top,
      width: Math.max(0, width - padding * 2 - labelSpace.left - labelSpace.right),
      height: Math.max(0, height - padding * 2 - labelSpace.top - labelSpace.bottom),
    }),
    [padding, width, height, labelSpace],
  );

  const baselineY = plot.y + plot.height;

  // --- Scale -----------------------------------------------------------------
  const domainMax = useMemo(() => {
    if (maxValue !== undefined) return maxValue;
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => d.value), 1);
  }, [data, maxValue]);

  const range = domainMax - minValue || 1;

  // --- Bars ------------------------------------------------------------------
  const bars = useMemo<BarGeometry[]>(() => {
    if (data.length === 0) return [];
    const count = data.length;
    const computedWidth =
      barWidth ?? Math.max(1, (plot.width - gap * (count - 1)) / count);
    const totalWidth = count * computedWidth + (count - 1) * gap;
    const startX = plot.x + Math.max(0, (plot.width - totalWidth) / 2);

    return data.map((datum, index) => {
      const fraction = Math.max(0, Math.min(1, (datum.value - minValue) / range));
      return {
        x: startX + index * (computedWidth + gap),
        width: computedWidth,
        baseHeight: fraction * plot.height,
        label: datum.label,
        color: datum.color,
        radius: datum.radius,
      };
    });
  }, [data, plot.width, plot.height, plot.x, gap, barWidth, minValue, range]);

  const resolvedGradient = useMemo(() => resolveGradient(gradient), [gradient]);

  const resolvedRadius = (bar: BarGeometry): number =>
    bar.radius ?? (barShape === 'rounded' ? Math.max(barRadius, 4) : barRadius);

  const stripeColor =
    segmentLineColor ??
    (background === 'transparent' ? 'rgba(0, 0, 0, 0.45)' : background);

  // --- Animation -------------------------------------------------------------
  const enabled = animated && animation !== 'none' && animationAmplitude > 0;
  const barRefs = useRef<Array<SVGRectElement | null>>([]);
  const clipRefs = useRef<Array<SVGRectElement | null>>([]);

  useEffect(() => {
    const applyHeights = (heights: number[]) => {
      for (let i = 0; i < heights.length; i++) {
        const bar = bars[i];
        const el = barRefs.current[i];
        const clipEl = clipRefs.current[i];
        if (!bar) continue;
        const h = Math.max(0, Math.min(plot.height, heights[i]));
        const y = baselineY - h;
        if (el) {
          el.setAttribute('y', String(y));
          el.setAttribute('height', String(h));
        }
        if (clipEl) {
          clipEl.setAttribute('y', String(y));
          clipEl.setAttribute('height', String(h));
        }
      }
    };

    const baseHeights = bars.map((b) => b.baseHeight);

    if (!enabled) {
      applyHeights(baseHeights);
      return;
    }

    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      applyHeights(baseHeights);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const durationMs = Math.max(1, animationDuration);

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = elapsed / durationMs;

      // A one-shot animation: once the duration has elapsed, settle exactly on
      // the real data heights and stop the loop.
      if (!animationLoop && progress >= 1) {
        applyHeights(baseHeights);
        return;
      }

      const seconds = elapsed / 1000;
      // Fade the pulse out towards the end so bars ease into their real values.
      const envelope = animationLoop
        ? 1
        : Math.max(0, 1 - progress) ** 2;

      const heights = baseHeights.map((h, i) => {
        const factor = animationOffset(
          i,
          seconds,
          animation === 'random' ? 'random' : 'wave',
          durationMs,
          animationAmplitude,
        );
        return h * (1 + factor * envelope);
      });
      applyHeights(heights);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [
    bars,
    enabled,
    animation,
    animationDuration,
    animationAmplitude,
    animationLoop,
    plot.height,
    baselineY,
  ]);

  // --- Axis labels -----------------------------------------------------------
  const renderAxisLabel = (
    label: string,
    position: AxisPosition,
    align: AxisAlign,
  ): ReactElement => {
    const textAnchor: 'start' | 'end' | 'middle' =
      align === 'start' ? 'start' : align === 'end' ? 'end' : 'middle';
    const textProps = {
      fill: axisColor,
      fontSize: axisFontSize,
      fontWeight: axisFontWeight,
      fontFamily: 'inherit',
      textAnchor,
      dominantBaseline: 'middle' as const,
    };

    const ratio = align === 'start' ? 0 : align === 'end' ? 1 : 0.5;

    if (position === 'left' || position === 'right') {
      const cx = position === 'left' ? labelSpace.left / 2 : width - labelSpace.right / 2;
      // Rotated text reads bottom-to-top, so flip the ratio to keep the glyphs
      // inside the plot for every alignment.
      const cy = plot.y + plot.height * (1 - ratio);
      return (
        <text x={cx} y={cy} transform={`rotate(-90 ${cx} ${cy})`} {...textProps}>
          {label}
        </text>
      );
    }

    const cx = plot.x + plot.width * ratio;
    return (
      <text x={cx} y={xAxisLabelY} {...textProps}>
        {label}
      </text>
    );
  };

  const gradientUnits =
    resolvedGradient.fixed && gradientDirection === 'vertical'
      ? 'userSpaceOnUse'
      : 'objectBoundingBox';

  const gradientCoords =
    gradientDirection === 'vertical'
      ? resolvedGradient.fixed
        ? { x1: 0, y1: baselineY, x2: 0, y2: plot.y }
        : { x1: 0, y1: 1, x2: 0, y2: 0 }
      : { x1: 0, y1: 0, x2: 1, y2: 0 };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{
        display: 'block',
        maxWidth: '100%',
        background,
        borderRadius,
        ...style,
      }}
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        {fill === 'gradient' ? (
          <linearGradient
            id={gradientId}
            gradientUnits={gradientUnits}
            {...gradientCoords}
          >
            {resolvedGradient.stops.map((stop, index) => (
              <stop
                key={index}
                offset={`${(stop.offset ?? 0) * 100}%`}
                stopColor={stop.color}
              />
            ))}
          </linearGradient>
        ) : null}

        {showSegments && segmentLineWidth > 0 && segmentSize > 0 ? (
          <pattern
            id={patternId}
            patternUnits="userSpaceOnUse"
            width={Math.max(1, plot.width)}
            height={segmentSize}
            patternTransform={`translate(0, ${baselineY})`}
          >
            <rect
              x={0}
              y={0}
              width={Math.max(1, plot.width)}
              height={segmentLineWidth}
              fill={stripeColor}
              opacity={segmentLineOpacity}
            />
          </pattern>
        ) : null}

        <clipPath id={clipId}>
          {bars.map((bar, index) => (
            <rect
              key={index}
              ref={(el) => {
                clipRefs.current[index] = el;
              }}
              x={bar.x}
              y={baselineY - bar.baseHeight}
              width={bar.width}
              height={bar.baseHeight}
              rx={resolvedRadius(bar)}
            />
          ))}
        </clipPath>
      </defs>

      {showXAxis && xAxisLabel
        ? renderAxisLabel(xAxisLabel, xAxisPosition, xAxisAlign)
        : null}
      {showYAxis && yAxisLabel
        ? renderAxisLabel(yAxisLabel, yAxisPosition, yAxisAlign)
        : null}

      {showColumnLabels
        ? bars.map((bar, index) =>
            bar.label ? (
              <text
                key={`label-${index}`}
                x={bar.x + bar.width / 2}
                y={columnLabelY}
                fill={columnLabelColor ?? axisColor}
                fontSize={columnLabelFontSize}
                fontFamily="inherit"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {bar.label}
              </text>
            ) : null,
          )
        : null}

      {bars.map((bar, index) => (
        <rect
          key={index}
          ref={(el) => {
            barRefs.current[index] = el;
          }}
          x={bar.x}
          y={baselineY - bar.baseHeight}
          width={bar.width}
          height={bar.baseHeight}
          rx={resolvedRadius(bar)}
          fill={fill === 'solid' ? (bar.color ?? color) : `url(#${gradientId})`}
        >
          {showTooltips ? (
            <title>{`${bar.label ? `${bar.label}: ` : ''}${data[index]?.value ?? ''}`}</title>
          ) : null}
        </rect>
      ))}

      {showSegments && segmentLineWidth > 0 && segmentSize > 0 ? (
        <rect
          x={plot.x}
          y={plot.y}
          width={plot.width}
          height={plot.height}
          fill={`url(#${patternId})`}
          clipPath={`url(#${clipId})`}
          pointerEvents="none"
        />
      ) : null}
    </svg>
  );
}

export default EqualizerChart;
