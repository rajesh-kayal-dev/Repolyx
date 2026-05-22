import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { userService } from "../services/user.service.js";
import { env } from "./env.js";
import logger from "../utils/logger.js";

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: "https://repolyx-server.onrender.com/api/auth/github/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await userService.findOrCreateGitHubUser(profile, accessToken);
        return done(null, user);
      } catch (error) {
        logger.error(`Error inside GitHub OAuth strategy:`, error);
        return done(error);
      }
    }
  )
);

export default passport;