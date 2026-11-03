import useThemeCheck from "@/hooks/useThemeCheck";
import React, { useEffect, useRef, memo, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";

function TradingViewWidget({ symbol = "BTCUSD" }) {
  const isLight = useThemeCheck();
  const container = useRef();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const forceLandscape = isFullScreen && isMobile;

  const widgetOptions = useMemo(() => {
    const theme = isLight ? "light" : "dark";

    const backgroundColor =
      theme === "dark" ? "rgba(15, 15, 15, 0)" : "rgba(255, 255, 255, 0)";
    const gridColor =
      theme === "dark" ? "rgba(242, 242, 242, 0.06)" : "rgba(50, 50, 50, 0.1)";

    return {
      theme,
      backgroundColor,
      gridColor,
    };
  }, [isLight]);

  useEffect(() => {
    const containerElement = container.current;

    if (containerElement) {
      containerElement.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      symbol: `BINANCE:${symbol.toUpperCase()}`,
      interval: "D",
      timezone: "Etc/UTC",
      theme: widgetOptions.theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      hide_side_toolbar: isMobile ? !isFullScreen : !isFullScreen,
      hide_top_toolbar: false,
      hide_legend: isMobile && !isFullScreen, // Hide legend on mobile to save vertical space
      save_image: isFullScreen,
      backgroundColor: widgetOptions.backgroundColor,
      gridColor: widgetOptions.gridColor,
      support_host: "https://www.tradingview.com",
      withdateranges: !isMobile || isFullScreen, // Only show date ranges on desktop or mobile fullscreen
      details: isFullScreen && !isMobile, // Details take too much space on mobile
      hotlist: isFullScreen && !isMobile,
      container_id: "tradingview_chart",
    });

    if (containerElement) {
      containerElement.appendChild(script);
    }

    return () => {
      if (containerElement) {
        containerElement.innerHTML = "";
      }
    };
  }, [symbol, widgetOptions, isFullScreen, forceLandscape, isMobile]);

  const WidgetContent = (
    <div
      className={`tradingview-widget-container h-full w-full relative ${isFullScreen ? "bg-surface" : ""}`}
    >
      <div
        id="tradingview_chart"
        className="tradingview-widget-container__widget h-full w-full"
        ref={container}
      ></div>
      <button
        type="button"
        onClick={() => setIsFullScreen(!isFullScreen)}
        className={`absolute ${isMobile ? "top-[44px]" : "top-[5px]"} right-1.5 z-[100] grid size-8 place-items-center rounded-lg border border-line bg-surface text-fg-muted shadow-card transition-colors hover:bg-surface-hover hover:text-fg`}
        aria-label={isFullScreen ? "Exit full screen" : "Full screen"}
        title={isFullScreen ? "Exit full screen" : "Full screen"}
      >
        {isFullScreen ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </button>

    </div>
  );

  if (isFullScreen) {
    return ReactDOM.createPortal(
      <div
        className="fixed inset-0 z-[99999] bg-surface overflow-hidden animate-in fade-in duration-300"
      >
        <div
          className="relative transition-all duration-300 ease-in-out"
          style={forceLandscape ? {
            width: '100dvh',
            height: '100dvw',
            transform: 'translate(-50%, -50%) rotate(90deg)',
            transformOrigin: 'center center',
            position: 'absolute',
            left: '50%',
            top: '50%',
            background: "var(--surface)"
          } : {
            width: '100%',
            height: '100%'
          }}
        >
          {WidgetContent}
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div className="relative w-full h-full min-h-[350px] md:min-h-[500px]">{WidgetContent}</div>
  );
}

export default memo(TradingViewWidget);
