import useThemeCheck from "@/hooks/useThemeCheck";
import React, { useEffect, useRef, memo, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";

function TradingViewWidget({ symbol = "BTCUSD" }) {
  const isLight = useThemeCheck();
  const container = useRef();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [forceLandscape, setForceLandscape] = useState(false);

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
  }, [symbol, widgetOptions, isFullScreen]);

  const WidgetContent = (
    <div
      className={`tradingview-widget-container h-full w-full relative ${isFullScreen ? "bg-white dark:bg-[#0f111a]" : ""}`}
    >
      <div
        id="tradingview_chart"
        className="tradingview-widget-container__widget h-full w-full"
        ref={container}
      ></div>
      <button
        onClick={() => setIsFullScreen(!isFullScreen)}
        className={`absolute ${isMobile ? 'bottom-4 right-4' : 'top-4 right-4'} z-[20] flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-medium text-xs backdrop-blur-md ${isLight
          ? "bg-white/90 hover:bg-white text-gray-800 shadow-lg border border-gray-200"
          : "bg-[#1e222d]/90 hover:bg-[#2a2e39] text-gray-100 border border-white/10 shadow-2xl"
          }`}
        title={isFullScreen ? "Exit Fullscreen" : "Fill Screen"}
      >
        {isFullScreen ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </button>

      {isFullScreen && isMobile && (
        <button
          onClick={() => setForceLandscape(!forceLandscape)}
          className={`absolute bottom-4 left-4 z-[20] flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-medium text-xs backdrop-blur-md ${isLight
            ? "bg-white/90 hover:bg-white text-gray-800 shadow-lg border border-gray-200"
            : "bg-[#1e222d]/90 hover:bg-[#2a2e39] text-gray-100 border border-white/10 shadow-2xl"
            }`}
          title="Force Landscape"
        >
          <RotateCcw className={`w-4 h-4 transition-transform ${forceLandscape ? 'rotate-90' : ''}`} />
          <span>{forceLandscape ? "Portrait" : "Landscape"}</span>
        </button>
      )}
    </div>
  );

  if (isFullScreen) {
    return ReactDOM.createPortal(
      <div
        className={`fixed inset-0 z-[99999] bg-white dark:bg-[#0f111a] w-screen h-screen overflow-hidden animate-in fade-in duration-300 ${forceLandscape ? 'flex items-center justify-center p-0 md:p-0' : ''}`}
      >
        <div
          className={`w-full h-full transition-all duration-500 ease-in-out ${forceLandscape ? 'landscape-mobile-view' : ''}`}
          style={forceLandscape ? {
            width: '100vh',
            height: '100vw',
            transform: 'rotate(90deg)',
            transformOrigin: 'center center'
          } : {}}
        >
          {WidgetContent}
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px]">{WidgetContent}</div>
  );
}

export default memo(TradingViewWidget);
