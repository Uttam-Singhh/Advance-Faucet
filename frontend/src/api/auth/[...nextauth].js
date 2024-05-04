import NextAuth from "next-auth";
import Providers from 'next-auth/providers';

export default NextAuth({
    // Configure one or more authentication providers
    providers: [
        Providers.Twitter({
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET
        })
    ],

    // Custom page:
    pages: {
        error: "/",
    },

    // Configure JWT token
    jwt: {
        secret: process.env.JWT_SECRET
    },

    // Configure session
    session: {
        // JWT token will be stored in cookies
        jwt: true,
        // 1 day expiry
        maxAge: 24 * 60 * 60,
        // Refresh JWT on each login
        updateAge: 0,
    },

    callbacks: {
        // On signin + signout
        async jwt(token, user, account, profile) {

            // Check if user is signing in (versus logging out)
            const isSignIn = user ? true : false;
            // If signing in
            if (isSignIn) {
                // Attach additional parameters (twitter id + handle + anti-bot measures)
                token.twitter_id = account?.id;
                token.twitter_handle = profile?.screen_name;
                token.twitter_num_tweets = profile?.statuses_count;
                token.twitter_num_followers = profile?.followers_count;
                token.twitter_created_at = profile?.created_at;
            }

            // Resolve JWT
            return Promise.resolve(token);
        },

        // On session retrieval
        async session(session, user) {
            // Attach additional params from JWT to session
            session.twitter_id = user.twitter_id;
            session.twitter_handle = user.twitter_handle;
            session.twitter_num_tweets = user.twitter_num_tweets;
            session.twitter_num_followers = user.twitter_num_followers;
            session.twitter_created_at = user.twitter_created_at;

            // Resolve session
            return Promise.resolve(session);
        }

    }

});