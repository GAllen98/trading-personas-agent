import { NextResponse } from "next/server";
import { generateId } from 'ai';

const {
  BITTE_API_KEY,
  BITTE_API_URL = 'https://ai-runtime-446257178793.europe-west1.run.app/chat',
} = process.env;


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const description = searchParams.get('description');
  const personaAddress = searchParams.get('personaAddress');
  const trendingCoins = searchParams.get('trendingCoins');

  if (!description || !personaAddress || !trendingCoins) {
    return NextResponse.json({ error: `Missing parameters: 
      description: ${description}, 
      personaAddress: ${personaAddress}, 
      trendingCoins: ${trendingCoins} 
All parameters are required` }, { status: 400 });
  }

  const chatId = generateId();

  const body = {
    id: chatId,
    evmAddress: personaAddress,
    messages: [
      {
        role: 'user',
        content: `Generate a trade decision for the following persona based on the trending coins data: 
(start of description)
${description}
(end of description)

(start of trending coins)
${trendingCoins}
(end of trending coins)

Consider the act of selling as swapping an asset for stablecoins such as USDC and buying as swapping stablecoins for an asset.
`,
      },
    ],
    config: {
      mode: 'default',
      agentId: 'near-cow-agent.vercel.app',
    },
  };

  const response = await fetch(`${BITTE_API_URL}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BITTE_API_KEY}`,
    },
  });

  // const data = await response.json();
  // console.log(`data: ${JSON.stringify(data)}`);

  return NextResponse.json(response);
}