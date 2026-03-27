-- ─────────────────────────────────────────
-- USERS
-- Everyone who signs up, lister or seeker
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)        NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255)        NOT NULL,
  role        VARCHAR(10)         NOT NULL CHECK (role IN ('lister', 'seeker')),
  avatar_url  VARCHAR(500),
  is_verified BOOLEAN             DEFAULT FALSE,
  created_at  TIMESTAMPTZ         DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- LISTINGS
-- Rooms posted by listers
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id              SERIAL PRIMARY KEY,
  lister_id       INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(200)    NOT NULL,
  description     TEXT,
  rent            DECIMAL(10, 2)  NOT NULL,
  city            VARCHAR(100)    NOT NULL,
  address         VARCHAR(300),
  latitude        DECIMAL(9, 6),
  longitude       DECIMAL(9, 6),
  available_from  DATE            NOT NULL,
  bedrooms        INTEGER         DEFAULT 1,
  bathrooms       INTEGER         DEFAULT 1,
  furnished       BOOLEAN         DEFAULT FALSE,
  pets_allowed    BOOLEAN         DEFAULT FALSE,
  images          TEXT[]          DEFAULT '{}',
  is_active       BOOLEAN         DEFAULT TRUE,
  created_at      TIMESTAMPTZ     DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- SAVED LISTINGS
-- Rooms a seeker has bookmarked
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_listings (
  id         SERIAL PRIMARY KEY,
  seeker_id  INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id INTEGER     NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent saving the same listing twice
  UNIQUE(seeker_id, listing_id)
);

-- ─────────────────────────────────────────
-- MESSAGES
-- Chat between a seeker and a lister
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  sender_id   INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id  INTEGER     NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  is_read     BOOLEAN     DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);