import { Timestamp } from "firebase/firestore";
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: "admin" | "operator";
  canOverride?: boolean; // optional, only relevant for admins
  

  createdAt?: Timestamp;
  phone?: string;
}

export const createUserData = (data: Omit<User, "createdAt">): User => ({
  ...data,
  createdAt: Timestamp.now(),
});
