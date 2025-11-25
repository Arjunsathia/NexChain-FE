import React, { useEffect, useRef, memo, useState, useMemo } from 'react';

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            // Check if 'dark' class is present on the document element
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        // Observe changes to the 'class' attribute of the document element
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

function TradingViewWidget({ symbol = "BTCUSD" }) {
  const isLight = useThemeCheck();
  const container = useRef();
  
  // Memoize theme-dependent options
  const widgetOptions = useMemo(() => {
      const theme = isLight ? "light" : "dark";
      // Transparent black/dark background for dark theme, transparent white/light for light theme
      const backgroundColor = theme === "dark" ? "rgba(15, 15, 15, 0)" : "rgba(255, 255, 255, 0)";
      const gridColor = theme === "dark" ? "rgba(242, 242, 242, 0.06)" : "rgba(50, 50, 50, 0.1)";

      return {
          theme,
          backgroundColor,
          gridColor,
      };
  }, [isLight]);

  useEffect(() => {
    const containerElement = container.current;
    
    // Clear previous widget
    if (containerElement) {
      containerElement.innerHTML = '';
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    // Inject dynamic options based on the theme
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": `BINANCE:${symbol.toUpperCase()}`,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": widgetOptions.theme, // Dynamic theme
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "backgroundColor": widgetOptions.backgroundColor, // Dynamic background
      "gridColor": widgetOptions.gridColor,
      "support_host": "https://www.tradingview.com"
    });

    if (containerElement) {
      containerElement.appendChild(script);
    }

    return () => {
      if (containerElement) {
        containerElement.innerHTML = '';
      }
    };
  }, [symbol, widgetOptions]); // Re-run effect when symbol or widgetOptions change

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

export default memo(TradingViewWidget);