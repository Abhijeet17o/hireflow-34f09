import { neon } from '@neondatabase/serverless';

// This will be set from environment variables in Netlify
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

let sql: any = null;
let isInitialized = false;

// Initialize database connection
function initDatabase() {
  if (!isInitialized && DATABASE_URL && !DATABASE_URL.includes('${')) {
    try {
      console.log('🔧 Initializing Neon database connection...');
      sql = neon(DATABASE_URL);
      isInitialized = true;
      console.log('✅ Database connection initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      sql = null;
      isInitialized = false;
    }
  } else if (!DATABASE_URL || DATABASE_URL.includes('${')) {
    console.warn('⚠️ Database URL not configured or contains template variables');
    console.warn('DATABASE_URL:', DATABASE_URL ? 'Present but invalid' : 'Missing');
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

export interface UserProfile {
  user_id: string;
  full_name: string;
  job_title: string;
  company: string;
  company_size: string;
  industry: string;
  phone?: string;
  profile_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_range?: string;
  job_description: string;
  requirements: string;
  openings: number;
  created_at?: string;
  updated_at?: string;
}

export interface Candidate {
  id: string;
  campaign_id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  stage: string;
  notes?: string;
  added_date: string;
  created_at?: string;
  updated_at?: string;
}

// Create all tables if they don't exist
export async function createTables() {
  const db = initDatabase();
  if (!db) {
    console.warn('Database not initialized - DATABASE_URL missing');
    return false;
  }

  try {
    console.log('🔧 Creating database tables...');
    
    // Users table
    await db`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        picture TEXT,
        verified_email BOOLEAN DEFAULT false,
        onboarding_completed BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created/verified');

    // User profiles table (optional onboarding data)
    await db`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(255),
        job_title VARCHAR(255),
        company VARCHAR(255),
        company_size VARCHAR(100),
        industry VARCHAR(255),
        phone VARCHAR(50),
        profile_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ User profiles table created/verified');

    // Campaigns table
    await db`
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        employment_type VARCHAR(100) NOT NULL,
        experience_level VARCHAR(100) NOT NULL,
        salary_range VARCHAR(255),
        job_description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        openings INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Campaigns table created/verified');

    // Candidates table
    await db`
      CREATE TABLE IF NOT EXISTS candidates (
        id VARCHAR(255) PRIMARY KEY,
        campaign_id VARCHAR(255) NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        resume_url TEXT,
        stage VARCHAR(100) DEFAULT 'applied',
        notes TEXT,
        added_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Candidates table created/verified');

    console.log('🎉 All database tables created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    return false;
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

// Save user profile (onboarding data)
export async function saveUserProfile(profileData: UserProfile): Promise<boolean> {
  const db = initDatabase();
  if (!db) {
    console.warn('Database not available - using local storage');
    return true;
  }

  try {
    await db`
      INSERT INTO user_profiles (user_id, full_name, job_title, company, company_size, industry, phone, profile_completed)
      VALUES (${profileData.user_id}, ${profileData.full_name}, ${profileData.job_title}, ${profileData.company}, ${profileData.company_size}, ${profileData.industry}, ${profileData.phone || null}, ${profileData.profile_completed})
      ON CONFLICT (user_id)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        job_title = EXCLUDED.job_title,
        company = EXCLUDED.company,
        company_size = EXCLUDED.company_size,
        industry = EXCLUDED.industry,
        phone = EXCLUDED.phone,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = initDatabase();
  if (!db) return null;

  try {
    const result = await db`
      SELECT * FROM user_profiles WHERE user_id = ${userId}
    `;
    
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Save campaign
export async function saveCampaign(campaignData: Campaign): Promise<boolean> {
  const db = initDatabase();
  if (!db) {
    console.warn('Database not available - using local storage');
    return true;
  }

  try {
    console.log('🔄 Inserting campaign into database:', { id: campaignData.id, user_id: campaignData.user_id, title: campaignData.title });
    
    const result = await db`
      INSERT INTO campaigns (id, user_id, title, department, location, employment_type, experience_level, salary_range, job_description, requirements, openings)
      VALUES (${campaignData.id}, ${campaignData.user_id}, ${campaignData.title}, ${campaignData.department}, ${campaignData.location}, ${campaignData.employment_type}, ${campaignData.experience_level}, ${campaignData.salary_range || null}, ${campaignData.job_description}, ${campaignData.requirements}, ${campaignData.openings})
      ON CONFLICT (id)
      DO UPDATE SET
        title = EXCLUDED.title,
        department = EXCLUDED.department,
        location = EXCLUDED.location,
        employment_type = EXCLUDED.employment_type,
        experience_level = EXCLUDED.experience_level,
        salary_range = EXCLUDED.salary_range,
        job_description = EXCLUDED.job_description,
        requirements = EXCLUDED.requirements,
        openings = EXCLUDED.openings,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;
    
    console.log('✅ Campaign inserted successfully:', result?.[0]?.id || 'No ID returned');
    return true;
  } catch (error) {
    console.error('❌ Error saving campaign:', error);
    return false;
  }
}

// Get user campaigns
export async function getUserCampaigns(userId: string): Promise<Campaign[]> {
  const db = initDatabase();
  if (!db) return [];

  try {
    console.log('🔍 Querying campaigns for user:', userId);
    
    const result = await db`
      SELECT * FROM campaigns WHERE user_id = ${userId} ORDER BY created_at DESC
    `;
    
    console.log('🔍 Query result:', result?.length || 0, 'campaigns found');
    if (result && result.length > 0) {
      console.log('🔍 Campaign titles:', result.map((c: any) => c.title));
    }
    
    return result || [];
  } catch (error) {
    console.error('❌ Error getting user campaigns:', error);
    return [];
  }
}

// Save candidate
export async function saveCandidate(candidateData: Candidate): Promise<boolean> {
  const db = initDatabase();
  if (!db) {
    console.warn('Database not available - using local storage');
    return true;
  }

  try {
    await db`
      INSERT INTO candidates (id, campaign_id, user_id, name, email, phone, resume_url, stage, notes, added_date)
      VALUES (${candidateData.id}, ${candidateData.campaign_id}, ${candidateData.user_id}, ${candidateData.name}, ${candidateData.email}, ${candidateData.phone || null}, ${candidateData.resume_url || null}, ${candidateData.stage}, ${candidateData.notes || null}, ${candidateData.added_date})
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        resume_url = EXCLUDED.resume_url,
        stage = EXCLUDED.stage,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    return true;
  } catch (error) {
    console.error('Error saving candidate:', error);
    return false;
  }
}

// Get campaign candidates
export async function getCampaignCandidates(campaignId: string): Promise<Candidate[]> {
  const db = initDatabase();
  if (!db) return [];

  try {
    const result = await db`
      SELECT * FROM candidates WHERE campaign_id = ${campaignId} ORDER BY created_at DESC
    `;
    
    return result || [];
  } catch (error) {
    console.error('Error getting campaign candidates:', error);
    return [];
  }
}

// Initialize database on app start
export async function initializeDatabase() {
  console.log('🚀 Initializing HireFlow database...');
  console.log('📍 Database URL configured:', !!DATABASE_URL);
  
  if (!DATABASE_URL || DATABASE_URL.includes('${')) {
    console.warn('⚠️ Database URL not properly configured. Using local storage fallback.');
    return false;
  }
  
  try {
    const success = await createTables();
    if (success) {
      console.log('🎉 Database initialization completed successfully!');
    } else {
      console.warn('⚠️ Database initialization failed. Using local storage fallback.');
    }
    return success;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return false;
  }
}
