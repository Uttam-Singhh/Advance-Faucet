import Redis from "ioredis";
import { getSession } from "next-auth-client";

const client = new Redis(process.env.REDIS_URL);

/**
 * Checks if a twitter id has claimed from faucet in last 24h
 * @param {string} twitter_id to check
 * @returns claim status
 */
export async function hasClaimed(twitter_id) {

    const resp = await client.get(twitter_id);
    return resp ? true : false;
}

module.exports = async (req, res) => {
  // Collect session (force any for extra twitter params)
  const session = await getSession({ req });

  if (session) {
    try {
      // Collect claim status
      const claimed = await hasClaimed(session.twitter_id);
      res.status(200).send({ claimed });
    } catch {
      // If failure, return error checking status
      res.status(500).send({ error: "Error checking claim status." });
    }
  } else {
    // Return unauthed status
    res.status(401).send({ error: "Not authenticated." });
  }
};