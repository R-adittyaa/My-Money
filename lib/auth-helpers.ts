import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";
import { User } from "./types";

const redis = new Redis({
  url: (process.env.UPSTASH_REDIS_REST_URL || "").trim(),
  token: (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim(),
});

const USERS_KEY = "my-money:users";

export async function getUsers(): Promise<User[]> {
  try {
    const data = await redis.get<User[]>(USERS_KEY);
    return data || [];
  } catch (err) {
    console.error("Get users error:", err);
    return [];
  }
}

export async function saveUsers(users: User[]) {
  await redis.set(USERS_KEY, users);
}

export async function findUserByUsername(
  username: string
): Promise<User | null> {
  const users = await getUsers();
  const lower = username.toLowerCase();
  return users.find((u) => u.username.toLowerCase() === lower) || null;
}

export async function createUser(
  username: string,
  password: string,
  displayName: string
): Promise<User> {
  const users = await getUsers();

  // Cek username udah ada
  const exists = users.some(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (exists) {
    throw new Error("Username sudah dipakai");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: crypto.randomUUID(),
    username: username.trim(),
    passwordHash,
    displayName: displayName.trim() || username.trim(),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);
  return newUser;
}

export async function verifyPassword(
  user: User,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

export async function updateUserPassword(
  userId: string,
  newPassword: string
) {
  const users = await getUsers();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const updated = users.map((u) =>
    u.id === userId ? { ...u, passwordHash } : u
  );
  await saveUsers(updated);
}

export async function updateUserProfile(
  userId: string,
  displayName: string
) {
  const users = await getUsers();
  const updated = users.map((u) =>
    u.id === userId ? { ...u, displayName: displayName.trim() } : u
  );
  await saveUsers(updated);
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
}