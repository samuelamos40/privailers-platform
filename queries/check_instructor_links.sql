-- List all cohorts and their assigned instructors
SELECT 
    c.id, 
    c.name, 
    c.instructor_id, 
    u.full_name as instructor_name,
    u.role as instructor_role
FROM 
    public.cohorts c
LEFT JOIN 
    public.users u ON c.instructor_id = u.id
ORDER BY 
    c.created_at DESC;
