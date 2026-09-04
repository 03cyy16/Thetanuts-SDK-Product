import { ethers } from 'ethers';
import { ThetanutsClient } from '@thetanuts-finance/thetanuts-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rpcUrl = process.env.THETANUTS_RPC_URL || process.env.NEXT_PUBLIC_THETANUTS_RPC_URL;

  if (!rpcUrl) {
    return Response.json(
      { configured: false, protocolConnected: false, liveOrderCount: 0, executionPath: 'RFQ' },
      { status: 503 },
    );
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const client = new ThetanutsClient({ chainId: 8453, provider });
    const [network, orders, market] = await Promise.all([
      provider.getNetwork(),
      client.api.fetchOrders(),
      client.api.getMarketData(),
    ]);

    return Response.json({
      configured: true,
      protocolConnected: network.chainId === BigInt(8453),
      liveOrderCount: orders.length,
      executionPath: orders.length > 0 ? 'OptionBook' : 'RFQ',
      ethPrice: market.prices.ETH ? String(market.prices.ETH) : undefined,
      btcPrice: market.prices.BTC ? String(market.prices.BTC) : undefined,
      orders: orders.slice(0, 24).map((item) => ({
        id: item.order.nonce.toString(),
        expiry: item.order.expiry.toString(),
        strike: item.order.strikes?.[0]?.toString() ?? item.order.strikePrice?.toString() ?? '0',
        premium: item.order.price.toString(),
        optionType: item.order.optionType === 1 ? 'Put' : 'Call',
        side: item.order.isBuyer ? 'Sell' : 'Buy',
        collateral: item.order.collateralToken ?? 'USDC',
      })),
    });
  } catch {
    return Response.json(
      { configured: true, protocolConnected: false, liveOrderCount: 0, executionPath: 'RFQ' },
      { status: 502 },
    );
  }
}

/**
 * Builds (but never submits) a real OptionBook fill transaction. The browser
 * wallet receives the resulting calldata only after the user reviews it.
 */
export async function POST(request: Request) {
  const rpcUrl = process.env.THETANUTS_RPC_URL || process.env.NEXT_PUBLIC_THETANUTS_RPC_URL;
  if (!rpcUrl) return Response.json({ error: 'THETANUTS_RPC_URL is not configured.' }, { status: 503 });

  try {
    const body = await request.json() as { amount?: string };
    if (!body.amount || !/^\d+$/.test(body.amount) || BigInt(body.amount) <= 0n) {
      return Response.json({ error: 'Enter a valid positive USDC allocation.' }, { status: 400 });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const client = new ThetanutsClient({ chainId: 8453, provider });
    const now = BigInt(Math.floor(Date.now() / 1000));
    const usdc = client.chainConfig.tokens.USDC.address;
    const order = (await client.api.fetchOrders()).find(
      (item) => item.order.expiry > now && item.order.collateralToken?.toLowerCase() === usdc.toLowerCase(),
    );

    if (!order) return Response.json({ error: 'No active USDC-collateral OptionBook order is available right now. The app will not fabricate a quote; try again later or request an RFQ.' }, { status: 404 });

    const amount = BigInt(body.amount);
    const preview = client.optionBook.previewFillOrder(order, amount);
    const transaction = client.optionBook.encodeFillOrder(order, amount);

    return Response.json({
      preview: {
        contracts: ethers.formatUnits(preview.numContracts, 6),
        price: ethers.formatUnits(preview.pricePerContract, 8),
        collateral: preview.collateralToken,
      },
      transaction: {
        ...transaction,
        usdc,
        optionBook: client.chainConfig.contracts.optionBook,
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unable to prepare a live OptionBook fill.' }, { status: 502 });
  }
}
