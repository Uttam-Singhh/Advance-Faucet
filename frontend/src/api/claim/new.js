import Redis from "ioredis"; // Redis
import { ethers } from "ethers"; // Ethers
import { getSession } from "next-auth/client"; // Session management
import { isValidInput } from "../../app/page"; // Address check
import parseTwitterDate from "../../../utils/dates"; // Parse Twitter dates
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

 // Basic anti-bot measures
 const ONE_MONTH_SECONDS = 2629746;
 if (
   // Less than 1 tweet
   session.twitter_num_tweets == 0 ||
   // Less than 15 followers
   session.twitter_num_followers < 100 ||
   // Less than 1 month old
   new Date().getTime() -
     parseTwitterDate(session.twitter_created_at).getTime() <
     ONE_MONTH_SECONDS
 ) {
  //  // Return invalid Twitter account status
  // return res
  //    .status(400)
  //    .send({ error: "Twitter account does not pass anti-bot checks." });
 }


