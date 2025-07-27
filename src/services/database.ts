import { neon } from '@neondatabase/serverless';

// This will be set from environment variables in Netlify
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

let sql: any = null;

// Initialize database connection
function initDatabase() {
  if (!sql && DATABASE_URL) {
    sql = neon(DATABASE_URL);
  }
  return sql;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Create users table if it doesn't exist
export async function createUsersTable() {
  const db = initDatabase();
  if (!db) {
    console.warn('Database not initialized - using local storage fallback');
    return;
  }

  try {
    await db`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        picture TEXT,
        verified_email BOOLEAN DEFAULT false,
        onboarding_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Users table created/verified');
  } catch (error) {
    console.error('Error creating users table:', error);
  }
}

// Save or update user in database
export async function saveUser(userData: User): Promise<User | null> {
  const db = initDatabase();
  if (!db) {
    console.warn('Database not available - using local storage');
    return userData;
  }

  try {
    const result = await db`
      INSERT INTO users (id, email, name, picture, verified_email, onboarding_completed)
      VALUES (${userData.id}, ${userData.email}, ${userData.name}, ${userData.picture || null}, ${userData.verified_email || false}, ${userData.onboarding_completed || false})
      ON CONFLICT (email) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        picture = EXCLUDED.picture,
        verified_email = EXCLUDED.verified_email,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    return result[0] || userData;
  } catch (error) {
    console.error('Error saving user:', error);
    return userData; // Fallback to returning the original data
  }
}

// Get user from database
export async function getUser(email: string): Promise<User | null> {
  const db = initDatabase();
  if (!db) {
    console.warn('Database not available - using local storage');
    return null;
  }

  try {
    const result = await db`
      SELECT * FROM users WHERE email = ${email}
    `;
    
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Update user onboarding status
export async function updateUserOnboarding(email: string, completed: boolean): Promise<boolean> {
  const db = initDatabase();
  if (!db) {
    console.warn('Database not available - using local storage');
    return true; // Return true to not break the flow
  }

  try {
    await db`
      UPDATE users 
      SET onboarding_completed = ${completed}, updated_at = CURRENT_TIMESTAMP
      WHERE email = ${email}
    `;
    
    return true;
  } catch (error) {
    console.error('Error updating user onboarding:', error);
    return false;
  }
}

// Initialize database on app start
export async function initializeDatabase() {
  await createUsersTable();
}
