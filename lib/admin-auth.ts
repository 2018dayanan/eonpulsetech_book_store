import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'super-secret-admin-key-change-me';
const key = new TextEncoder().encode(secretKey);

export async function encryptAdmin(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decryptAdmin(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function getAdminSession() {
  const session = (await cookies()).get('adminSession')?.value;
  if (!session) return null;
  try {
    return await decryptAdmin(session);
  } catch (error) {
    return null;
  }
}

export async function deleteAdminSession() {
  (await cookies()).delete('adminSession');
}
