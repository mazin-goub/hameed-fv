import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  orders: defineTable({
    userId: v.id("users"),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    orderType: v.union(v.literal("delivery"), v.literal("catering")),
    
    // Delivery order fields
    items: v.optional(v.array(v.object({
      name: v.string(),
      type: v.union(v.literal("burger"), v.literal("liver"), v.literal("sausage"), v.literal("kofta"), v.literal("lasagna"), v.literal("Lasagna"), v.literal("drinks"), v.literal("deserts"), v.literal("appetizers"), v.literal("Bukhari"), v.literal("Mandi"), v.literal("Musakhan"), v.literal("")),
      quantity: v.number(),
      customizations: v.array(v.string()),
      price: v.number(),
    }))),
    
    // Catering order fields
    eventDate: v.optional(v.string()),
    eventLocation: v.optional(v.string()),
    guestCount: v.optional(v.number()),
    cateringItems: v.optional(v.array(v.object({
      item: v.string(),
      quantity: v.number(),
    }))),
    
    totalAmount: v.number(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected"), v.literal("completed")),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_order_type", ["orderType"]),

  menuItems: defineTable({
    name: v.string(),
    type: v.union(v.literal("burger"), v.literal("liver"), v.literal("sausage"), v.literal("kofta"), v.literal("lasagna"), v.literal("Lasagna"), v.literal("drinks"), v.literal("deserts"), v.literal("appetizers"), v.literal("Bukhari"), v.literal("Mandi"), v.literal("Musakhan"), v.literal("")),
    description: v.string(),
    basePrice: v.number(),
    image: v.optional(v.id("_storage")),
    available: v.boolean(),
    customizations: v.array(v.object({
      name: v.string(),
      price: v.number(),
    })),
  })
    .index("by_type", ["type"])
    .index("by_availability", ["available"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
