import { EqualizerChart } from '../src';
import type { EqualizerDatum } from '../src';

/**
 * Example 3 — "Rounded gradient"
 *
 * Rounded pillars with a smooth blue → purple → pink gradient and fine
 * segment lines — a softer, modern look.
 */
const roundedData: EqualizerDatum[] = Array.from({ length: 28 }, (_, i) => ({
  label: `${i + 1}`,
  value: 12 + Math.round(Math.abs(Math.sin(i * 0.45 + 1)) * 80),
}));

export function RoundedGradient() {
  return (
    <EqualizerChart
      data={roundedData}
      width={860}
      height={260}
      background="#131318"
      gradient={['#2563eb', '#7c3aed', '#db2777']}
      gap={5}
      barWidth={26}
      barShape="rounded"
      barRadius={8}
      showSegments
      segmentSize={8}
      segmentLineWidth={2}
      animation="wave"
      animationDuration={1000}
      animationAmplitude={0.1}
    />
  );
}

export default RoundedGradient;
