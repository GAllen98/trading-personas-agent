import { NextResponse } from 'next/server';

interface TwitterContext {
  posts: Array<{
    text: string;
    engagement: number;
    timestamp: string;
  }>;
  volume: number;
}

interface SantimentContext {
  socialVolume: number;
  developmentActivity: number;
  networkActivity: number;
}

interface CryptoPanicContext {
  news: Array<{
    title: string;
    url: string;
    publishedAt: string;
    source: string;
  }>;
  newsCount: number;
}

interface SymbolData {
  symbol: string;
  twitterContext: TwitterContext;
  santimentContext: SantimentContext;
  cryptopanicContext: CryptoPanicContext;
}

interface MarketAnalysisResponse {
  trendingSymbols: string[];
  symbolsData: SymbolData[];
}

export async function GET() {
  try {
    // Get trending crypto symbols
    const trendingSymbols = await fetchTrendingSymbols();

    if (trendingSymbols.length === 0) {
      return NextResponse.json(
        { error: 'No trending symbols found' },
        { status: 404 }
      );
    }

    // Fetch data for all trending symbols in parallel
    const topTrendingSymbols = trendingSymbols.slice(0, 3); // Limit to top 3 trending
    
    const symbolsDataPromises = topTrendingSymbols.map(async (symbol) => {
      const [twitterContext, santimentContext, cryptopanicContext] = await Promise.allSettled([
        fetchTwitterData(symbol),
        fetchSantimentData(symbol),
        fetchCryptoPanicData(symbol)
      ]);

      return {
        symbol,
        twitterContext: twitterContext.status === 'fulfilled' 
          ? twitterContext.value 
          : getDefaultTwitterContext(),
        santimentContext: santimentContext.status === 'fulfilled' 
          ? santimentContext.value 
          : getDefaultSantimentContext(),
        cryptopanicContext: cryptopanicContext.status === 'fulfilled' 
          ? cryptopanicContext.value 
          : getDefaultCryptoPanicContext()
      };
    });

    const symbolsData = await Promise.all(symbolsDataPromises);

    const response: MarketAnalysisResponse = {
      trendingSymbols,
      symbolsData
    };

    return NextResponse.json({ marketAnalysis: response }, { status: 200 });
  } catch (error) {
    console.error('Error gathering market analysis:', error);
    return NextResponse.json(
      { error: 'Failed to gather market analysis data' },
      { status: 500 }
    );
  }
}

async function fetchTrendingSymbols(): Promise<string[]> {
  try {
    // Use CoinGecko API to get trending cryptocurrencies
    const response = await fetch(
      'https://api.coingecko.com/api/v3/search/trending',
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract symbols from trending coins
    const trendingSymbols = data.coins?.map((coin: {
      item: {
        symbol: string;
        id: string;
      };
    }) => coin.item.symbol.toUpperCase()) || [];

    // Fallback to popular coins if no trending data
    if (trendingSymbols.length === 0) {
      return ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
    }

    return trendingSymbols;
  } catch (error) {
    console.error('Error fetching trending symbols:', error);
    // Return fallback symbols
    return ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
  }
}

async function fetchTwitterData(symbol: string): Promise<TwitterContext> {
  try {
    // Twitter/X API implementation
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    if (!bearerToken) {
      throw new Error('Twitter Bearer Token not configured');
    }

    const query = `$${symbol.toUpperCase()} OR ${symbol.toLowerCase()} crypto -is:retweet lang:en`;
    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${10}&tweet.fields=public_metrics,created_at`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process tweets
    const posts = data.data?.map((tweet: {
      text: string;
      created_at: string;
      public_metrics?: {
        like_count?: number;
        retweet_count?: number;
      };
    }) => ({
      text: tweet.text,
      engagement: (tweet.public_metrics?.like_count || 0) + (tweet.public_metrics?.retweet_count || 0),
      timestamp: tweet.created_at,
    })) || [];

    return {
      posts,
      volume: posts.length,
    };
  } catch (error) {
    console.error('Twitter API error:', error);
    throw error;
  }
}

async function fetchSantimentData(symbol: string): Promise<SantimentContext> {
  try {
    const apiKey = process.env.SANTIMENT_API_KEY;
    
    if (!apiKey) {
      throw new Error('Santiment API key not configured');
    }

    // Fetch multiple metrics from Santiment
    const queries = [
      {
        query: `{
          getMetric(metric: "social_volume_total") {
            timeseriesData(
              slug: "${symbol.toLowerCase()}"
              from: "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}"
              to: "${new Date().toISOString()}"
              interval: "1h"
            ) {
              datetime
              value
            }
          }
        }`
      }
    ];

    const response = await fetch('https://api.santiment.net/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Apikey ${apiKey}`,
      },
      body: JSON.stringify(queries[0]),
    });

    if (!response.ok) {
      throw new Error(`Santiment API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process Santiment data
    const socialVolume = data.data?.getMetric?.timeseriesData?.reduce(
      (sum: number, item: { value?: number }) => sum + (item.value || 0), 0
    ) || 0;

    return {
      socialVolume,
      developmentActivity: Math.random() * 100, // Mock data
      networkActivity: Math.random() * 1000, // Mock data
    };
  } catch (error) {
    console.error('Santiment API error:', error);
    throw error;
  }
}

async function fetchCryptoPanicData(symbol: string): Promise<CryptoPanicContext> {
  try {
    const apiKey = process.env.CRYPTOPANIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('CryptoPanic API key not configured');
    }

    const response = await fetch(
      `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&currencies=${symbol.toUpperCase()}&kind=news&filter=hot`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CryptoPanic API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process CryptoPanic data
    const news = data.results?.map((item: {
      title: string;
      url: string;
      published_at: string;
      source?: { title?: string };
    }) => ({
      title: item.title,
      url: item.url,
      publishedAt: item.published_at,
      source: item.source?.title || 'Unknown',
    })) || [];

    return {
      news,
      newsCount: news.length,
    };
  } catch (error) {
    console.error('CryptoPanic API error:', error);
    throw error;
  }
}

// Default responses for when APIs fail
function getDefaultTwitterContext(): TwitterContext {
  return {
    posts: [],
    volume: 0,
  };
}

function getDefaultSantimentContext(): SantimentContext {
  return {
    socialVolume: 0,
    developmentActivity: 0,
    networkActivity: 0,
  };
}

function getDefaultCryptoPanicContext(): CryptoPanicContext {
  return {
    news: [],
    newsCount: 0,
  };
}
