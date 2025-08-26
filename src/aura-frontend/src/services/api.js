// Frontend API service to bypass canister HTTP outcalls
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd&include_24hr_change=true';
const NEWS_API = 'https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=10';

export const fetchPriceData = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(COINGECKO_API, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return {
      price: data['internet-computer'].usd,
      change24h: data['internet-computer'].usd_24h_change || 0,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Price fetch error:', error);
    return null;
  }
};

export const fetchNewsData = async (apiKey) => {
  if (!apiKey) return null;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(`${NEWS_API}&apiKey=${apiKey}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    let combinedText = '';
    data.articles?.slice(0, 3).forEach(article => { // Reduced to 3 articles for speed
      combinedText += ` ${article.title} ${article.description}`;
    });
    
    return combinedText;
  } catch (error) {
    console.error('News fetch error:', error);
    return null;
  }
};

export const calculateSentiment = (text) => {
  const positiveKeywords = ['bullish', 'moon', 'pump', 'rally', 'surge', 'growth', 'positive', 'breakout', 'adoption', 'partnership', 'upgrade', 'gains', 'buy', 'hodl'];
  const negativeKeywords = ['bearish', 'dump', 'crash', 'dip', 'decline', 'fear', 'negative', 'correction', 'sell', 'panic', 'uncertainty', 'doubt', 'fud', 'regulation', 'ban'];
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) positiveScore++;
  });
  
  negativeKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) negativeScore++;
  });
  
  const totalKeywords = positiveScore + negativeScore;
  if (totalKeywords === 0) return 0;
  
  const sentimentRatio = (positiveScore - negativeScore) / totalKeywords;
  return Math.round(sentimentRatio * 100);
};

// Fast API fetch with immediate fallback
export const fetchDataWithFallback = async (apiKey) => {
  const startTime = Date.now();
  
  try {
    // Fetch price and news in parallel with race condition
    const pricePromise = fetchPriceData();
    const newsPromise = apiKey ? fetchNewsData(apiKey) : Promise.resolve(null);
    
    // Race against timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Overall timeout')), 8000)
    );
    
    const [priceData, newsText] = await Promise.race([
      Promise.all([pricePromise, newsPromise]),
      timeoutPromise
    ]);
    
    // Calculate sentiment if we have news
    let sentimentScore = 0;
    let keywords = [];
    
    if (newsText) {
      sentimentScore = calculateSentiment(newsText);
      keywords = newsText.split(' ').slice(0, 3); // Reduced keywords
    }
    
    const fetchTime = Date.now() - startTime;
    console.log(`API fetch completed in ${fetchTime}ms`);
    
    return {
      sentiment: {
        score: sentimentScore,
        confidence: newsText ? 0.8 : 0.3,
        timestamp: Date.now(),
        keywords: keywords
      },
      price: priceData || generateFallbackData().price,
      status: priceData ? 'Active (Real API)' : 'Active (Fallback)',
      lastUpdate: Date.now(),
      fetchTime: fetchTime
    };
    
  } catch (error) {
    console.error('Fast API fetch failed:', error);
    const fallbackData = generateFallbackData();
    return {
      sentiment: fallbackData.sentiment,
      price: fallbackData.price,
      status: 'Active (Fallback)',
      lastUpdate: Date.now(),
      fetchTime: Date.now() - startTime
    };
  }
};

// Generate fallback data for when APIs fail
export const generateFallbackData = () => {
  const basePrice = 8.5;
  const variation = Math.random() * 1.6 - 0.8; // ±$0.80 variation
  const price = Math.max(0.1, basePrice + variation);
  
  const sentimentScores = [20, 40, 60, 80, -20, -40, 0, 10, -10, 30];
  const randomSentiment = sentimentScores[Math.floor(Math.random() * sentimentScores.length)];
  
  return {
    price: {
      price: parseFloat(price.toFixed(2)),
      change24h: (Math.random() * 10 - 5), // ±5% change
      timestamp: Date.now()
    },
    sentiment: {
      score: randomSentiment,
      confidence: 0.7,
      timestamp: Date.now(),
      keywords: randomSentiment > 0 ? ['growth', 'positive'] : ['decline', 'uncertainty']
    }
  };
};
