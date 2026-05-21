import { Store } from "express-session";
import prisma from "./prisma.js";

class PrismaSessionStore extends Store {
  constructor() {
    super();
  }

  async get(sid, callback) {
    try {
      const record = await prisma.session.findUnique({ where: { sid } });
      if (!record) return callback(null, null);
      if (record.expiresAt < new Date()) {
        await prisma.session.delete({ where: { sid } });
        return callback(null, null);
      }
      try {
        callback(null, JSON.parse(record.data));
      } catch {
        callback(null, null);
      }
    } catch (err) {
      callback(err);
    }
  }

  async set(sid, sessionData, callback) {
    try {
      const data = JSON.stringify(sessionData);
      const maxAge = sessionData.cookie?.maxAge;
      const expiresAt = maxAge
        ? new Date(Date.now() + maxAge)
        : new Date(Date.now() + 86400000);

      await prisma.session.upsert({
        where: { sid },
        update: { data, expiresAt },
        create: { sid, data, expiresAt },
      });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async destroy(sid, callback) {
    try {
      await prisma.session.deleteMany({ where: { sid } });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async touch(sid, sessionData, callback) {
    try {
      const maxAge = sessionData.cookie?.maxAge;
      const expiresAt = maxAge
        ? new Date(Date.now() + maxAge)
        : new Date(Date.now() + 86400000);

      await prisma.session.update({
        where: { sid },
        data: { expiresAt },
      });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

export default PrismaSessionStore;
