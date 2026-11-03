import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  createChart,
  AreaSeries,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  TickMarkType,
} from "lightweight-charts";
import { ChartCandlestick, ChartSpline, Maximize2, Minimize2, RotateCcw, SlidersHorizontal } from "lucide-react";
import { getCandles } from "@/api/coinApis";
import useBinanceStream from "@/hooks/useBinanceStream";
import useChartTheme from "@/hooks/useChartTheme";
import { getBinancePair } from "@/utils/coinRegistry";
import { Card } from "@/Components/ui/card";
import { Segmented } from "@/Components/ui/segmented";
import { Skeleton } from "@/Components/ui/skeleton";
import { Delta } from "@/Components/ui/delta";
import TradingViewWidget from "./TradingViewWidget";
import { formatCompact, formatPrice } from "@/utils/format";
import { cn } from "@/utils/utils";

// Binance interval/limit per range; CoinGecko picks its own candle size from `geckoDays`
const RANGES = [
  { value: "1D", label: "1D", interval: "5m", limit: 288, geckoDays: 1, span: "past 24h", intraday: true },
  { value: "1W", label: "1W", interval: "1h", limit: 168, geckoDays: 7, span: "past week", intraday: true },
  { value: "1M", label: "1M", interval: "4h", limit: 180, geckoDays: 30, span: "past month", intraday: true },
  { value: "3M", label: "3M", interval: "12h", limit: 180, geckoDays: 90, span: "past 3 months" },
  { value: "1Y", label: "1Y", interval: "1d", limit: 365, geckoDays: 365, span: "past year" },
  { value: "ALL", label: "All", interval: "1w", limit: 1000, geckoDays: "max", span: "all time" },
];

const TYPE_KEY = "nexchain:chart-type";
const readType = () => {
  try {
    const saved = localStorage.getItem(TYPE_KEY);
    return saved === "candles" || saved === "advanced" ? saved : "line";
  } catch {
    return "line";
  }
};

const precisionFor = (price) => (price >= 1 ? 2 : price >= 0.01 ? 4 : price >= 0.0001 ? 6 : 8);

const alpha = (hex, a) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const fmtDateTime = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtDate = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
const fmtMonth = new Intl.DateTimeFormat(undefined, { month: "short" });
const fmtDay = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });
const fmtClock = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

/** Axis labels in the viewer's time zone (the library works in UTC seconds) */
const tickMark = (time, type) => {
  const d = new Date(time * 1000);
  if (type === TickMarkType.Year) return String(d.getFullYear());
  if (type === TickMarkType.Month) return fmtMonth.format(d);
  if (type === TickMarkType.DayOfMonth) return fmtDay.format(d);
  return fmtClock.format(d);
};

const LegendValue = ({ label, value, className }) => (
  <span className="whitespace-nowrap">
    <span className="text-fg-subtle">{label}</span> <span className={cn("tabular font-medium text-fg", className)}>{value}</span>
  </span>
);

/**
 * The canvas chart: area line or candlesticks with a volume histogram along
 * the bottom. Owns the lightweight-charts instance; live bars arrive as props.
 */
const CandleCanvas = memo(function CandleCanvas({ candles, liveBar, type, intraday, resetSignal }) {
  const theme = useChartTheme();
  const elRef = useRef(null);
  const chartRef = useRef(null);
  const priceRef = useRef(null);
  const volumeRef = useRef(null);
  const lastTimeRef = useRef(0);
  const fittedRef = useRef(null);
  const byTimeRef = useRef(new Map());
  const [hoverTime, setHoverTime] = useState(null);

  // One chart per mount; series are swapped as the type or data change
  useEffect(() => {
    const chart = createChart(elRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",
        fontSize: 11,
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false, tickMarkFormatter: tickMark },
      crosshair: { mode: CrosshairMode.Normal },
      handleScale: { axisPressedMouseMove: { time: true, price: false } },
    });
    chartRef.current = chart;
    const onMove = (param) => setHoverTime(param.point && param.time ? param.time : null);
    chart.subscribeCrosshairMove(onMove);
    return () => {
      chart.unsubscribeCrosshairMove(onMove);
      chart.remove();
      chartRef.current = priceRef.current = volumeRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.applyOptions({
      localization: { timeFormatter: (t) => (intraday ? fmtDateTime : fmtDate).format(t * 1000) },
    });
  }, [intraday]);

  // Theme colors come from the CSS tokens, so they follow light/dark mode
  useEffect(() => {
    chartRef.current?.applyOptions({
      layout: { textColor: theme.axis },
      grid: { vertLines: { color: theme.grid }, horzLines: { color: theme.grid } },
      crosshair: {
        vertLine: { color: theme.axis, style: LineStyle.Dashed, labelBackgroundColor: theme.text },
        horzLine: { color: theme.axis, style: LineStyle.Dashed, labelBackgroundColor: theme.text },
      },
    });
  }, [theme]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !candles.length) return;
    if (priceRef.current) chart.removeSeries(priceRef.current);
    if (volumeRef.current) chart.removeSeries(volumeRef.current);
    priceRef.current = volumeRef.current = null;

    const last = candles[candles.length - 1];
    const precision = precisionFor(last.close);
    // Thousands separators on the axis and the last-price label
    const priceFormat = {
      type: "custom",
      minMove: 1 / 10 ** precision,
      formatter: (p) => p.toLocaleString("en-US", { minimumFractionDigits: precision, maximumFractionDigits: precision }),
    };

    if (type === "candles") {
      priceRef.current = chart.addSeries(CandlestickSeries, {
        upColor: theme.up,
        downColor: theme.down,
        wickUpColor: theme.up,
        wickDownColor: theme.down,
        borderVisible: false,
        priceFormat,
        priceLineStyle: LineStyle.Dashed,
      });
      priceRef.current.setData(candles);
    } else {
      const color = last.close >= candles[0].open ? theme.up : theme.down;
      priceRef.current = chart.addSeries(AreaSeries, {
        lineColor: color,
        topColor: alpha(color, 0.24),
        bottomColor: alpha(color, 0),
        lineWidth: 2,
        priceFormat,
        priceLineStyle: LineStyle.Dashed,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: theme.surface,
        crosshairMarkerBackgroundColor: color,
      });
      priceRef.current.setData(candles.map((c) => ({ time: c.time, value: c.close })));
    }

    const hasVolume = candles[0].volume != null;
    if (hasVolume) {
      volumeRef.current = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
        lastValueVisible: false,
        priceLineVisible: false,
      });
      chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.84, bottom: 0 }, visible: false });
      volumeRef.current.setData(
        candles.map((c) => ({ time: c.time, value: c.volume, color: alpha(c.close >= c.open ? theme.up : theme.down, 0.32) })),
      );
    }
    chart.priceScale("right").applyOptions({ scaleMargins: { top: 0.08, bottom: hasVolume ? 0.2 : 0.06 } });

    byTimeRef.current = new Map(candles.map((c) => [c.time, c]));
    lastTimeRef.current = last.time;
    // Re-fit only for new data, not when just the colors or type changed
    if (fittedRef.current !== candles) {
      chart.timeScale().fitContent();
      fittedRef.current = candles;
    }
  }, [candles, type, theme]);

  useEffect(() => {
    if (!liveBar || !priceRef.current || liveBar.time < lastTimeRef.current) return;
    priceRef.current.update(type === "candles" ? liveBar : { time: liveBar.time, value: liveBar.close });
    volumeRef.current?.update({
      time: liveBar.time,
      value: liveBar.volume,
      color: alpha(liveBar.close >= liveBar.open ? theme.up : theme.down, 0.32),
    });
    byTimeRef.current.set(liveBar.time, liveBar);
    lastTimeRef.current = liveBar.time;
  }, [liveBar, type, theme]);

  useEffect(() => {
    if (resetSignal) chartRef.current?.timeScale().fitContent();
  }, [resetSignal]);

  const latest = liveBar && liveBar.time >= (candles[candles.length - 1]?.time ?? 0) ? liveBar : candles[candles.length - 1];
  const bar = (hoverTime != null && byTimeRef.current.get(hoverTime)) || latest;
  const barUp = bar ? bar.close >= bar.open : true;

  return (
    <div className="relative h-full w-full">
      <div ref={elRef} className="h-full w-full" />
      {bar && (
        <div className="pointer-events-none absolute top-1 left-1 z-10 flex max-w-[calc(100%-72px)] flex-wrap items-center gap-x-3 gap-y-0.5 rounded-md bg-surface/80 px-1.5 py-1 text-[11px] backdrop-blur-sm">
          <span className="font-medium text-fg-muted">{(intraday ? fmtDateTime : fmtDate).format(bar.time * 1000)}</span>
          {type === "candles" ? (
            <>
              <LegendValue label="O" value={formatPrice(bar.open)} />
              <LegendValue label="H" value={formatPrice(bar.high)} />
              <LegendValue label="L" value={formatPrice(bar.low)} />
              <LegendValue label="C" value={formatPrice(bar.close)} className={barUp ? "text-up" : "text-down"} />
              {bar.open > 0 && <Delta value={((bar.close - bar.open) / bar.open) * 100} className="text-[11px]" />}
            </>
          ) : (
            <LegendValue label="Price" value={formatPrice(bar.close)} />
          )}
          {bar.volume != null && <LegendValue label="Vol" value={`$${formatCompact(bar.volume)}`} />}
        </div>
      )}
    </div>
  );
});

const TYPES = [
  { value: "line", label: <span className="inline-flex items-center gap-1.5"><ChartSpline size={14} />Line</span> },
  { value: "candles", label: <span className="inline-flex items-center gap-1.5"><ChartCandlestick size={14} />Candles</span> },
];
const ADVANCED = {
  value: "advanced",
  label: <span className="inline-flex items-center gap-1.5"><SlidersHorizontal size={14} />Advanced</span>,
};

const IconButton = ({ label, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="grid size-8 place-items-center rounded-lg border border-line text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
  >
    {children}
  </button>
);

/**
 * Coin page price chart: line or candlesticks over six ranges, with volume,
 * an OHLC legend that follows the crosshair, live updates from Binance and a
 * full-screen mode. "Advanced" switches to the TradingView widget for indicators
 * and drawing tools.
 */
export default function PriceChart({ coinId, symbol }) {
  const [type, setType] = useState(readType);
  const [rangeKey, setRangeKey] = useState("1D");
  const [fullscreen, setFullscreen] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [liveBar, setLiveBar] = useState(null);
  const range = RANGES.find((r) => r.value === rangeKey);
  const pair = getBinancePair(coinId, symbol);
  const types = pair ? [...TYPES, ADVANCED] : TYPES;
  const activeType = type === "advanced" && !pair ? "line" : type;

  const selectType = (value) => {
    setType(value);
    try {
      localStorage.setItem(TYPE_KEY, value);
    } catch {
      // the choice just won't be remembered
    }
  };

  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useQuery({
    queryKey: ["candles", coinId, rangeKey],
    queryFn: () => getCandles(coinId, symbol, range),
    enabled: !!coinId && activeType !== "advanced",
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    retry: 1,
  });
  const candles = useMemo(() => data?.candles || [], [data]);

  // Live candle for the selected interval; Binance pushes the forming bar about once a second
  const streaming = activeType !== "advanced" && data?.source === "binance" && !isPlaceholderData;
  useEffect(() => setLiveBar(null), [coinId, rangeKey]);
  const status = useBinanceStream(streaming ? `${pair.toLowerCase()}@kline_${range.interval}` : null, (msg) => {
    const k = msg.k;
    if (!k) return;
    setLiveBar({ time: Math.floor(k.t / 1000), open: +k.o, high: +k.h, low: +k.l, close: +k.c, volume: +k.q });
  });

  const summary = useMemo(() => {
    if (!candles.length) return null;
    const live = liveBar && !isPlaceholderData && liveBar.time >= candles[candles.length - 1].time ? liveBar : null;
    const all = live ? [...candles, live] : candles;
    const last = all[all.length - 1].close;
    return {
      change: candles[0].open ? ((last - candles[0].open) / candles[0].open) * 100 : null,
      high: Math.max(...all.map((c) => c.high)),
      low: Math.min(...all.map((c) => c.low)),
    };
  }, [candles, liveBar, isPlaceholderData]);

  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = (e) => e.key === "Escape" && setFullscreen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  const advanced = activeType === "advanced";

  const card = (
    <Card
      className={cn("flex flex-col", fullscreen && "rounded-none border-0")}
      // Inline, because .premium-card's unlayered `position: relative` beats the `fixed` utility
      style={fullscreen ? { position: "fixed", inset: 0, zIndex: 3000 } : undefined}
      aria-label="Price chart"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
        <Segmented label="Chart type" options={types} value={activeType} onChange={selectType} />
        {!advanced && (
          <div className="flex items-center gap-1.5">
            <Segmented label="Time range" options={RANGES} value={rangeKey} onChange={setRangeKey} />
            <IconButton label="Reset zoom" onClick={() => setResetSignal((n) => n + 1)}>
              <RotateCcw size={14} />
            </IconButton>
            <IconButton label={fullscreen ? "Exit full screen" : "Full screen"} onClick={() => setFullscreen((v) => !v)}>
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </IconButton>
          </div>
        )}
      </div>

      {!advanced && (
        <div className="flex min-h-6 flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-3 text-xs">
          {summary ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-fg-subtle">
                <Delta value={summary.change} pill /> {range.span}
              </span>
              <span className="text-fg-subtle">
                High <span className="tabular font-medium text-fg">{formatPrice(summary.high)}</span>
              </span>
              <span className="text-fg-subtle">
                Low <span className="tabular font-medium text-fg">{formatPrice(summary.low)}</span>
              </span>
            </>
          ) : (
            <Skeleton className="h-5 w-56" />
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-fg-subtle" role="status">
            {streaming && status === "live" ? (
              <>
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-up" />
                </span>
                Live · Binance
              </>
            ) : data?.source === "coingecko" ? (
              "CoinGecko · updates every few minutes"
            ) : null}
          </span>
        </div>
      )}

      <div
        className={cn(
          "relative px-2 pt-2 pb-3 sm:px-3",
          fullscreen ? "min-h-0 flex-1" : advanced ? "h-[460px] sm:h-[560px]" : "h-[380px] sm:h-[460px]",
        )}
      >
        {advanced ? (
          <div className="h-full overflow-hidden rounded-lg">
            <TradingViewWidget symbol={pair.toUpperCase()} />
          </div>
        ) : isLoading ? (
          <Skeleton className="h-full w-full rounded-lg" />
        ) : isError || !candles.length ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="text-sm font-medium text-fg">Chart data is unavailable right now</p>
              <p className="mt-1 text-xs text-fg-subtle">The market-data provider may be busy. Try again in a moment.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-surface-hover"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <>
            {isFetching && isPlaceholderData && (
              <div className="absolute inset-x-3 top-0 z-20 h-0.5 animate-pulse rounded-full bg-brand" aria-hidden="true" />
            )}
            <CandleCanvas
              candles={candles}
              liveBar={isPlaceholderData ? null : liveBar}
              type={activeType}
              intraday={!!range.intraday}
              resetSignal={resetSignal}
            />
          </>
        )}
      </div>
    </Card>
  );

  // Out of the page's stacking contexts; a placeholder holds the layout meanwhile
  if (fullscreen) {
    return (
      <>
        <div className="h-[480px] rounded-xl border border-dashed border-line sm:h-[560px]" aria-hidden="true" />
        {createPortal(card, document.body)}
      </>
    );
  }
  return card;
}
