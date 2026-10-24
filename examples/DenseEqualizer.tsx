import { EqualizerChart } from '../src';
import type { EqualizerDatum } from '../src';

/**
 * Example 2 — "Dense equalizer"
 *
 * Many narrow bars with a warm orange gradient and a lively random animation,
 * mimicking a real audio equalizer.
 */
const denseData: EqualizerDatum[] = Array.from({ length: 40 }, (_, i) => ({
  label: `b${i + 1}`,
  value: 20 + Math.round(Math.abs(Math.sin(i * 0.62)) * 78),
}));

export function DenseEqualizer() {
  return (
    <EqualizerChart
      data={denseData}
      width={860}
      height={240}
      background="#1a0d08"
      gradient={['#7f1d1d', '#b45309', '#f59e0b', '#fde68a']}
      gap={3}
      barWidth={17}
      barRadius={1}
      showSegments
      segmentSize={10}
      segmentLineWidth={2}
      animation="random"
      animationDuration={1000}
      animationAmplitude={0.2}
    />
  );
}

export default DenseEqualizer;
