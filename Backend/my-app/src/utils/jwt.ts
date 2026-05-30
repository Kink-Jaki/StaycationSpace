import { sign, verify } from "hono/jwt";

const SECRET = "my-super-secret-key";

export const generateToken = async (
  payload: Record<string, unknown>
) => {
  return await sign(
    payload,
    SECRET,
    "HS256"
  );
};

export const verifyToken = async (
  token: string
) => {
  return await verify(
    token,
    SECRET,
    "HS256"
  );
};