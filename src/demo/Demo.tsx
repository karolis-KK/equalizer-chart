import { useState, type ReactElement } from "react";
import { EqualizerChart } from "../index";
import type { EqualizerDatum } from "../index";
import { WeeklyChart } from "../../examples/WeeklyChart";
import { DenseEqualizer } from "../../examples/DenseEqualizer";
import { RoundedGradient } from "../../examples/RoundedGradient";

const PLAYGROUND: EqualizerDatum[] = Array.from({ length: 16 }, (_, i) => ({
  label: `P${i + 1}`,
  value: 20 + Math.round(Math.abs(Math.sin(i * 0.8)) * 70),
}));

export function Demo(): ReactElement {
  const [gap, setGap] = useState(6);
  const [radius, setRadius] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [animated, setAnimated] = useState(true);
  const [animation, setAnimation] = useState<"wave" | "random" | "none">(
    "wave",
  );
  const [fill, setFill] = useState<"gradient" | "solid">("gradient");
  const [showXAxis, setShowXAxis] = useState(true);
  const [showYAxis, setShowYAxis] = useState(true);
  const [showSegments, setShowSegments] = useState(true);
  const [segmentSize, setSegmentSize] = useState(14);
  const [xAlign, setXAlign] = useState<"start" | "center" | "end">("center");
  const [yAlign, setYAlign] = useState<"start" | "center" | "end">("center");
  const [showColumnLabels, setShowColumnLabels] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="demo">
      <h1>equalizer-chart</h1>
      <p className="subtitle">
        A lightweight equalizer-style bar chart for React. Animated on load,
        then still.
      </p>

      <h1
        className="examples-header"
        style={{
          marginBottom: "40px",
        }}
      >
        Examples
      </h1>
      <section>
        <h2>Weekly Chart</h2>
        <p className="description">
          A multi-colour vertical gradient with segmented pillars and axis labels.
        </p>
        <div className="chart-card">
          <div key={`weekly-${replayKey}`}>
            <WeeklyChart />
          </div>
        </div>
      </section>

      <section>
        <h2>Dense chart</h2>
        <p className="description">
          Many narrow bars
        </p>
        <div className="chart-card">
          <div key={`dense-${replayKey}`}>
            <DenseEqualizer />
          </div>
        </div>
      </section>

      <section>
        <h2>Rounded borders</h2>
        <p className="description">
          Rounded pillars
        </p>
        <div className="chart-card">
          <div key={`rounded-${replayKey}`}>
            <RoundedGradient />
          </div>
        </div>
      </section>

      <section>
        <h2>Playground</h2>
        <p className="description">
          Customize the chart
        </p>
        <div className="chart-card">
          <EqualizerChart
            key={`playground-${replayKey}`}
            data={PLAYGROUND}
            width={760}
            height={260}
            background="#111118"
            gradient={["#3b82f6", "#a855f7", "#ec4899"]}
            gap={gap}
            barWidth={barWidth || undefined}
            barRadius={radius}
            fill={fill}
            animated={animated}
            animation={animation}
            animationDuration={1000}
            animationAmplitude={0.12}
            showSegments={showSegments}
            segmentSize={segmentSize}
            showXAxis={showXAxis}
            showYAxis={showYAxis}
            xAxisLabel="samples"
            yAxisLabel="level"
            xAxisAlign={xAlign}
            yAxisAlign={yAlign}
            showColumnLabels={showColumnLabels}
            axisColor="#9ca3af"
          />
          <div className="controls">
            <label>
              Gap (px)
              <input
                type="number"
                min={0}
                max={40}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
              />
            </label>
            <label>
              Bar radius (px)
              <input
                type="number"
                min={0}
                max={24}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </label>
            <label>
              Bar width (0 = auto)
              <input
                type="number"
                min={0}
                max={80}
                value={barWidth}
                onChange={(e) => setBarWidth(Number(e.target.value))}
              />
            </label>
            <label>
              Segment size (px)
              <input
                type="number"
                min={4}
                max={40}
                value={segmentSize}
                onChange={(e) => setSegmentSize(Number(e.target.value))}
              />
            </label>
            <label>
              Animation
              <select
                value={animation}
                onChange={(e) =>
                  setAnimation(e.target.value as "wave" | "random" | "none")
                }
              >
                <option value="wave">wave</option>
                <option value="random">random</option>
                <option value="none">none</option>
              </select>
            </label>
            <label>
              Fill
              <select
                value={fill}
                onChange={(e) =>
                  setFill(e.target.value as "gradient" | "solid")
                }
              >
                <option value="gradient">gradient</option>
                <option value="solid">solid</option>
              </select>
            </label>
            <label>
              Animated
              <input
                type="checkbox"
                checked={animated}
                onChange={(e) => setAnimated(e.target.checked)}
              />
            </label>
            <label>
              Segments
              <input
                type="checkbox"
                checked={showSegments}
                onChange={(e) => setShowSegments(e.target.checked)}
              />
            </label>
            <label>
              X axis
              <input
                type="checkbox"
                checked={showXAxis}
                onChange={(e) => setShowXAxis(e.target.checked)}
              />
            </label>
            <label>
              Y axis
              <input
                type="checkbox"
                checked={showYAxis}
                onChange={(e) => setShowYAxis(e.target.checked)}
              />
            </label>
            <label>
              Column labels
              <input
                type="checkbox"
                checked={showColumnLabels}
                onChange={(e) => setShowColumnLabels(e.target.checked)}
              />
            </label>
            <label>
              X align
              <select
                value={xAlign}
                onChange={(e) =>
                  setXAlign(e.target.value as "start" | "center" | "end")
                }
              >
                <option value="start">start</option>
                <option value="center">center</option>
                <option value="end">end</option>
              </select>
            </label>
            <label>
              Y align
              <select
                value={yAlign}
                onChange={(e) =>
                  setYAlign(e.target.value as "start" | "center" | "end")
                }
              >
                <option value="start">start</option>
                <option value="center">center</option>
                <option value="end">end</option>
              </select>
            </label>
            <label>
              &nbsp;
              <button type="button" onClick={() => setReplayKey((k) => k + 1)}>
                Replay animation
              </button>
            </label>
          </div>
          <p className="hint">
            The animation plays once for one second on load, then stops on the
            real data. Click "Replay animation" to see it again.
          </p>
        </div>
      </section>
    </div>
  );
}
