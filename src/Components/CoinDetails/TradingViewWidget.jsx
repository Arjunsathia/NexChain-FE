import useThemeCheck from "@/hooks/useThemeCheck";
import React, { useEffect, useRef, memo, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { Maximize2, Minimize2 } from "lucide-react";

function TradingViewWidget({ symbol = "BTCUSD" }) {
  const isLight = useThemeCheck();
  const container = useRef();
  const [isFullScreen, setIsFullScreen] = useState(false);

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
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      backgroundColor: widgetOptions.backgroundColor,
      gridColor: widgetOptions.gridColor,
      support_host: "https://www.tradingview.com",
    });

    if (containerElement) {
      containerElement.appendChild(script);
    }

    return () => {
      if (containerElement) {
        containerElement.innerHTML = "";
      }
    };
  }, [symbol, widgetOptions, isFullScreen]);

  const WidgetContent = (
    <div
      className={`tradingview-widget-container h-full w-full relative ${isFullScreen ? "bg-white dark:bg-[#0f111a]" : ""}`}
      ref={container}
    >
      <div className="tradingview-widget-container__widget h-full w-full"></div>
      <button
        onClick={() => setIsFullScreen(!isFullScreen)}
        className={`absolute top-4 right-20 z-10 p-2 rounded-lg transition-all ${isLight
            ? "bg-white/80 hover:bg-white text-gray-700 shadow-sm border border-gray-200"
            : "bg-black/50 hover:bg-black/80 text-gray-200 border border-white/10"
          }`}
        title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullScreen ? (
          <Minimize2 className="w-5 h-5" />
        ) : (
          <Maximize2 className="w-5 h-5" />
        )}
      </button>
    </div>
  );

  if (isFullScreen) {
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[99999] bg-white dark:bg-[#0f111a] w-screen h-screen overflow-hidden animate-in fade-in duration-300">
        {WidgetContent}
      </div>,
      document.body,
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px]">{WidgetContent}</div>
  );
}

export default memo(TradingViewWidget);
