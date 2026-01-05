-- Migration: Add status column to sessions table
-- Date: 2026-01-05
-- Purpose: Track whether a discovery is in draft or completed state

ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'draft';
