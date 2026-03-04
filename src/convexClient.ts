import { ConvexReactClient } from "convex/react";

// جايب الرابط من .env.local
const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

// Client جاهز تستخدمه في أي مكان
export const convex = new ConvexReactClient(convexUrl);