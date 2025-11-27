import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

const OrderBook = memo(({ symbol = 'btcusdt' }) => {
  const isLight = useThemeCheck();
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [activeTab, setActiveTab] = useState('all');
  const ws = useRef(null);
  const maxVolumeRef = useRef(0);

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",

    bgCard: isLight ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none" : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
    borderHeader: isLight ? "border-gray-300/50" : "border-gray-700/50",

    // Header/Title
    headerGradient: "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent",
    
    // Tab Bar
    bgTabBar: isLight ? "bg-gray-100/50" : "bg-gray-900/50",
    textTabInactive: isLight ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white",
    bgTabActiveCyan: "bg-cyan-600 text-white",
    bgTabActiveGreen: "bg-green-600 text-white",
    bgTabActiveRed: "bg-red-600 text-white",

    // Row Colors
    bgBidVolume: isLight ? "bg-green-500/10" : "bg-green-500/10",
    bgAskVolume: isLight ? "bg-red-500/10" : "bg-red-500/10",
    textBidPrice: isLight ? "text-green-700" : "text-green-400",
    textAskPrice: isLight ? "text-red-700" : "text-red-400",
    textAmount: isLight ? "text-gray-800" : "text-gray-300",
    textTotal: isLight ? "text-gray-500" : "text-gray-400",

    // Spread Separator
    bgSpread: isLight ? "bg-gray-100/50 border-gray-300/50" : "bg-gray-900/50 border-gray-700/50",
    textSpreadValue: isLight ? "text-blue-600" : "text-cyan-400",
    
  }), [isLight]);


  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.bids && data.asks) {
          const newBids = data.bids.slice(0, 10).map(([price, volume]) => ({
            price: parseFloat(price),
            volume: parseFloat(volume),
          }));
          const newAsks = data.asks.slice(0, 10).map(([price, volume]) => ({
            price: parseFloat(price),
            volume: parseFloat(volume),
          }));

          const allVolumes = [...newBids, ...newAsks].map(o => o.volume);
          maxVolumeRef.current = Math.max(...allVolumes);

          setOrderBook({ bids: newBids, asks: newAsks });
        }
      };

      ws.current.onerror = (error) => {
        console.error('OrderBook WebSocket error:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [symbol]);

  const renderOrderRow = useCallback((order, type) => {
    const percentage = maxVolumeRef.current > 0 ? (order.volume / maxVolumeRef.current) * 100 : 0;
    const bgColor = type === 'bid' ? TC.bgBidVolume : TC.bgAskVolume;
    const textColor = type === 'bid' ? TC.textBidPrice : TC.textAskPrice;
    const amountColor = TC.textAmount;
    const totalColor = TC.textTotal;

    return (
      <div key={`${type}-${order.price}`} className="relative">
        <div
          className={`absolute inset-0 ${bgColor}`}
          style={{ width: `${percentage}%`, right: type === 'bid' ? undefined : 0, left: type === 'ask' ? undefined : 0 }}
        />
        <div className="relative grid grid-cols-3 gap-2 px-3 py-1 text-xs">
          <span className={`${textColor} font-mono font-medium`}>
            {order.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`${amountColor} text-right font-mono`}>
            {order.volume.toFixed(5)}
          </span>
          <span className={`${totalColor} text-right font-mono text-xs`}>
            {(order.price * order.volume).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    );
  }, [TC]);

  return (
    <div className={`${TC.bgCard} rounded-xl overflow-hidden h-full flex flex-col`}>
      <div className={`p-3 border-b ${TC.borderHeader} flex-shrink-0`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-base font-bold ${TC.headerGradient}`}>
            Order Book
          </h3>
          <div className={`flex gap-1 rounded-lg p-0.5 ${TC.bgTabBar}`}>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2 py-0.5 rounded text-xs transition-all ${
                activeTab === 'all'
                  ? TC.bgTabActiveCyan
                  : TC.textTabInactive
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              className={`px-2 py-0.5 rounded text-xs transition-all ${
                activeTab === 'bids'
                  ? TC.bgTabActiveGreen
                  : TC.textTabInactive
              }`}
            >
              Bids
            </button>
            <button
              onClick={() => setActiveTab('asks')}
              className={`px-2 py-0.5 rounded text-xs transition-all ${
                activeTab === 'asks'
                  ? TC.bgTabActiveRed
                  : TC.textTabInactive
              }`}
            >
              Asks
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-3 gap-2 px-3 text-xs font-semibold ${TC.textSecondary}`}>
          <span>Price</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Total</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        {(activeTab === 'all' || activeTab === 'asks') && (
          <div className="flex flex-col-reverse">
            {orderBook.asks.map(ask => renderOrderRow(ask, 'ask'))}
          </div>
        )}

        {activeTab === 'all' && orderBook.bids.length > 0 && orderBook.asks.length > 0 && (
          <div className={`py-1.5 px-3 border-y flex-shrink-0 ${TC.bgSpread}`}>
            <div className="flex items-center justify-between text-xs">
              <span className={TC.textSecondary}>Spread</span>
              <span className={`${TC.textSpreadValue} font-mono font-semibold`}>
                {(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'bids') && (
          <div>
            {orderBook.bids.map(bid => renderOrderRow(bid, 'bid'))}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
});

OrderBook.displayName = 'OrderBook';

export default OrderBook;