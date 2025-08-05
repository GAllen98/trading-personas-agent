import { NextResponse } from 'next/server';

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
}

interface TrendingResponse {
  coins: Array<{ item: TrendingCoin }>;
}

export async function GET() {
  try {
    // Fetch trending data from CoinGecko free API
    const response = await fetch('https://api.coingecko.com/api/v3/search/trending', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data: TrendingResponse = await response.json();

    // Transform the data to make it more usable
    const trending_coins = data.coins?.map(coinWrapper => ({
        id: coinWrapper.item.id,
        name: coinWrapper.item.name,
        symbol: coinWrapper.item.symbol,
        market_cap_rank: coinWrapper.item.market_cap_rank,
        price_btc: coinWrapper.item.price_btc,
        score: coinWrapper.item.score,
        slug: coinWrapper.item.slug,
      })) || [];

    return NextResponse.json({
      trending_coins,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching trending data:', error);
    
    return NextResponse.json({
      error: `Failed to fetch trending coins data: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
    }, { status: 500 });
  }
}
