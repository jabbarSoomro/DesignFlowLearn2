import { db } from "./db";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import {
  users,
  problems,
  tags,
  problemTags,
  submissions,
  comments,
  badges,
  userBadges,
  xpLogs,
  type User,
  type InsertUser,
  type Problem,
  type InsertProblem,
  type Tag,
  type InsertTag,
  type Submission,
  type InsertSubmission,
  type Comment,
  type InsertComment,
  type Badge,
  type InsertBadge,
  type ProblemWithTags,
  type SubmissionWithUser,
  type CommentWithUser,
  type UserWithBadges,
  type LeaderboardEntry,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXP(userId: string, xp: number): Promise<void>;
  getUserWithBadges(userId: string): Promise<UserWithBadges | undefined>;

  // Problems
  getProblems(): Promise<ProblemWithTags[]>;
  getProblemBySlug(slug: string): Promise<ProblemWithTags | undefined>;
  getProblemById(id: string): Promise<Problem | undefined>;
  createProblem(problem: InsertProblem, tagIds: string[]): Promise<Problem>;
  updateProblem(id: string, problem: Partial<InsertProblem>): Promise<Problem>;
  deleteProblem(id: string): Promise<void>;

  // Tags
  getTags(): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;

  // Submissions
  getSubmissions(userId?: string, problemId?: string): Promise<SubmissionWithUser[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getUserSubmissionCount(userId: string): Promise<number>;

  // Comments
  getComments(problemId: string): Promise<CommentWithUser[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  upvoteComment(commentId: string): Promise<void>;

  // Badges
  getBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  awardBadge(userId: string, badgeId: string): Promise<void>;
  getUserBadges(userId: string): Promise<Badge[]>;

  // XP Logs
  createXPLog(userId: string, amount: number, reason: string): Promise<void>;

  // Leaderboard
  getLeaderboard(): Promise<LeaderboardEntry[]>;

  // Analytics
  getAnalytics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserXP(userId: string, xp: number): Promise<void> {
    await db.update(users).set({ xp }).where(eq(users.id, userId));
  }

  async getUserWithBadges(userId: string): Promise<UserWithBadges | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return undefined;

    const userBadgeRecords = await db
      .select({ badge: badges })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));

    return {
      ...user,
      badges: userBadgeRecords.map((r) => r.badge),
    };
  }

  // Problems
  async getProblems(): Promise<ProblemWithTags[]> {
    const allProblems = await db.select().from(problems).orderBy(desc(problems.createdAt));
    
    const problemsWithTags = await Promise.all(
      allProblems.map(async (problem) => {
        const problemTagRecords = await db
          .select({ tag: tags })
          .from(problemTags)
          .innerJoin(tags, eq(problemTags.tagId, tags.id))
          .where(eq(problemTags.problemId, problem.id));

        return {
          ...problem,
          tags: problemTagRecords.map((r) => r.tag),
        };
      })
    );

    return problemsWithTags;
  }

  async getProblemBySlug(slug: string): Promise<ProblemWithTags | undefined> {
    const [problem] = await db.select().from(problems).where(eq(problems.slug, slug));
    if (!problem) return undefined;

    const problemTagRecords = await db
      .select({ tag: tags })
      .from(problemTags)
      .innerJoin(tags, eq(problemTags.tagId, tags.id))
      .where(eq(problemTags.problemId, problem.id));

    return {
      ...problem,
      tags: problemTagRecords.map((r) => r.tag),
    };
  }

  async getProblemById(id: string): Promise<Problem | undefined> {
    const [problem] = await db.select().from(problems).where(eq(problems.id, id));
    return problem || undefined;
  }

  async createProblem(problem: InsertProblem, tagIds: string[]): Promise<Problem> {
    const [newProblem] = await db.insert(problems).values(problem).returning();

    if (tagIds.length > 0) {
      await db.insert(problemTags).values(
        tagIds.map((tagId) => ({
          problemId: newProblem.id,
          tagId,
        }))
      );
    }

    return newProblem;
  }

  async updateProblem(id: string, problem: Partial<InsertProblem>): Promise<Problem> {
    const [updated] = await db.update(problems).set(problem).where(eq(problems.id, id)).returning();
    return updated;
  }

  async deleteProblem(id: string): Promise<void> {
    await db.delete(problems).where(eq(problems.id, id));
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return await db.select().from(tags);
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const [newTag] = await db.insert(tags).values(tag).returning();
    return newTag;
  }

  // Submissions
  async getSubmissions(userId?: string, problemId?: string): Promise<SubmissionWithUser[]> {
    let query = db
      .select({
        submission: submissions,
        user: { name: users.name, email: users.email },
      })
      .from(submissions)
      .innerJoin(users, eq(submissions.userId, users.id))
      .orderBy(desc(submissions.createdAt));

    if (userId && problemId) {
      query = query.where(and(eq(submissions.userId, userId), eq(submissions.problemId, problemId)));
    } else if (userId) {
      query = query.where(eq(submissions.userId, userId));
    } else if (problemId) {
      query = query.where(eq(submissions.problemId, problemId));
    }

    const results = await query;
    return results.map((r) => ({ ...r.submission, user: r.user }));
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db.insert(submissions).values(submission).returning();
    return newSubmission;
  }

  async getUserSubmissionCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(distinct ${submissions.problemId})` })
      .from(submissions)
      .where(eq(submissions.userId, userId));
    return result[0]?.count || 0;
  }

  // Comments
  async getComments(problemId: string): Promise<CommentWithUser[]> {
    const allComments = await db
      .select({
        comment: comments,
        user: { name: users.name, email: users.email },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.problemId, problemId))
      .orderBy(desc(comments.createdAt));

    return allComments.map((r) => ({ ...r.comment, user: r.user }));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async upvoteComment(commentId: string): Promise<void> {
    await db
      .update(comments)
      .set({ upvotes: sql`${comments.upvotes} + 1` })
      .where(eq(comments.id, commentId));
  }

  // Badges
  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [newBadge] = await db.insert(badges).values(badge).returning();
    return newBadge;
  }

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    // Check if already awarded
    const existing = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));

    if (existing.length === 0) {
      await db.insert(userBadges).values({ userId, badgeId });
    }
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    const userBadgeRecords = await db
      .select({ badge: badges })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));

    return userBadgeRecords.map((r) => r.badge);
  }

  // XP Logs
  async createXPLog(userId: string, amount: number, reason: string): Promise<void> {
    await db.insert(xpLogs).values({ userId, amount, reason });
  }

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const allUsers = await db.select().from(users).orderBy(desc(users.xp));

    const entries = await Promise.all(
      allUsers.map(async (user, index) => {
        const solvedCount = await this.getUserSubmissionCount(user.id);
        const userBadgesList = await this.getUserBadges(user.id);

        return {
          rank: index + 1,
          user,
          solvedCount,
          badges: userBadgesList,
        };
      })
    );

    return entries;
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [totalProblems] = await db.select({ count: sql<number>`count(*)` }).from(problems);
    const [totalSubmissions] = await db.select({ count: sql<number>`count(*)` }).from(submissions);
    const [totalBadgesAwarded] = await db.select({ count: sql<number>`count(*)` }).from(userBadges);

    return {
      totalUsers: totalUsers.count,
      totalProblems: totalProblems.count,
      totalSubmissions: totalSubmissions.count,
      totalBadgesAwarded: totalBadgesAwarded.count,
    };
  }
}

export const storage = new DatabaseStorage();
