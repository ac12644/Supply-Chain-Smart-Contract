import { createConfig, http } from "wagmi";
import { polygonAmoy } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

// Get contract addresses from environment
const SUPPLY_CHAIN_ADDRESS = process.env
  .NEXT_PUBLIC_SUPPLY_CHAIN_ADDRESS as `0x${string}`;
const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}`;
const REPUTATION_ADDRESS = process.env
  .NEXT_PUBLIC_REPUTATION_ADDRESS as `0x${string}`;

if (!SUPPLY_CHAIN_ADDRESS || !ESCROW_ADDRESS || !REPUTATION_ADDRESS) {
  throw new Error("Missing contract addresses in environment variables");
}

// Wagmi configuration
export const config = createConfig({
  chains: [polygonAmoy],
  connectors: [injected(), metaMask()],
  transports: {
    [polygonAmoy.id]: http(),
  },
});

// Contract addresses
export const contractAddresses = {
  supplyChain: SUPPLY_CHAIN_ADDRESS,
  escrow: ESCROW_ADDRESS,
  reputation: REPUTATION_ADDRESS,
} as const;

// Chain configuration
export const chainConfig = {
  id: polygonAmoy.id,
  name: polygonAmoy.name,
  nativeCurrency: polygonAmoy.nativeCurrency,
  rpcUrls: polygonAmoy.rpcUrls,
  blockExplorers: polygonAmoy.blockExplorers,
} as const;
