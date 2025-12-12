-- Create the token table for TGB authentication
-- This table stores access and refresh tokens for The Giving Block API

CREATE TABLE IF NOT EXISTS "token" (
    "id" INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "refreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add a comment to the table
COMMENT ON TABLE "token" IS 'Stores TGB API authentication tokens';





