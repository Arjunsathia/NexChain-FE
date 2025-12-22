import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useEffect, useRef, memo, useState, useMemo } from 'react';



function TradingViewWidget({ symbol = "BTCUSD" }) {
  const isLight = useThemeCheck();
  const container = useRef();
  
  
  const widgetOptions = useMemo(() => {
      const theme = isLight ? "light" : "dark";
      
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
    
    
    if (containerElement) {
      containerElement.innerHTML = '';
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": `BINANCE:${symbol.toUpperCase()}`,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": widgetOptions.theme, 
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "backgroundColor": widgetOptions.backgroundColor, 
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
  }, [symbol, widgetOptions]); 

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

export default memo(TradingViewWidget);