import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { 
  FaRocket, 
  FaChartLine, 
  FaNewspaper, 
  FaRobot,
  FaSync,
  FaPlay,
  FaPause,
  FaExclamationTriangle
} from 'react-icons/fa';

const Dashboard = ({ 
  dashboardData, 
  systemStatus, 
  onManualUpdate, 
  onStartCycle, 
  onStopCycle, 
  loading 
}) => {
  const [lastUpdateTime, setLastUpdateTime] = useState('');

  useEffect(() => {
    if (dashboardData?.lastUpdate) {
      const updateTime = new Date((typeof dashboardData.lastUpdate === 'bigint' ? Number(dashboardData.lastUpdate) : dashboardData.lastUpdate) / 1000000);
      setLastUpdateTime(updateTime.toLocaleString());
    }
  }, [dashboardData]);

  const getSentimentColor = (score) => {
    if (score > 20) return 'text-green-600 dark:text-green-400';
    if (score < -20) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getSentimentBg = (score) => {
    if (score > 20) return 'bg-green-100 dark:bg-green-900/30';
    if (score < -20) return 'bg-red-100 dark:bg-red-900/30';
    return 'bg-yellow-100 dark:bg-yellow-900/30';
  };

  const getSentimentLabel = (score) => {
    if (score > 20) return 'Bullish 🚀';
    if (score < -20) return 'Bearish 🐻';
    return 'Neutral ⚖️';
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
              <p className={`text-lg font-semibold ${
                systemStatus?.isActive ? 'text-green-600' : 'text-red-600'
              }`}>
                {systemStatus?.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <FaRobot className={`text-2xl ${
              systemStatus?.isActive ? 'text-green-500' : 'text-red-500'
            }`} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Cycles</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {systemStatus?.cycleCount || 0}
              </p>
            </div>
            <FaSync className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Logs</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {systemStatus?.logsCount || 0}
              </p>
            </div>
            <FaNewspaper className="text-2xl text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Last Update</p>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {lastUpdateTime || 'Never'}
              </p>
            </div>
            <FaChartLine className="text-2xl text-orange-500" />
          </div>
        </div>
      </div>

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              Market Sentiment
            </h3>
            <FaRobot className="text-purple-500 text-xl" />
          </div>

          {dashboardData?.sentiment ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <SentimentGauge 
                  sentiment={{
                    score: typeof dashboardData.sentiment.score === 'bigint' ? Number(dashboardData.sentiment.score) : dashboardData.sentiment.score,
                    confidence: typeof dashboardData.sentiment.confidence === 'bigint' ? Number(dashboardData.sentiment.confidence) : dashboardData.sentiment.confidence,
                    timestamp: typeof dashboardData.sentiment.timestamp === 'bigint' ? Number(dashboardData.sentiment.timestamp) : dashboardData.sentiment.timestamp,
                    keywords: dashboardData.sentiment.keywords || []
                  }}
                />
                <PriceCard 
                  price={{
                    price: typeof dashboardData.price.price === 'bigint' ? Number(dashboardData.price.price) : dashboardData.price.price,
                    change24h: typeof dashboardData.price.change24h === 'bigint' ? Number(dashboardData.price.change24h) : dashboardData.price.change24h,
                    timestamp: typeof dashboardData.price.timestamp === 'bigint' ? Number(dashboardData.price.timestamp) : dashboardData.price.timestamp
                  }}
                />
              </div>

              {/* Anomaly Detection Alert */}
              {dashboardData.anomaly && dashboardData.anomaly.detected && (
                <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                  dashboardData.anomaly.severity === 'HIGH' ? 'bg-red-50 border-red-500 text-red-800' :
                  dashboardData.anomaly.severity === 'MEDIUM' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
                  'bg-blue-50 border-blue-500 text-blue-800'
                }`}>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {dashboardData.anomaly.severity === 'HIGH' ? '🚨' : 
                       dashboardData.anomaly.severity === 'MEDIUM' ? '⚠️' : 'ℹ️'}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wide">
                        {dashboardData.anomaly.severity} Anomaly Detected
                      </h3>
                      <p className="mt-1">{dashboardData.anomaly.description}</p>
                      <p className="text-xs mt-1 opacity-75">
                        Price Change: {dashboardData.anomaly.priceChange?.toFixed(2)}% | 
                        Sentiment Score: {dashboardData.anomaly.sentimentScore}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Confidence</span>
                  <span className="font-medium">{Math.round((typeof dashboardData.sentiment.confidence === 'bigint' ? Number(dashboardData.sentiment.confidence) : dashboardData.sentiment.confidence) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(typeof dashboardData.sentiment.confidence === 'bigint' ? Number(dashboardData.sentiment.confidence) : dashboardData.sentiment.confidence) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🤖</div>
                  <p>AURA is initializing...</p>
                  <p className="text-sm mt-2">Autonomous agent will begin analyzing ICP market sentiment shortly</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Volume</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">High</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              <FaExclamationTriangle className="text-3xl mb-2 mx-auto" />
              <p>No sentiment data available</p>
            </div>
          )}
        </div>

        {/* Price Analysis Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              ICP Price
            </h3>
            <FaChartLine className="text-blue-500 text-xl" />
          </div>

          {dashboardData?.price ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  ${(typeof dashboardData.price.price === 'bigint' ? Number(dashboardData.price.price) : dashboardData.price.price).toFixed(4)}
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  (typeof dashboardData.price.change24h === 'bigint' ? Number(dashboardData.price.change24h) : dashboardData.price.change24h) >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {(typeof dashboardData.price.change24h === 'bigint' ? Number(dashboardData.price.change24h) : dashboardData.price.change24h) >= 0 ? '+' : ''}{(typeof dashboardData.price.change24h === 'bigint' ? Number(dashboardData.price.change24h) : dashboardData.price.change24h).toFixed(2)}%
                  <span className="ml-1 text-xs">24h</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Market Cap Rank</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">#27</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Volume</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">High</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              <FaExclamationTriangle className="text-3xl mb-2 mx-auto" />
              <p>No price data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          System Controls
        </h3>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onManualUpdate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? <LoadingSpinner size="sm" className="border-white" /> : <FaSync />}
            Manual Update
          </button>

          {systemStatus?.isActive ? (
            <button
              onClick={onStopCycle}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
            >
              <FaPause />
              Stop Cycle
            </button>
          ) : (
            <button
              onClick={onStartCycle}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
            >
              <FaPlay />
              Start Cycle
            </button>
          )}
        </div>

        {dashboardData?.status && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              System Status: <span className="font-medium text-slate-800 dark:text-slate-200">
                {dashboardData.status}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;