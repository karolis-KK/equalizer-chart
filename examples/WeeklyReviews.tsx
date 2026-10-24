import { EqualizerChart } from '../src';
import type { EqualizerDatum } from '../src';

const weeklyData: EqualizerDatum[] = [
  { label: 'Mon', value: 52 },
  { label: 'Tue', value: 44 },
  { label: 'Wed', value: 30 },
  { label: 'Thu', value: 58 },
  { label: 'Fri', value: 36 },
  { label: 'Sat', value: 62 },
  { label: 'Sun', value: 48 },
];

export function WeeklyChart() {
  return (
    <EqualizerChart
      data={weeklyData}
      width={640}
      height={280}
      background="#16161d"
      gradient={['#22c55e', '#facc15', '#f97316', '#ef4444', '#ec4899']}
      gap={10}
      barWidth={54}
      showSegments
      segmentSize={16}
      segmentLineWidth={2}
      showColumnLabels
      xAxisLabel="week"
      yAxisLabel="reviews"
      axisColor="#f3f4f6"
      axisFontSize={20}
      animation="wave"
      animationDuration={1000}
    />
  );
}

export default WeeklyChart;
