# Discuss App - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Login      │  │  Register    │  │  Discussion  │         │
│  │   Page       │  │   Page       │  │   Pages      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP ROUTER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                   Server Actions                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │ auth.actions │  │discussion.   │  │comment.      │ │    │
│  │  │              │  │actions       │  │actions       │ │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │    │
│  └─────────┼──────────────────┼──────────────────┼─────────┘    │
│            │                  │                  │               │
│  ┌─────────▼──────────────────▼──────────────────▼─────────┐   │
│  │                  NextAuth v5                             │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Credentials Provider                            │   │   │
│  │  │  - JWT Strategy                                  │   │   │
│  │  │  - Session Management                            │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MongoDB Atlas                          │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  │
│  │  │   Users     │  │ Discussions │  │  Comments   │     │  │
│  │  │ Collection  │  │ Collection  │  │ Collection  │     │  │
│  │  │             │  │             │  │             │     │  │
│  │  │ - email     │  │ - userId    │  │ - discussId │     │  │
│  │  │ - password  │  │ - title     │  │ - userId    │     │  │
│  │  │ - fullName  │  │ - desc      │  │ - desc      │     │  │
│  │  │             │  │ - upVote    │  │ - upVote    │     │  │
│  │  │             │  │ - likedBy[] │  │ - likedBy[] │     │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Authentication Flow

```
User Input (Login)
    │
    ▼
Client-side Validation
    │
    ▼
signIn() from next-auth/react
    │
    ▼
NextAuth Credentials Provider
    │
    ▼
connectDB() → MongoDB Connection
    │
    ▼
Find User by Email
    │
    ▼
Compare Password (bcrypt)
    │
    ├─ Valid → Generate JWT Token
    │           │
    │           ▼
    │       Store in httpOnly Cookie
    │           │
    │           ▼
    │       Redirect to /discussion
    │
    └─ Invalid → Return Error
```

### 2. Create Discussion Flow

```
User Input (Add Discussion Form)
    │
    ▼
Client-side Form Submission
    │
    ▼
addDiscussion() Server Action
    │
    ▼
Validate Input (title, description)
    │
    ▼
Get Session (auth())
    │
    ▼
connectDB() → MongoDB Connection
    │
    ▼
Create Discussion Document
    │
    ├─ Success → Return discussion data
    │           │
    │           ▼
    │       Revalidate page
    │           │
    │           ▼
    │       Show in UI
    │
    └─ Error → Return error message
```

### 3. Like/Unlike Flow

```
User Clicks Like Button
    │
    ▼
toggleLike() Server Action
    │
    ▼
Get Session (auth())
    │
    ▼
connectDB() → MongoDB Connection
    │
    ▼
Find Discussion by ID
    │
    ▼
Check if User Already Liked
    │
    ├─ Already Liked → Remove from likedBy[]
    │                  Decrement upVote
    │
    └─ Not Liked → Add to likedBy[]
                   Increment upVote
    │
    ▼
Update Discussion Document
    │
    ▼
Return Updated Data
    │
    ▼
Update UI
```

## Current Issues & Solutions

### Issue 1: N+1 Query Problem

```
❌ CURRENT (Inefficient):
getDiscussions()
  ├─ Find all discussions (1 query)
  └─ For each discussion:
      └─ Find user by userId (N queries)
Total: 1 + N queries

✅ SOLUTION (Efficient):
getDiscussions()
  └─ Aggregate with $lookup (1 query)
      ├─ Join discussions with users
      └─ Return combined data
Total: 1 query
```

### Issue 2: No Connection Caching

```
❌ CURRENT:
Every Request
  └─ New MongoDB Connection
      ├─ Slow (connection overhead)
      └─ Resource intensive

✅ SOLUTION:
First Request
  └─ Create Connection → Cache globally
Subsequent Requests
  └─ Reuse Cached Connection
      ├─ Fast (no overhead)
      └─ Resource efficient
```

### Issue 3: No Pagination

```
❌ CURRENT:
getDiscussions()
  └─ Return ALL discussions
      ├─ Slow for large datasets
      └─ High memory usage

✅ SOLUTION:
getDiscussionsPaginated(cursor, limit)
  └─ Return only 'limit' items
      ├─ Fast (limited data)
      ├─ Low memory usage
      └─ Cursor for next page
```

## Security Architecture

### Current State (Vulnerable)

```
User Input → Server Action → Database
    ↑            ↑              ↑
    │            │              │
No validation  No sanitization  Direct query
No rate limit  No logging       No indexes
```

### Target State (Secure)

```
User Input
    │
    ▼
Rate Limiting ✓
    │
    ▼
Input Validation (Zod) ✓
    │
    ▼
Sanitization (DOMPurify) ✓
    │
    ▼
Server Action
    │
    ▼
Error Handling ✓
    │
    ▼
Logging (Pino) ✓
    │
    ▼
Database (Indexed) ✓
    │
    ▼
Response
    │
    ▼
Monitoring (Sentry) ✓
```

## File Structure

```
discuss-app/
├── app/
│   ├── actions/              # Server Actions
│   │   ├── auth.actions.ts
│   │   ├── discussion.actions.ts
│   │   └── comment.actions.ts
│   │
│   ├── api/                  # API Routes
│   │   └── auth/[...nextauth]/route.ts
│   │
│   ├── discussion/           # Discussion Pages
│   │   ├── [id]/            # Dynamic route
│   │   ├── add-discussion/
│   │   ├── my-discussions/
│   │   └── components/
│   │
│   ├── lib/                  # Utilities
│   │   ├── auth.ts          # NextAuth config
│   │   └── mongodb.ts       # DB connection
│   │
│   ├── model/               # Mongoose Models
│   │   ├── DiscussUser.ts
│   │   ├── DiscussDiscussion.ts
│   │   └── DiscussComment.ts
│   │
│   ├── login/               # Auth Pages
│   ├── register/
│   └── globals.css
│
├── components/              # Reusable Components
│   └── ui/                 # shadcn/ui components
│
├── doc/                    # Documentation (NEW)
│   ├── README.md          # Start here
│   ├── doc.md             # Full analysis
│   ├── CHECKLIST.md       # Quick reference
│   └── CODE_FIXES.md      # Code examples
│
├── .env.local             # Environment variables (gitignored)
├── .env.example           # Template (NEW)
└── package.json
```

## Technology Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js 20
- **API**: Next.js Server Actions
- **Authentication**: NextAuth v5
- **Database**: MongoDB (Mongoose ODM)
- **Password Hashing**: bcryptjs

### Recommended Additions

- **Validation**: Zod
- **Rate Limiting**: Upstash Rate Limit
- **Caching**: Upstash Redis
- **Logging**: Pino
- **Monitoring**: Sentry
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions

## Deployment Architecture (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│                    (CDN + Edge Functions)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Application                         │
│                  (Serverless Functions)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────┐  ┌────────────┐  ┌────────────┐
│  MongoDB   │  │  Upstash   │  │   Sentry   │
│   Atlas    │  │   Redis    │  │ Monitoring │
│ (Database) │  │  (Cache)   │  │  (Errors)  │
└────────────┘  └────────────┘  └────────────┘
```

## Performance Metrics (Current vs Target)

| Metric                      | Current | Target | Priority  |
| --------------------------- | ------- | ------ | --------- |
| Database Queries (per page) | 1 + N   | 1-2    | 🔴 High   |
| Page Load Time              | ~2-3s   | <1s    | 🔴 High   |
| Time to Interactive         | ~3-4s   | <2s    | 🟡 Medium |
| Test Coverage               | 0%      | 80%+   | 🔴 High   |
| Lighthouse Score            | ~70     | 90+    | 🟡 Medium |
| Error Tracking              | None    | 100%   | 🔴 High   |

## Next Steps

1. **Review this architecture** - Understand current state
2. **Check CODE_FIXES.md** - Implement critical fixes
3. **Follow CHECKLIST.md** - Track progress
4. **Read doc.md** - Deep dive into details

---

**Last Updated**: 2026-01-14  
**Version**: 1.0
