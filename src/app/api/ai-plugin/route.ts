import { ACCOUNT_ID } from "@/app/config";
import { NextResponse } from "next/server";
import {
  chainIdParam,
  addressParam,
  SignRequestResponse200,
  AddressSchema,
  MetaTransactionSchema,
  SignRequestSchema,
} from "@bitte-ai/agent-sdk";

export async function GET() {
  const pluginData = {
    openapi: "3.0.0",
    info: {
      title: "Trading Personas Agent",
      description: "Agent for creating and interacting with trading personas",
      version: "1.0.0",
    },
    servers: [
      {
        // Enter the base and open url of your agent here, make sure it is reachable
        url: "https://trading-personas-agent.vercel.app/",
      },
    ],
    "x-mb": {
      // The account id of the user who created the agent found in .env file
      "account-id": ACCOUNT_ID,
      // The email of the user who created the agent
      email: "allen@mintbase.xyz",
      assistant: {
        name: "Trading Personas Agent",
        description:
          "An agent that creates trading personas and interprets how they would trade based on their description to make automated trades.",
        // todo: name of the agent and save it to db also use the custom tool you haven't created yet
        instructions: `You can create trading personas and also make a trading decision as if you were the persona. 
To make a trading decision use the get-persona tool to get a persona's details and the get-portfolio tool to get a persona's portfolio and then make a trading decision based on the persona's description and the trending coins. The decisions can be BUY, SELL, or HOLD. BUY means you turn some stablecoin into the coin you want to buy. SELL means you turn the coin you want to sell into stablecoin. HOLD means you do nothing. If you decide to buy or sell, generate a swap transaction through the /trade path tool. 
You can also create a persona when you are given a name and description of a persona. You should look for trading behavior and specific instructions to make trades in that description.`,
        tools: [{ type: "get-portfolio" },],
        // Thumbnail image for your agent
        image: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/bitte.svg`,
        // The repo url for your agent https://github.com/your-username/your-agent-repo
        repo: "https://github.com/Gallen9/trading-personas-agent",
        // The categories your agent supports ["DeFi", "DAO", "NFT", "Social"]
        categories: ["DeFi", "Social", "Trading", "Automation"],
        // The chains your agent supports 1 = mainnet, 8453 = base
        chainIds: ["near", "1", "8453"],
      },
    },
    paths: {
      "/api/tools/create-trading-persona": {
        get: {
          operationId: "create-trading-persona",
          summary: "Create a trading persona",
          description:
            "Saves a persona name and description and associates it with a new address from the user's wallet.",
          parameters: [
            {
              name: "name",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "The name of the persona being created",
            },
            {
              name: "description",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "The description of the persona being created",
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      persona: {
                        type: "object",
                        properties: {
                          name: {
                            type: "string",
                            description: "The receiver's NEAR account ID",
                          },
                          description: {
                            type: "string",
                            description:
                              "The description of the persona being created",
                          },
                          personaAddress: {
                            type: "string",
                            description:
                              "The address of the persona being created",
                          },
                          userAddress: {
                            type: "string",
                            description:
                              "The address of the user who created the persona",
                          },
                          // TODO: add trading frequency option
                          // tradingFrequency: {
                          //     type: "string",
                          //     description: "The frequency of the persona's trading"
                          // },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Error response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/trending-coins": {
        get: {
          operationId: "trending-coins",
          summary: "Get trending coins from CoinGecko",
          description:
            "Fetches a list of trending coins from the CoinGecko API, including metadata such as market cap rank, price in BTC, and image URLs.",
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          trending_coins: {
                            type: "array",
                            description: "A list of trending coins.",
                            items: {
                              type: "object",
                              properties: {
                                id: {
                                  type: "string",
                                  description: "The CoinGecko ID of the coin.",
                                },
                                name: {
                                  type: "string",
                                  description: "The name of the coin.",
                                },
                                symbol: {
                                  type: "string",
                                  description: "The symbol of the coin.",
                                },
                                market_cap_rank: {
                                  type: "integer",
                                  description: "The market cap rank of the coin.",
                                },
                                price_btc: {
                                  type: "number",
                                  description: "The price of the coin in BTC.",
                                },
                                score: {
                                  type: "integer",
                                  description: "The trending score of the coin.",
                                },
                                thumb: {
                                  type: "string",
                                  description: "Thumbnail image URL.",
                                },
                                small: {
                                  type: "string",
                                  description: "Small image URL.",
                                },
                                large: {
                                  type: "string",
                                  description: "Large image URL.",
                                },
                                slug: {
                                  type: "string",
                                  description: "Slug for the coin.",
                                },
                              },
                            },
                          },
                          metadata: {
                            type: "object",
                            properties: {
                              total_coins: {
                                type: "integer",
                                description: "Total number of trending coins returned.",
                              },
                              api_tier: {
                                type: "string",
                                description: "API tier used for the data.",
                                example: "free",
                              },
                              cache_update_frequency: {
                                type: "string",
                                description: "How often the cache is updated.",
                                example: "10 minutes",
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Error response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // "/api/tools/trading-decision": {
      //   get: {
      //     operationId: "trading-decision",
      //     summary: "Get a trading decision",
      //     description: "Use the get-persona tool to get a persona's details and then make a trading decision based on the persona's description and the trending coins. The decisions can be BUY, SELL, or HOLD. BUY means you turn some stablecoin into the coin you want to buy. SELL means you turn the coin you want to sell into stablecoin. HOLD means you do nothing. If you decide to buy or sell, generate a swap transaction through the intents tool.",
      //     responses: {
      //       "200": {
      //         description: "Successful response",
      //         content: {
      //           "application/json": {
      //             schema: {
      //               type: "object",
      //               properties: {
      //                 message: {
      //                   type: "string",
      //                   description: "The trading decision",
      //                 },
      //               },
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      // },
      "/api/tools/get-persona": {
        get: {
          operationId: "get-persona",
          summary: "Get a persona's details",
          description: "Get a persona's details based on the name or address the user provides.",
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "The name of the persona",
                      },
                      description: {
                        type: "string",
                        description: "The description of the persona",
                      },
                      personaAddress: {
                        type: "string",
                        description: "The address of the persona",
                      },
                      userAddress: {
                        type: "string",
                        description: "The address of the user who created the persona",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/trade": {
        get: {
          operationId: "trade",
          summary: "Makes a trade decision for a persona based on trending coins",
          description:
            "Makes a trade decision (BUY, SELL, or HOLD) for a given persona based on their description and trending coins data. The decision is made as if the persona were trading. If the decision is not to HOLD then you should generate a swap transaction. Use BASE as the default chain for the swap transaction.",
          parameters: [
            {
              name: "description",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "The description of the persona, including trading behavior and preferences.",
            },
            {
              name: "personaAddress",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "The address of the persona making the trade decision.",
            },
            {
              name: "trendingCoins",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "A JSON stringified array of trending coins data to inform the trade decision.",
            },
          ],
          responses: {
            "200": {
              description: "Successful response with trade decision",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {},
                    additionalProperties: true,
                  },
                },
              },
            },
            "400": {
              description: "Missing parameters",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message describing missing or invalid parameters.",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      parameters: {
        evmAddress: { ...addressParam, name: "evmAddress" },
        method: {
          name: "method",
          description: "The signing method to be used.",
          in: "query",
          required: true,
          schema: {
            type: "string",
            enum: [
              "eth_sign",
              "personal_sign",
              "eth_signTypedData",
              "eth_signTypedData_v4",
            ],
          },
          example: "eth_sign",
        },
        chainId: { ...chainIdParam, example: 8453, required: false },
        message: {
          name: "message",
          in: "query",
          required: false,
          description: "any text message",
          schema: { type: "string" },
          example: "Hello Bitte",
        },
      },
      responses: {
        SignRequestResponse200,
      },
      schemas: {
        Address: AddressSchema,
        MetaTransaction: MetaTransactionSchema,
        SignRequest: SignRequestSchema,
      },
    },
  };

  return NextResponse.json(pluginData);
}
