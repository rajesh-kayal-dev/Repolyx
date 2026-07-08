import { settingsService } from "../services/settings.service.js";
import { settingsSchemas } from "../validators/settings.validator.js";

export const getProfile = async (req, res, next) => {
  try {
    const data = await settingsService.getProfile(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const parsed = settingsSchemas.profileUpdate.parse(req.body);
    await settingsService.updateProfile(req.user.id, parsed);
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const getGithubIntegration = async (req, res, next) => {
  try {
    const data = await settingsService.getGithubIntegration(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const disconnectGithub = async (req, res, next) => {
  try {
    await settingsService.disconnectGithub(req.user.id);
    res.json({ success: true, message: "GitHub disconnected successfully" });
  } catch (error) {
    next(error);
  }
};

export const getAppearance = async (req, res, next) => {
  try {
    const data = await settingsService.getAppearance(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateAppearance = async (req, res, next) => {
  try {
    const parsed = settingsSchemas.appearanceUpdate.parse(req.body);
    const data = await settingsService.updateAppearance(req.user.id, parsed);
    res.json({ success: true, message: "Appearance updated", data });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const data = await settingsService.getNotifications(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateNotifications = async (req, res, next) => {
  try {
    const parsed = settingsSchemas.notificationUpdate.parse(req.body);
    const data = await settingsService.updateNotifications(req.user.id, parsed);
    res.json({ success: true, message: "Notifications updated", data });
  } catch (error) {
    next(error);
  }
};

export const getAIPreferences = async (req, res, next) => {
  try {
    const data = await settingsService.getAIPreferences(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateAIPreferences = async (req, res, next) => {
  try {
    const parsed = settingsSchemas.aiPreferenceUpdate.parse(req.body);
    const data = await settingsService.updateAIPreferences(req.user.id, parsed);
    res.json({ success: true, message: "AI preferences updated", data });
  } catch (error) {
    next(error);
  }
};

export const getSecurity = async (req, res, next) => {
  try {
    const sessions = await settingsService.getSessions(req.user.id);
    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    await settingsService.deleteSession(req.user.id, req.params.id);
    res.json({ success: true, message: "Session terminated" });
  } catch (error) {
    next(error);
  }
};

export const deleteAllOtherSessions = async (req, res, next) => {
  try {
    // Current session ID would be passed in body or extracted from token in a real session management.
    // Assuming for now it's passed in body.
    await settingsService.deleteAllOtherSessions(req.user.id, req.body.currentSessionId);
    res.json({ success: true, message: "All other sessions terminated" });
  } catch (error) {
    next(error);
  }
};

export const listAccessTokens = async (req, res, next) => {
  try {
    const data = await settingsService.listAccessTokens(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createAccessToken = async (req, res, next) => {
  try {
    const parsed = settingsSchemas.accessTokenCreate.parse(req.body);
    const data = await settingsService.createAccessToken(req.user.id, parsed);
    res.json({ success: true, message: "Token created", data });
  } catch (error) {
    next(error);
  }
};

export const revokeAccessToken = async (req, res, next) => {
  try {
    await settingsService.revokeAccessToken(req.user.id, req.params.id);
    res.json({ success: true, message: "Token revoked" });
  } catch (error) {
    next(error);
  }
};

export const deleteAccessToken = async (req, res, next) => {
  try {
    await settingsService.deleteAccessToken(req.user.id, req.params.id);
    res.json({ success: true, message: "Token deleted" });
  } catch (error) {
    next(error);
  }
};
