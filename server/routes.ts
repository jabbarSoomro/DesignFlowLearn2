import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  insertUserSchema,
  loginSchema,
  insertProblemSchema,
  insertSubmissionSchema,
  insertCommentSchema,
  insertBadgeSchema,
  type User,
} from "@shared/schema";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set");
}
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
interface AuthRequest extends Request {
  user?: User;
}

async function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Scoring logic
function calculateScore(diagramJson: any, requiredComponents: string[]): number {
  const nodes = diagramJson?.nodes || [];
  const nodeTypes = new Set(nodes.map((node: any) => {
    const id = node.id || '';
    return id.split('-')[0];
  }));

  const usedRequired = requiredComponents.filter(component => 
    nodeTypes.has(component.toLowerCase().replace(/\s+/g, ''))
  );

  const score = Math.round((usedRequired.length / requiredComponents.length) * 100);
  return Math.max(0, Math.min(100, score));
}

// Badge awarding logic
async function checkAndAwardBadges(userId: string, submissionDiagramJson?: any) {
  const user = await storage.getUser(userId);
  if (!user) return;

  const badges = await storage.getBadges();
  const userBadges = await storage.getUserBadges(userId);
  const userBadgeIds = new Set(userBadges.map(b => b.id));

  // Get all user submissions to track component usage
  const allSubmissions = await storage.getSubmissions(userId);
  const usedComponents = new Set<string>();
  
  // Track components from all submissions including current one
  for (const submission of allSubmissions) {
    const nodes = submission.diagramJson?.nodes || [];
    nodes.forEach((node: any) => {
      const type = node.id?.split('-')[0]?.toLowerCase();
      if (type) usedComponents.add(type);
    });
  }
  
  // Also add components from current submission if provided
  if (submissionDiagramJson) {
    const nodes = submissionDiagramJson?.nodes || [];
    nodes.forEach((node: any) => {
      const type = node.id?.split('-')[0]?.toLowerCase();
      if (type) usedComponents.add(type);
    });
  }

  for (const badge of badges) {
    if (userBadgeIds.has(badge.id)) continue;

    let shouldAward = false;

    // Component-based badges - check if user has used the required component
    if (badge.componentRequired) {
      const requiredComponent = badge.componentRequired.toLowerCase().replace(/\s+/g, '');
      if (usedComponents.has(requiredComponent)) {
        // Also check XP requirement if specified
        if (!badge.xpRequired || user.xp >= badge.xpRequired) {
          shouldAward = true;
        }
      }
    }
    // XP-only badges
    else if (badge.xpRequired && user.xp >= badge.xpRequired) {
      shouldAward = true;
    }

    if (shouldAward) {
      await storage.awardBadge(userId, badge.id);
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);
      
      // Create user
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role || 'learner',
      });

      // Generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ user, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(data.password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ user, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateUser, async (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  // Problem routes
  app.get('/api/problems', authenticateUser, async (req, res) => {
    try {
      const problems = await storage.getProblems();
      res.json(problems);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch problems' });
    }
  });

  app.get('/api/problems/:slug', authenticateUser, async (req, res) => {
    try {
      const problem = await storage.getProblemBySlug(req.params.slug);
      if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
      }
      res.json(problem);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch problem' });
    }
  });

  // Tag routes
  app.get('/api/tags', authenticateUser, async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tags' });
    }
  });

  // Submission routes
  app.post('/api/submissions', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const data = insertSubmissionSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      // Get problem to check required components
      const problem = await storage.getProblemById(data.problemId);
      if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
      }

      // Calculate score
      const score = calculateScore(data.diagramJson, problem.requiredComponents || []);

      // Create submission
      const submission = await storage.createSubmission({
        ...data,
        score,
      });

      // Award XP
      let xpAwarded = 0;
      if (score >= 80) {
        xpAwarded = 20;
        if (data.explanation.length > 100) {
          xpAwarded += 5; // Bonus for good explanation
        }
      } else if (score >= 50) {
        xpAwarded = 10;
      }

      if (xpAwarded > 0) {
        const currentUser = await storage.getUser(req.user!.id);
        await storage.updateUserXP(req.user!.id, currentUser!.xp + xpAwarded);
        await storage.createXPLog(req.user!.id, xpAwarded, `Submission for ${problem.title}`);
        
        // Check and award badges with current submission
        await checkAndAwardBadges(req.user!.id, data.diagramJson);
      }

      res.json({ ...submission, xpAwarded });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: 'Failed to create submission' });
    }
  });

  app.get('/api/submissions', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const submissions = await storage.getSubmissions(req.user!.id);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch submissions' });
    }
  });

  app.get('/api/submissions/:problemId', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const submissions = await storage.getSubmissions(req.user!.id, req.params.problemId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch submissions' });
    }
  });

  // Comment routes
  app.get('/api/comments/:problemId', authenticateUser, async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.problemId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch comments' });
    }
  });

  app.post('/api/comments', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const data = insertCommentSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const comment = await storage.createComment(data);
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: 'Failed to create comment' });
    }
  });

  app.post('/api/comments/:commentId/upvote', authenticateUser, async (req, res) => {
    try {
      await storage.upvoteComment(req.params.commentId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to upvote comment' });
    }
  });

  // Badge routes
  app.get('/api/badges', authenticateUser, async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch badges' });
    }
  });

  // Leaderboard route
  app.get('/api/leaderboard', authenticateUser, async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
  });

  // User routes
  app.get('/api/users/:id', authenticateUser, async (req, res) => {
    try {
      const user = await storage.getUserWithBadges(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Admin routes
  app.get('/api/admin/analytics', authenticateUser, requireAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/admin/problems', authenticateUser, requireAdmin, async (req, res) => {
    try {
      const problems = await storage.getProblems();
      res.json(problems);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch problems' });
    }
  });

  app.post('/api/admin/problems', authenticateUser, requireAdmin, async (req, res) => {
    try {
      const data = insertProblemSchema.parse(req.body);
      const problem = await storage.createProblem(data, []);
      res.json(problem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: 'Failed to create problem' });
    }
  });

  app.put('/api/admin/problems/:id', authenticateUser, requireAdmin, async (req, res) => {
    try {
      const data = insertProblemSchema.partial().parse(req.body);
      const problem = await storage.updateProblem(req.params.id, data);
      res.json(problem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: 'Failed to update problem' });
    }
  });

  app.delete('/api/admin/problems/:id', authenticateUser, requireAdmin, async (req, res) => {
    try {
      await storage.deleteProblem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete problem' });
    }
  });

  app.post('/api/admin/badges', authenticateUser, requireAdmin, async (req, res) => {
    try {
      const data = insertBadgeSchema.parse(req.body);
      const badge = await storage.createBadge(data);
      res.json(badge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: 'Failed to create badge' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
