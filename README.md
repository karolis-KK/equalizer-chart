# equalizer-chart

A lightweight React bar chart styled like a music equalizer.

- No runtime dependencies (React is a peer dependency)
- ESM + CommonJS + TypeScript types
- ~4 kB gzipped
- Respects `prefers-reduced-motion`

<img width="966" height="600" alt="image" src="https://github.com/user-attachments/assets/f48de8d3-ff05-4fff-b8a4-753f9aab3054" />

---

## About

`equalizer-chart` renders data as vertical columns colored with a gradient and overlaid with horizontal lines, so the chart looks like a real equalizer/waveform bar. When the page loads, the bars play a single ~1 second pulse animation
(`wave` or `random`) and then stop on their true values.

Everything is inline SVG.

---

## Installation

```bash
npm install equalizer-chart
```

`react` and `react-dom` (`>=17`) must already be installed.

---

## Setup

1. Install the package (above).
2. Render the chart anywhere in your React tree:

```tsx
import { EqualizerChart } from 'equalizer-chart';

const data = [
  { label: 'Mon', value: 52 },
  { label: 'Tue', value: 44 },
  { label: 'Wed', value: 30 },
];

export function App() {
  return <EqualizerChart data={data} width={600} height={280} />;
}
```

That's it.

### Next.js

The component animates on the client, so make sure to import it inside a client component:

```tsx
'use client';
import { EqualizerChart } from 'equalizer-chart';
```

Server-side rendering works out of the box. The animation starts after mount.

---

## Animation

By default the animation plays **once** for one second, easing into the real
data, then stops.

```tsx
// Default: play once for 1s, then show real data
<EqualizerChart data={data} />

// Tune the duration / intensity
<EqualizerChart data={data} animationDuration={1000} animationAmplitude={0.2} />

// Random order, like a live audio meter
<EqualizerChart data={data} animation="random" />

// No animation at all
<EqualizerChart data={data} animation="none" />
```

| Prop | Default | Description |
| --- | --- | --- |
| `animation` | `'wave'` | `'wave'`, `'random'`, or `'none'`. |
| `animationDuration` | `1000` | How long the one-time animation lasts (ms). |
| `animationAmplitude` | `0.08` | Pulse strength as a fraction of bar height. |
| `animated` | `true` | Master on/off switch. |
| `animationLoop` | `false` | Set `true` to loop forever. |

Users with `prefers-reduced-motion: reduce` see the static chart immediately.

---

## Examples

Three examples matching the library's reference designs, in `examples/`:

- `WeeklyChart.tsx` — multi-colour gradient with axis labels
- `DenseEqualizer.tsx` — many narrow bars, warm palette, random animation
- `RoundedGradient.tsx` — rounded pillars, blue → purple → pink

Run them with the interactive playground:

```bash
npm install
npm run dev
```

---

## Props

### Data

```ts
interface EqualizerDatum {
  label?: string;   // accessible name / tooltip
  value: number;    // the bar's value
  color?: string;   // per-bar colour (solid fill only)
  radius?: number;  // per-bar corner radius
}
```

### Options

| Prop | Type | Default |
| --- | --- | --- |
| `data` | `EqualizerDatum[]` | required |
| `width` / `height` | `number` | `600` / `300` |
| `background` | `string` | `'transparent'` |
| `fill` | `'gradient' \| 'solid'` | `'gradient'` |
| `color` | `string` | `'#22c55e'` |
| `gradient` | `string[] \| GradientConfig` | green → pink |
| `gradientDirection` | `'vertical' \| 'horizontal'` | `'vertical'` |
| `gap` | `number` | `6` |
| `barWidth` | `number` | auto |
| `barRadius` | `number` | `0` |
| `barShape` | `'rect' \| 'rounded'` | `'rect'` |
| `borderRadius` | `number` | `0` |
| `padding` | `number` | `0` |
| `minValue` / `maxValue` | `number` | `0` / auto |
| `showXAxis` / `showYAxis` | `boolean` | `false` |
| `xAxisLabel` / `yAxisLabel` | `string` | — |
| `xAxisPosition` / `yAxisPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` / `'left'` |
| `xAxisAlign` / `yAxisAlign` | `'start' \| 'center' \| 'end'` | `'center'` |
| `showColumnLabels` | `boolean` | `false` |
| `columnLabelFontSize` | `number` | `12` |
| `columnLabelColor` | `string` | `axisColor` |
| `axisFontSize` | `number` | `14` |
| `axisColor` | `string` | `'currentColor'` |
| `axisFontWeight` | `number \| string` | `500` |
| `showSegments` | `boolean` | `true` |
| `segmentSize` | `number` | `14` |
| `segmentLineWidth` | `number` | `2` |
| `segmentLineColor` | `string` | chart background |
| `segmentLineOpacity` | `number` | `1` |
| `showTooltips` | `boolean` | `false` |
| `showValues` | `boolean` | `false` |
| `valueFontSize` | `number` | `12` |
| `valueColor` | `string` | `axisColor` |
| `className` / `style` | — | — |
| `ariaLabel` | `string` | `'equalizer chart'` |

### Gradients

Pass an array of colours (evenly spaced, bottom to top):

```tsx
gradient={['#22c55e', '#facc15', '#f97316', '#ef4444', '#ec4899']}
```

Or take full control of the stops:

```tsx
gradient={{
  stops: [
    { color: '#2563eb', offset: 0 },
    { color: '#db2777', offset: 1 },
  ],
  fixed: true, // gradient spans the whole chart (default)
}}
```

With `fixed: false`, each bar gets its own gradient from base to tip.

---

## Column labels

Every datum has an optional `label`. Turn on `showColumnLabels` to display it
under its bar:

```tsx
const data = [
  { label: 'Mon', value: 52 },
  { label: 'Tue', value: 44 },
  { label: 'Wed', value: 30 },
];

<EqualizerChart data={data} showColumnLabels />
```

Style them independently of the axis:

```tsx
<EqualizerChart
  data={data}
  showColumnLabels
  columnLabelFontSize={11}
  columnLabelColor="#9ca3af"
/>
```

If a bottom x-axis label is also shown, the column labels sit directly under
the bars and the axis label moves below them, meaning no overlap. Bars without a
`label` simply render no text.

---

## Axis label placement

`xAxisPosition` / `yAxisPosition` choose which edge the label is on.
`xAxisAlign` / `yAxisAlign` choose where it sits along that edge:

| Value | X axis (bottom/top) | Y axis (left/right) |
| --- | --- | --- |
| `'start'` | left edge | bottom edge |
| `'center'` | middle (default) | middle (default) |
| `'end'` | right edge | top edge |

```tsx
<EqualizerChart
  data={data}
  showXAxis
  showYAxis
  xAxisLabel="week"
  yAxisLabel="reviews"
  xAxisPosition="bottom"
  yAxisPosition="left"
  xAxisAlign="end"   // right-aligned along the bottom
  yAxisAlign="start" // bottom-aligned on the left edge
/>
```

Rotated (left/right) labels read bottom-to-top, so `'start'` is the bottom of
the axis and `'end'` is the top. Labels are anchored to their own edge, so long
text never spills outside the chart.

---

## Showing values

There are two independent ways to surface each column's value:

```tsx
// 1. Visible number above every bar
<EqualizerChart data={data} showValues />

// 2. Native tooltip on hover (browser-rendered)
<EqualizerChart data={data} showTooltips />
```

They can be combined. Value labels track their bar during the on-load
animation and the chart reserves top space so the tallest bar's label is never
clipped.

Style them with `valueFontSize` and `valueColor` (defaults to `axisColor`):

```tsx
<EqualizerChart
  data={data}
  showValues
  valueFontSize={11}
  valueColor="#e5e7eb"
/>
```

Prefer `showTooltips` for dense
data and `showValues` for a handful of columns.

---

## Development

```bash
npm install
npm run dev        # playground at http://localhost:5173
npm run test
npm run typecheck
npm run build      # ESM + CJS + .d.ts into dist/
```

## License

MIT
