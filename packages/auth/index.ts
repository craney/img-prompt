import { authOptions } from "./nextauth";
import { getServerSession } from "next-auth";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export { authOptions };

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}
