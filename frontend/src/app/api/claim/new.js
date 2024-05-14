import Redis from "ioredis"; // Redis
import { ethers } from "ethers"; // Ethers
import { getSession } from "next-auth/client"; // Session management
import { isValidInput } from "../../page"; // Address check
import parseTwitterDate from "../../../../utils/dates"; // Parse Twitter dates
import { hasClaimed } from "./status"; // Claim status

// Setup redis client
const client = new Redis(process.env.REDIS_URL);

// Setup faucet interface
const iface = new ethers.utils.Interface([
  "function drip(address _recipient) external",
]);

/**
 * Generates tx input data for drip claim
 * @param {string} recipient address
 * @returns {string} encoded input data
 */
function generateTxData(recipient) {
  // Encode address for drip function
  return iface.encodeFunctionData("drip", [recipient]);
}

// Setup network
const SEPOLIA = 11155111;
const rpcNetwork = {
  11155111: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
};

/**
 * Collects StaticJsonRpcProvider for Sepolia network
 * @returns {ethers.providers.StaticJsonRpcProvider} provider
 */
function getProvider() {
  // Collect Alchemy RPC URL for Sepolia
  const rpcUrl = rpcNetwork[SEPOLIA];
  // Return static provider
  return new ethers.providers.StaticJsonRpcProvider(rpcUrl);
}

/**
 * Collects nonce for Sepolia network (cache first)
 * @returns {Promise<number>} network account nonce
 */
async function getNonce() {
  // Collect nonce from redis
  const redisNonce = await client.get(`nonce-${SEPOLIA}`);

  // If no redis nonce
  if (redisNonce == null) {
    // Update to last network nonce
    const provider = getProvider();
    return await provider.getTransactionCount(
      // Collect nonce for operator
      process.env.NEXT_PUBLIC_OPERATOR_ADDRESS
    );
  } else {
    // Else, return cached nonce
    return Number(redisNonce);
  }
}

/**
 * Returns populated drip transaction for Sepolia network
 * @param {ethers.Wallet} wallet without RPC network connected
 * @param {string} data input for tx
 */
async function processDrip(wallet, data) {
  // Collect provider
  const provider = getProvider();

  // Connect wallet to network
  const rpcWallet = wallet.connect(provider);
  // Collect nonce for network
  const nonce = await getNonce();
  // Collect gas price * 2 for network
  const gasPrice = (await provider.getGasPrice()).mul(2);

  // Update nonce for network in redis w/ 5m ttl
  await client.set(`nonce-${SEPOLIA}`, nonce + 1, "EX", 300);

  // Return populated transaction
  return rpcWallet.sendTransaction({
    to: process.env.FAUCET_ADDRESS,
    from: wallet.address,
    gasPrice,
    gasLimit: 500_000,
    data,
    nonce,
    type: 0,
  });
}

export default async (req, res) => {
  // Collect session (force any for extra twitter params)
  const session = await getSession({ req });
  // Collect address
  const { address } = req.body;

  if (!session) {
    // Return unauthed status
    return res.status(401).send({ error: "Not authenticated." });
  }

  // Basic anti-bot measures
  const ONE_MONTH_SECONDS = 2629746;
  if (
    // Less than 1 tweet
    session.twitter_num_tweets == 0 ||
    // Less than 100 followers
    session.twitter_num_followers < 100 ||
    // Less than 1 month old
    new Date().getTime() -
      parseTwitterDate(session.twitter_created_at).getTime() <
      ONE_MONTH_SECONDS
  ) {
    // Return invalid Twitter account status
    return res
      .status(400)
      .send({ error: "Twitter account does not pass anti-bot checks." });
  }

  if (!address || !isValidInput(address)) {
    // Return invalid address status
    return res.status(400).send({ error: "Invalid address." });
  }

  const claimed = await hasClaimed(session.twitter_id);
  if (claimed) {
    // Return already claimed status
    return res.status(400).send({ error: "Already claimed in 24h window" });
  }

  // Setup wallet w/o RPC provider
  const wallet = new ethers.Wallet(process.env.OPERATOR_PRIVATE_KEY);

  // Generate transaction data
  const data = generateTxData(address);

  try {
    // Process faucet claim on Sepolia network
    await processDrip(wallet, data);
  } catch (e) {
    // If error in process, revert
    return res.status(500).send({ error: "Error claiming, try again later." });
  }

  // Update 24h claim status
  await client.set(session.twitter_id, "true", "EX", 86400);

  return res.status(200).send({ claimed: address });
};
