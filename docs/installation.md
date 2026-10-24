# Installation & Setup

## Install

```bash
npm install equalizer-chart
```

React 17 or newer is required as a peer dependency:

```bash
npm install react react-dom
```

## Use it

```tsx
import { EqualizerChart } from 'equalizer-chart';

export function App() {
  return (
    <EqualizerChart
      data={[
        { label: 'Mon', value: 52 },
        { label: 'Tue', value: 44 },
        { label: 'Wed', value: 30 },
      ]}
      width={600}
      height={280}
    />
  );
}
```

The chart plays a one-second animation on load, then displays the real data.

## next.js

```tsx
'use client';
import { EqualizerChart } from 'equalizer-chart';
```

## Styling

No CSS to import — everything is inline SVG. Use `className` / `style` to fit
the chart into your layout:

```tsx
<EqualizerChart data={data} className="my-chart" style={{ marginTop: 24 }} />
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Cannot find module 'equalizer-chart'` | Re-run the install and restart your dev server. |
| Types not resolving | Use `"moduleResolution": "bundler"` or `"node16"` in `tsconfig.json`. |
| Animation not playing | Check `animated` isn't `false` and `animation` isn't `'none'`; also note reduced-motion users skip it. |
| Animation repeats forever | Set `animationLoop={false}` (the default) or remove `animationLoop`. |
