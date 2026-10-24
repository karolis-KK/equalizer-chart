export { EqualizerChart } from './components/EqualizerChart';
export { default } from './components/EqualizerChart';
export type {
  EqualizerChartProps,
  EqualizerDatum,
  GradientStop,
  GradientConfig,
  FillMode,
  GradientDirection,
  AnimationMode,
  AxisAlign,
  AxisPosition,
  BarShape,
} from './types';
export {
  gradientColorAt,
  normalizeStops,
  parseColor,
  interpolateColor,
  toRgb,
} from './utils/color';
