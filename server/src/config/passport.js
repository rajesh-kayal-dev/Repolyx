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
      callbackURL: "/api/auth/github/callback"
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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.getUserById(id);
    done(null, user);
  } catch (error) {
    logger.error(`Failed to deserialize user:`, error);
    done(error);
  }
});

export default passport;