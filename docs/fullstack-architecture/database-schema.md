# Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Emergency contacts
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_primary (user_id, is_primary)
);

-- First aid guides
CREATE TABLE first_aid_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    summary TEXT NOT NULL,
    content JSONB NOT NULL,
    search_tags TEXT[],
    version INTEGER DEFAULT 1,
    is_offline_available BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_search_tags (search_tags) USING GIN
);

-- Guide media assets
CREATE TABLE guide_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id UUID NOT NULL REFERENCES first_aid_guides(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- image, video
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    alt_text VARCHAR(500),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical profiles
CREATE TABLE medical_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blood_type VARCHAR(10),
    emergency_notes TEXT,
    physician_name VARCHAR(200),
    physician_phone VARCHAR(20),
    insurance_provider VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Allergies
CREATE TABLE allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_profile_id UUID NOT NULL REFERENCES medical_profiles(id) ON DELETE CASCADE,
    allergen VARCHAR(200) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    reaction TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medications
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_profile_id UUID NOT NULL REFERENCES medical_profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    prescribed_for VARCHAR(200),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical conditions
CREATE TABLE medical_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_profile_id UUID NOT NULL REFERENCES medical_profiles(id) ON DELETE CASCADE,
    condition_name VARCHAR(200) NOT NULL,
    diagnosed_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User guide bookmarks
CREATE TABLE user_guide_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    guide_id UUID NOT NULL REFERENCES first_aid_guides(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, guide_id)
);

-- Offline sync tracking
CREATE TABLE offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL, -- create, update, delete
    data JSONB NOT NULL,
    synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP WITH TIME ZONE,
    INDEX idx_user_unsynced (user_id, synced)
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_guides_title ON first_aid_guides(title);
CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_first_aid_guides_updated_at BEFORE UPDATE ON first_aid_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
