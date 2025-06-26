import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import type { User } from "./types"

const secretKey = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const key = new TextEncoder().encode(secretKey)

export async function createSession(user: User) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const session = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key)

  cookies().set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })
}

export async function getSession(): Promise<User | null> {
  const session = cookies().get("session")?.value
  if (!session) return null

  try {
    const { payload } = await jwtVerify(session, key)
    return (payload as any).user
  } catch (error) {
    return null
  }
}

export async function deleteSession() {
  cookies().delete("session")
}
