import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, emailVerificationTokens } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { emailService } from "./services/email";
import { db } from "./db";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      tableName: "sessions",
      createTableIfMissing: false,
    }),
    cookie: {
      secure: false, // Set to false for development to fix session issues
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax', // Allow cross-site requests for proper session handling
    },
    name: 'connect.sid',
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          }
          
          // Check if email is verified
          if (!user.isEmailVerified) {
            return done(null, false, { message: "Please verify your email address before signing in" });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log('Deserializing user with ID:', id);
      const user = await storage.getUser(String(id));
      if (!user) {
        console.log('User not found during deserialization:', id);
        // User not found, clear the session
        return done(null, false);
      }
      console.log('User deserialized successfully:', user.id);
      done(null, user);
    } catch (error) {
      console.error('Session deserialization error:', error);
      // Clear the session if there's an error retrieving the user
      done(null, false);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, userType } = req.body;

      // Validate input
      if (!email || !password || !firstName || !lastName || !userType) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!["founder", "investor"].includes(userType)) {
        return res.status(400).json({ message: "Invalid user type" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Create user with email verification disabled initially
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        id: "", // Will be generated in createUser method
        email,
        password: hashedPassword,
        firstName,
        lastName,
        userType,
        isEmailVerified: false,
      });

      // Generate verification token
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store verification token
      await db.insert(emailVerificationTokens).values({
        id: nanoid(),
        userId: user.id,
        token,
        expiresAt,
      });

      // Send verification email
      const emailSent = await emailService.sendVerificationEmail(user.email, token, user.firstName);
      
      if (!emailSent) {
        console.error("Failed to send verification email for user:", user.id);
      }

      // Return user info without auto-login (require email verification first)
      res.status(201).json({ 
        userId: user.id,
        message: "Account created successfully. Please check your email to verify your account.",
        emailSent
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login endpoint with enhanced error handling
  app.post("/api/login", async (req, res, next) => {
    try {
      // Wrap passport authentication in a promise for better error handling
      const authenticateUser = () => {
        return new Promise((resolve, reject) => {
          passport.authenticate("local", (err: any, user: any, info: any) => {
            if (err) {
              console.error("Passport authentication error:", err);
              return reject(new Error("Authentication failed"));
            }
            if (!user) {
              return resolve({ success: false, message: info?.message || "Invalid credentials" });
            }
            resolve({ success: true, user });
          })(req, res, next);
        });
      };

      const authResult: any = await authenticateUser();

      if (!authResult.success) {
        return res.status(401).json({ message: authResult.message });
      }

      // Login user with error handling
      const loginUser = () => {
        return new Promise((resolve, reject) => {
          req.login(authResult.user, (err) => {
            if (err) {
              console.error("Login session error:", err);
              return reject(new Error("Session creation failed"));
            }
            resolve(authResult.user);
          });
        });
      };

      await loginUser();
      res.json({ user: authResult.user, message: "Login successful" });

    } catch (error: any) {
      console.error("Login endpoint error:", error);
      
      // Provide specific error messages for debugging
      if (error.message.includes("database") || error.message.includes("connection")) {
        return res.status(500).json({ message: "Database connection error. Please try again." });
      }
      
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.get("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  });

  // Get current user with enhanced error handling
  app.get("/api/user", async (req, res) => {
    try {
      console.log('User authentication check:', {
        isAuthenticated: req.isAuthenticated(),
        hasUser: !!req.user,
        userId: req.user?.id
      });

      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Verify user still exists in database
      const user = await storage.getUser(String(req.user.id));
      if (!user) {
        console.log('User not found in database:', req.user.id);
        // User no longer exists, clear session
        req.logout((err) => {
          if (err) console.error('Logout error:', err);
        });
        return res.status(401).json({ message: "Not authenticated" });
      }

      console.log('User authenticated successfully:', user.id);
      res.json(user);
    } catch (error) {
      console.error('User authentication check failed:', error);
      // Clear session on error
      req.logout((err) => {
        if (err) console.error('Logout error:', err);
      });
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Session cleanup endpoint
  app.post("/api/clear-session", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Session clear error:', err);
        return res.status(500).json({ message: 'Failed to clear session' });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ message: 'Failed to destroy session' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Session cleared successfully' });
      });
    });
  });
}

// Middleware to protect routes
export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}