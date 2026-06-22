import crypto from "crypto";

type Role = "Superadmin" | "Admin" | "Faculty" | "Student";

export type AuthTokenUser = {
  email: string;
  role: Role;
  name: string;
};

type AuthTokenPayload = AuthTokenUser & {
  exp: number;
};

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const SECRET = process.env.AUTH_TOKEN_SECRET || process.env.MONGODB_URI || "development-secret";

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

export function createAuthToken(user: AuthTokenUser): string {
  const payload = encode({ ...user, exp: Date.now() + TOKEN_TTL_MS });
  return `${payload}.${sign(payload)}`;
}

export function verifyAuthToken(token?: string): AuthTokenUser | null {
  if (!token) return null;

  const [payload, signature] = token.replace(/^Bearer\s+/i, "").split(".");
  if (!payload || !signature || sign(payload) !== signature) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as AuthTokenPayload;
    if (!data.email || !data.role || !data.name || Date.now() > data.exp) return null;

    return {
      email: data.email,
      role: data.role,
      name: data.name,
    };
  } catch {
    return null;
  }
}
