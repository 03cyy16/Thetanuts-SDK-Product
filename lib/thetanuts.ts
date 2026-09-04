export type ProtocolSnapshot = {
  configured: boolean;
  protocolConnected: boolean;
  liveOrderCount: number;
  executionPath: 'OptionBook' | 'RFQ';
  ethPrice?: string;
  btcPrice?: string;
};

/**
 * Reads the server-side SDK health check. The RPC URL stays on the server and
 * is never exposed to the browser bundle.
 */
export async function getProtocolSnapshot(): Promise<ProtocolSnapshot> {
  const response = await fetch('/api/market', { cache: 'no-store' });

  if (!response.ok) {
    return { configured: false, protocolConnected: false, liveOrderCount: 0, executionPath: 'RFQ' };
  }

  return response.json() as Promise<ProtocolSnapshot>;
}

export async function verifyProtocolConnection(): Promise<boolean> {
  return (await getProtocolSnapshot()).protocolConnected;
}
