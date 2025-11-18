import { db } from "./db";
import { badges, problems, tags, problemTags, users } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const [adminUser] = await db
    .insert(users)
    .values({
      name: "Admin",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "admin",
      xp: 0,
    })
    .onConflictDoNothing()
    .returning();

  console.log("Created admin user");

  // Create badges
  const badgeData = [
    {
      name: "Cache Master",
      description: "Master the art of caching by solving 5 cache-related problems",
      icon: "⚡",
      xpRequired: 100,
      componentRequired: "cache",
    },
    {
      name: "Load Balancer Guru",
      description: "Expert in load balancing strategies",
      icon: "⚖️",
      xpRequired: 150,
      componentRequired: "loadbalancer",
    },
    {
      name: "Scalability Ninja",
      description: "Reached 500 XP through system design mastery",
      icon: "🥷",
      xpRequired: 500,
      componentRequired: null,
    },
    {
      name: "Queue Architect",
      description: "Proficient in message queue architectures",
      icon: "📬",
      xpRequired: 200,
      componentRequired: "queue",
    },
    {
      name: "First Steps",
      description: "Complete your first submission",
      icon: "🎯",
      xpRequired: 20,
      componentRequired: null,
    },
    {
      name: "Rising Star",
      description: "Earned 1000 XP",
      icon: "⭐",
      xpRequired: 1000,
      componentRequired: null,
    },
  ];

  await db.insert(badges).values(badgeData).onConflictDoNothing();
  console.log("Created badges");

  // Create tags
  const tagData = [
    { name: "Scalability" },
    { name: "Caching" },
    { name: "Load Balancing" },
    { name: "Database" },
    { name: "Messaging" },
    { name: "CDN" },
    { name: "Microservices" },
    { name: "Storage" },
  ];

  const createdTags = await db.insert(tags).values(tagData).onConflictDoNothing().returning();
  console.log("Created tags");

  // Create sample problems
  const problemData = [
    {
      title: "Design a URL Shortener",
      slug: "url-shortener",
      difficulty: "medium",
      descriptionMdx: `# Design a URL Shortener Service

Design a system like bit.ly or TinyURL that converts long URLs into short, memorable links.

## Requirements

- Generate short, unique URLs
- Redirect users from short URL to original URL
- Track click analytics
- Handle high read/write traffic
- Scale to millions of URLs

## Constraints

- Short URLs should be 6-8 characters
- System should handle 1000+ requests per second
- 99.9% uptime required`,
      constraints: "Handle 1000 QPS, support 100M URLs",
      hints: [
        "Consider using a hash function for generating short codes",
        "Think about how to handle collisions",
        "Cache frequently accessed URLs",
        "Use a NoSQL database for fast lookups",
      ],
      requiredComponents: ["database", "cache", "loadbalancer"],
    },
    {
      title: "Design Instagram",
      slug: "design-instagram",
      difficulty: "hard",
      descriptionMdx: `# Design Instagram

Design a photo-sharing social media platform like Instagram.

## Requirements

- Upload and store photos/videos
- Follow/unfollow users
- Generate news feed
- Like and comment on posts
- Search functionality
- Stories feature (24-hour expiration)

## Scale

- 500M daily active users
- 100M photos uploaded per day
- Average photo size: 2MB`,
      constraints: "Support 500M DAU, handle 100M daily uploads",
      hints: [
        "Use CDN for image delivery",
        "Consider blob storage for media files",
        "Think about feed generation strategies",
        "Use caching for popular content",
      ],
      requiredComponents: ["storage", "cdn", "database", "cache", "loadbalancer"],
    },
    {
      title: "Design a Chat Application",
      slug: "chat-application",
      difficulty: "medium",
      descriptionMdx: `# Design a Chat Application

Design a real-time messaging system like WhatsApp or Slack.

## Requirements

- One-to-one messaging
- Group chats
- Message delivery confirmation
- Online/offline status
- Push notifications
- Message history

## Scale

- 50M active users
- 500M messages per day`,
      constraints: "Handle 50M users, support real-time messaging",
      hints: [
        "Use WebSockets for real-time communication",
        "Consider message queues for reliability",
        "Think about how to handle offline users",
        "Use database sharding for message storage",
      ],
      requiredComponents: ["queue", "database", "loadbalancer", "cache"],
    },
    {
      title: "Design Netflix",
      slug: "design-netflix",
      difficulty: "hard",
      descriptionMdx: `# Design Netflix

Design a video streaming platform like Netflix or YouTube.

## Requirements

- Upload and store videos
- Transcode videos to multiple formats/resolutions
- Stream videos with adaptive bitrate
- Recommendation system
- Search functionality
- User profiles and watch history

## Scale

- 200M subscribers
- 1B hours of video watched per week`,
      constraints: "Support 200M users, stream video globally",
      hints: [
        "Use CDN for global content delivery",
        "Consider blob storage for video files",
        "Think about video transcoding pipeline",
        "Use caching for metadata and recommendations",
      ],
      requiredComponents: ["cdn", "storage", "database", "cache", "queue", "loadbalancer"],
    },
    {
      title: "Design Twitter",
      slug: "design-twitter",
      difficulty: "hard",
      descriptionMdx: `# Design Twitter

Design a microblogging platform like Twitter.

## Requirements

- Post tweets (280 characters)
- Follow/unfollow users
- Generate timeline/feed
- Like, retweet, reply
- Trending topics
- Search functionality

## Scale

- 300M daily active users
- 500M tweets per day`,
      constraints: "Handle 300M DAU, process 500M tweets daily",
      hints: [
        "Use fan-out approach for timeline generation",
        "Consider message queues for async processing",
        "Think about caching strategies for timelines",
        "Use full-text search for tweet search",
      ],
      requiredComponents: ["database", "cache", "queue", "loadbalancer"],
    },
  ];

  const createdProblems = await db.insert(problems).values(problemData).onConflictDoNothing().returning();
  console.log("Created problems");

  // Associate tags with problems
  if (createdProblems.length > 0 && createdTags.length > 0) {
    const problemTagAssociations = [
      { problemId: createdProblems[0].id, tagId: createdTags[1].id }, // URL Shortener - Caching
      { problemId: createdProblems[0].id, tagId: createdTags[3].id }, // URL Shortener - Database
      { problemId: createdProblems[1].id, tagId: createdTags[0].id }, // Instagram - Scalability
      { problemId: createdProblems[1].id, tagId: createdTags[5].id }, // Instagram - CDN
      { problemId: createdProblems[1].id, tagId: createdTags[7].id }, // Instagram - Storage
      { problemId: createdProblems[2].id, tagId: createdTags[4].id }, // Chat - Messaging
      { problemId: createdProblems[2].id, tagId: createdTags[3].id }, // Chat - Database
      { problemId: createdProblems[3].id, tagId: createdTags[5].id }, // Netflix - CDN
      { problemId: createdProblems[3].id, tagId: createdTags[7].id }, // Netflix - Storage
      { problemId: createdProblems[3].id, tagId: createdTags[0].id }, // Netflix - Scalability
      { problemId: createdProblems[4].id, tagId: createdTags[0].id }, // Twitter - Scalability
      { problemId: createdProblems[4].id, tagId: createdTags[4].id }, // Twitter - Messaging
    ];

    await db.insert(problemTags).values(problemTagAssociations).onConflictDoNothing();
    console.log("Associated tags with problems");
  }

  console.log("Seeding completed!");
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
