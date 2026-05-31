-- Script to list all cohorts and their IDs
SELECT id, name, status, created_at FROM cohorts ORDER BY created_at DESC;
