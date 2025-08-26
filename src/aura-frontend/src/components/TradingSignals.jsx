import React, { useState, useEffect } from 'react';
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaMinus, 
  FaBolt, 
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaRobot,
  FaFire
} from 'react-icons/fa';

const TradingSignals = ({ dashboardData }) => {
  const [signals, setSignals] = useState([]);
  const [activeSignal, setActiveSignal] = useState(null);
  const [confidence, setConfidence] = useState(0);

  // Generate AI-powered trading signals based on sentiment and price data
  useEffect(() => {
    if (!dashboardData?.sentiment || !dashboardData?.price) return;

    const generateSignals = () => {
      const sentiment = (typeof dashboardData.sentiment.score === 'bigint' ? Number(dashboardData.sentiment.score) : dashboardData.sentiment.score) || 0;
      const priceChange = (typeof dashboardData.price.change24h === 'bigint' ? Number(dashboardData.price.change24h) : dashboardData.price.change24h) || 0;
      const conf = (typeof dashboardData.sentiment.confidence === 'bigint' ? Number(dashboardData.sentiment.confidence) : dashboardData.sentiment.confidence) || 0;
      const timestamp = Date.now();

      // ML-inspired signal generation
      const signals = [];
      
      // Strong Bullish Signal
      if ((sentiment > 60 && priceChange > 3) || (sentiment > 70)) {
        signals.push({
          id: 'strong-bull',
          type: 'BUY',
          strength: 'STRONG',
          confidence: Math.min(95, 70 + Math.abs(sentiment) * 0.3 + Math.max(priceChange, 0) * 2 + conf * 20),
          reason: 'High positive sentiment + strong price momentum',
          timeframe: '4-8 hours',
          riskLevel: 'Medium',
          icon: <FaArrowUp className="text-green-500" />,
          color: 'green',
          timestamp
        });
      }

      // Moderate Bullish Signal
      if ((sentiment > 30 && priceChange > 1) || (sentiment > 40 && priceChange >= 0)) {
        signals.push({
          id: 'mod-bull',
          type: 'BUY',
          strength: 'MODERATE',
          confidence: Math.min(85, 55 + Math.abs(sentiment) * 0.25 + Math.max(priceChange, 0) * 1.5 + conf * 15),
          reason: 'Positive sentiment with upward price trend',
          timeframe: '1-2 days',
          riskLevel: 'Low',
          icon: <FaArrowUp className="text-green-400" />,
          color: 'green',
          timestamp
        });
      }

      // Strong Bearish Signal
      if ((sentiment < -40 && priceChange < -3) || (sentiment < -55)) {
        signals.push({
          id: 'strong-bear',
          type: 'SELL',
          strength: 'STRONG',
          confidence: Math.min(92, 65 + Math.abs(sentiment) * 0.3 + Math.max(-priceChange, 0) * 2 + conf * 20),
          reason: 'High negative sentiment + price decline',
          timeframe: '2-6 hours',
          riskLevel: 'High',
          icon: <FaArrowDown className="text-red-500" />,
          color: 'red',
          timestamp
        });
      }

      // Moderate Bearish Signal
      if ((sentiment < -25 && priceChange < -1) || (sentiment < -35 && priceChange <= 0)) {
        signals.push({
          id: 'mod-bear',
          type: 'SELL',
          strength: 'MODERATE',
          confidence: Math.min(80, 50 + Math.abs(sentiment) * 0.25 + Math.max(-priceChange, 0) * 1.5 + conf * 15),
          reason: 'Negative sentiment with downward/weak price trend',
          timeframe: '1-2 days',
          riskLevel: 'Medium',
          icon: <FaArrowDown className="text-red-400" />,
          color: 'red',
          timestamp
        });
      }

      // Consolidation Signal
      if (Math.abs(sentiment) < 25 && Math.abs(priceChange) < 2) {
        signals.push({
          id: 'consolidation',
          type: 'HOLD',
          strength: 'NEUTRAL',
          confidence: Math.min(75, 55 + (1 - Math.abs(sentiment) / 100) * 20 + (2 - Math.min(Math.abs(priceChange), 2)) * 5),
          reason: 'Low volatility, market consolidation phase',
          timeframe: '1-3 days',
          riskLevel: 'Very Low',
          icon: <FaMinus className="text-yellow-500" />,
          color: 'yellow',
          timestamp
        });
      }

      // Volatility Alert
      if (Math.abs(priceChange) > 10) {
        signals.push({
          id: 'volatility',
          type: 'ALERT',
          strength: 'HIGH VOLATILITY',
          confidence: 95,
          reason: 'Extreme price movement detected',
          timeframe: 'Immediate',
          riskLevel: 'Very High',
          icon: <FaBolt className="text-orange-500" />,
          color: 'orange',
          timestamp
        });
      }

      // Ensure at least one actionable baseline signal if none matched
      if (signals.length === 0) {
        const baselineType = sentiment > 15 ? 'BUY' : sentiment < -15 ? 'SELL' : 'HOLD';
        const baselineStrength = Math.abs(sentiment) > 35 ? 'MODERATE' : 'NEUTRAL';
        const baselineReason = baselineType === 'HOLD'
          ? 'Insufficient momentum; holding pattern based on sentiment'
          : `Sentiment-driven ${baselineType === 'BUY' ? 'upside' : 'downside'} bias`;
        signals.push({
          id: 'baseline',
          type: baselineType,
          strength: baselineStrength,
          confidence: Math.min(80, 50 + Math.abs(sentiment) * 0.3 + Math.max(priceChange, 0) * (baselineType === 'BUY' ? 1.2 : 0) + Math.max(-priceChange, 0) * (baselineType === 'SELL' ? 1.2 : 0) + conf * 10),
          reason: baselineReason,
          timeframe: '6-24 hours',
          riskLevel: baselineType === 'HOLD' ? 'Low' : 'Medium',
          icon: baselineType === 'BUY' ? <FaArrowUp className="text-green-400" /> : baselineType === 'SELL' ? <FaArrowDown className="text-red-400" /> : <FaMinus className="text-yellow-500" />,
          color: baselineType === 'BUY' ? 'green' : baselineType === 'SELL' ? 'red' : 'yellow',
          timestamp
        });
      }

      return signals;
    };

    const newSignals = generateSignals();
    setSignals(newSignals);
    
    // Set the strongest signal as active
    if (newSignals.length > 0) {
      const strongest = newSignals.reduce((prev, current) => 
        prev.confidence > current.confidence ? prev : current
      );
      setActiveSignal(strongest);
      setConfidence(strongest.confidence);
    }
  }, [dashboardData]);

  const getSignalIcon = (type) => {
    switch (type) {
      case 'BUY': return <FaArrowUp />;
      case 'SELL': return <FaArrowDown />;
      case 'HOLD': return <FaMinus />;
      case 'ALERT': return <FaBolt />;
      default: return <FaChartLine />;
    }
  };

  const getSignalColor = (type, strength) => {
    if (type === 'ALERT') return 'bg-orange-500';
    if (type === 'BUY') return strength === 'STRONG' ? 'bg-green-600' : 'bg-green-500';
    if (type === 'SELL') return strength === 'STRONG' ? 'bg-red-600' : 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 80) return 'text-green-500';
    if (conf >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaRobot className="text-2xl text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              AI Trading Signals
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ML-powered market predictions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FaFire className="text-orange-500" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            WCHL25 Feature
          </span>
        </div>
      </div>

      {/* Active Signal */}
      {activeSignal && (
        <div className={`${getSignalColor(activeSignal.type, activeSignal.strength)} rounded-lg p-4 mb-6 text-white`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {getSignalIcon(activeSignal.type)}
              </div>
              <div>
                <div className="text-lg font-bold">
                  {activeSignal.type} • {activeSignal.strength}
                </div>
                <div className="text-sm opacity-90">
                  Confidence: {Math.round(activeSignal.confidence)}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75">Risk Level</div>
              <div className="font-semibold">{activeSignal.riskLevel}</div>
            </div>
          </div>
          
          <div className="bg-black bg-opacity-20 rounded-lg p-3">
            <div className="text-sm mb-2">
              <strong>Analysis:</strong> {activeSignal.reason}
            </div>
            <div className="flex justify-between text-xs opacity-90">
              <span>⏱️ Timeframe: {activeSignal.timeframe}</span>
              <span>🎯 Target: {activeSignal.type === 'BUY' ? '+5-15%' : activeSignal.type === 'SELL' ? '-3-8%' : 'Hold'}</span>
            </div>
          </div>
        </div>
      )}

      {/* All Signals */}
      <div className="space-y-3">
        <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-3">
          Current Market Signals
        </h4>
        
        {signals.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <FaClock className="text-3xl mx-auto mb-2 opacity-50" />
            <p>Analyzing market data...</p>
            <p className="text-xs mt-1">Signals will appear when conditions are met</p>
          </div>
        ) : (
          signals.map((signal) => (
            <div
              key={signal.id}
              className={`border rounded-lg p-3 transition-all duration-200 cursor-pointer ${
                activeSignal?.id === signal.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
              onClick={() => setActiveSignal(signal)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getSignalColor(signal.type, signal.strength)} text-white`}>
                    {getSignalIcon(signal.type)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-200">
                      {signal.type} • {signal.strength}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {signal.reason}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${getConfidenceColor(signal.confidence)}`}>
                    {Math.round(signal.confidence)}%
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {signal.riskLevel}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-2">
          <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-700 dark:text-yellow-300">
            <strong>Disclaimer:</strong> These signals are AI-generated predictions based on sentiment analysis and price data. 
            Not financial advice. Always do your own research and consider your risk tolerance.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingSignals;
