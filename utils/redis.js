import { createClient } from "redis";

export let redisAvailable = false;

export const redisclient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      console.log("Redis reconnect attempt:", retries);
      return Math.min(retries * 500, 5000);
    },
  },
});

redisclient.on("connect", () => {
  redisAvailable = true;
  console.log("Redis connected");
});

redisclient.on("end", () => {
  redisAvailable = false;
  console.log("Redis disconnected");
});

redisclient.on("error", (err) => {
  redisAvailable = false;
  console.error("Redis error:", err.message);
});

export const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log("Redis URL missing, skipping Redis");
    return;
  }

  try {
    await redisclient.connect();
  } catch (err) {
    console.error("Redis initial connection failed");
  }
};
