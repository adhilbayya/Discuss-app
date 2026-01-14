# Critical Code Fixes - Implementation Examples

This document contains ready-to-use code for the most critical fixes needed for production.

---

## 1. Fixed MongoDB Connection (CRITICAL)

**File**: `app/lib/mongodb.ts`

Replace the entire file with this:

```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export default async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Add connection event listeners
if (process.env.NODE_ENV === "development") {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
  });
}
```

---

## 2. Input Validation with Zod

**Install**: `npm install zod`

**File**: `app/lib/validations/discussion.ts` (NEW FILE)

```typescript
import { z } from "zod";

export const createDiscussionSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters")
    .trim(),
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});

export const createCommentSchema = z.object({
  discussId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid discussion ID"),
  description: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must not exceed 2000 characters")
    .trim(),
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});

export const userRegistrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
});

export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
```

**Updated**: `app/actions/discussion.actions.ts`

```typescript
"use server";

import { auth } from "../lib/auth";
import connectDB from "../lib/mongodb";
import DiscussDiscussion from "../model/DiscussDiscussion";
import DiscussUser from "../model/DiscussUser";
import { createDiscussionSchema } from "../lib/validations/discussion";

export async function addDiscussion(
  title: string,
  description: string,
  userId: string
) {
  // Validate input
  const validation = createDiscussionSchema.safeParse({
    title,
    description,
    userId,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    };
  }

  try {
    await connectDB();
    const discussion = await DiscussDiscussion.create({
      title: validation.data.title,
      description: validation.data.description,
      userId: validation.data.userId,
      upVote: 0,
    });

    return {
      success: true,
      data: {
        _id: discussion._id.toString(),
        userId: discussion.userId,
        title: discussion.title,
        description: discussion.description,
        upVote: discussion.upVote,
        createdAt: discussion.createdAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("Error creating discussion:", err);
    return {
      success: false,
      error: "Failed to create discussion. Please try again.",
    };
  }
}
```

---

## 3. XSS Protection with Sanitization

**Install**: `npm install isomorphic-dompurify`

**File**: `app/lib/sanitize.ts` (NEW FILE)

```typescript
import DOMPurify from "isomorphic-dompurify";

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
}

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href"],
  });
}
```

**Usage in actions**:

```typescript
import { sanitizeInput } from "../lib/sanitize";

export async function addDiscussion(
  title: string,
  description: string,
  userId: string
) {
  const validation = createDiscussionSchema.safeParse({
    title: sanitizeInput(title),
    description: sanitizeInput(description),
    userId,
  });
  // ... rest of the code
}
```

---

## 4. Rate Limiting

**Install**: `npm install @upstash/ratelimit @upstash/redis`

**File**: `app/lib/rate-limit.ts` (NEW FILE)

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Create rate limiters for different actions
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"), // 5 requests per 10 seconds
  analytics: true,
  prefix: "@upstash/ratelimit:auth",
});

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"), // 20 requests per 10 seconds
  analytics: true,
  prefix: "@upstash/ratelimit:api",
});

export const discussionRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 discussions per minute
  analytics: true,
  prefix: "@upstash/ratelimit:discussion",
});
```

**Usage in login page**:

```typescript
// app/login/page.tsx
import { authRateLimit } from "@/app/lib/rate-limit";

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Rate limiting
  const identifier = email; // or use IP address
  const { success: rateLimitSuccess } = await authRateLimit.limit(identifier);

  if (!rateLimitSuccess) {
    setError("Too many login attempts. Please try again later.");
    return;
  }

  const res = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (res?.ok) {
    router.push("/discussion");
  } else {
    setError(res?.error || "Login failed");
  }
};
```

---

## 5. Proper Error Handling & Logging

**Install**: `npm install pino pino-pretty`

**File**: `app/lib/logger.ts` (NEW FILE)

```typescript
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

// Helper functions
export const logError = (error: unknown, context?: Record<string, any>) => {
  logger.error(
    {
      err: error instanceof Error ? error : new Error(String(error)),
      ...context,
    },
    "Error occurred"
  );
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(context, message);
};

export const logWarn = (message: string, context?: Record<string, any>) => {
  logger.warn(context, message);
};
```

**Usage**:

```typescript
import { logger, logError } from "../lib/logger";

export async function addDiscussion(
  title: string,
  description: string,
  userId: string
) {
  try {
    await connectDB();
    const discussion = await DiscussDiscussion.create({
      title,
      description,
      userId,
      upVote: 0,
    });

    logger.info(
      { discussionId: discussion._id.toString(), userId },
      "Discussion created successfully"
    );

    return { success: true, data: discussion };
  } catch (err) {
    logError(err, { userId, title });
    return {
      success: false,
      error: "Failed to create discussion. Please try again.",
    };
  }
}
```

---

## 6. Database Indexes

**File**: `app/model/DiscussDiscussion.ts`

```typescript
import mongoose, { Schema } from "mongoose";

export interface DiscussionDoc {
  userId: string;
  title: string;
  description: string;
  upVote: number;
  likedBy: string[];
  createdAt: Date;
}

const DiscussionSchema = new Schema<DiscussionDoc>(
  {
    userId: {
      type: String,
      required: true,
      index: true, // Add index
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    upVote: {
      type: Number,
      required: false,
      default: 0,
    },
    likedBy: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
DiscussionSchema.index({ userId: 1, createdAt: -1 });
DiscussionSchema.index({ createdAt: -1 });
DiscussionSchema.index({ upVote: -1 });

// Text index for search
DiscussionSchema.index({ title: "text", description: "text" });

export default mongoose.models.Discussion ||
  mongoose.model("Discussion", DiscussionSchema);
```

**File**: `app/model/DiscussComment.ts`

```typescript
import mongoose, { Schema } from "mongoose";

export interface DiscussCommentDoc {
  discussId: string;
  userId: string;
  description: string;
  upVote: number;
  likedBy: string[];
  createdAt: Date;
}

const CommentSchema = new Schema<DiscussCommentDoc>(
  {
    discussId: {
      type: String,
      required: true,
      index: true, // Add index
    },
    userId: {
      type: String,
      required: true,
      index: true, // Add index
    },
    description: {
      type: String,
      required: true,
    },
    upVote: {
      type: Number,
      required: false,
      default: 0,
    },
    likedBy: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
CommentSchema.index({ discussId: 1, createdAt: 1 });
CommentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.DiscussComment ||
  mongoose.model("DiscussComment", CommentSchema);
```

---

## 7. Fix N+1 Query Problem

**File**: `app/actions/discussion.actions.ts`

Replace the `getDiscussions` function:

```typescript
export async function getDiscussions() {
  try {
    await connectDB();
    const session = await auth();
    const currentUserId = session?.user?.id;

    // Use aggregation to avoid N+1 queries
    const discussions = await DiscussDiscussion.aggregate([
      {
        $lookup: {
          from: "discussusers", // Collection name (lowercase + 's')
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          userId: 1,
          title: 1,
          description: 1,
          upVote: 1,
          createdAt: 1,
          likedBy: 1,
          createdBy: "$user.fullName",
        },
      },
    ]);

    return discussions.map((d) => ({
      _id: d._id.toString(),
      userId: d.userId.toString(),
      title: d.title,
      description: d.description,
      upVote: d.upVote,
      createdAt: d.createdAt.toISOString(),
      createdBy: d.createdBy || "Unknown User",
      isLikedByCurrentUser: currentUserId
        ? d.likedBy.includes(currentUserId)
        : false,
    }));
  } catch (err) {
    logError(err, { action: "getDiscussions" });
    return [];
  }
}
```

---

## 8. Pagination Implementation

**File**: `app/actions/discussion.actions.ts`

Add new function:

```typescript
export async function getDiscussionsPaginated(
  cursor?: string,
  limit: number = 20
) {
  try {
    await connectDB();
    const session = await auth();
    const currentUserId = session?.user?.id;

    const query = cursor
      ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } }
      : {};

    const discussions = await DiscussDiscussion.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = discussions.length > limit;
    const items = hasMore ? discussions.slice(0, -1) : discussions;

    // Fetch users for these discussions
    const userIds = [...new Set(items.map((d) => d.userId))];
    const users = await DiscussUser.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const discussionsWithUser = items.map((d) => {
      const user = userMap.get(d.userId.toString());
      return {
        _id: d._id.toString(),
        userId: d.userId.toString(),
        title: d.title,
        description: d.description,
        upVote: d.upVote,
        createdAt: d.createdAt.toISOString(),
        createdBy: user?.fullName || "Unknown User",
        isLikedByCurrentUser: currentUserId
          ? d.likedBy.includes(currentUserId)
          : false,
      };
    });

    return {
      items: discussionsWithUser,
      nextCursor: hasMore ? items[items.length - 1]._id.toString() : null,
      hasMore,
    };
  } catch (err) {
    logError(err, { action: "getDiscussionsPaginated" });
    return { items: [], nextCursor: null, hasMore: false };
  }
}
```

---

## 9. Health Check Endpoint

**File**: `app/api/health/route.ts` (NEW FILE)

```typescript
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: dbStatus,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
```

---

## 10. Error Boundary Component

**File**: `components/ErrorBoundary.tsx` (NEW FILE)

```typescript
"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Send to error tracking service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                We're sorry for the inconvenience. Please try again.
              </p>
              <Button onClick={() => this.setState({ hasError: false })}>
                Try Again
              </Button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

**Usage in layout**:

```typescript
// app/discussion/layout.tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function DiscussionLayout({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
```

---

## Implementation Order

1. **Day 1**: Fix MongoDB connection (Critical)
2. **Day 1**: Add input validation with Zod
3. **Day 2**: Implement XSS protection
4. **Day 2**: Add rate limiting
5. **Day 3**: Set up proper logging
6. **Day 3**: Add database indexes
7. **Day 4**: Fix N+1 queries
8. **Day 5**: Implement pagination
9. **Day 5**: Add health check endpoint
10. **Day 6**: Add error boundaries

---

**Note**: After implementing these fixes, your application will be significantly more secure and performant. Continue with the full roadmap in `doc.md` for complete production readiness.
