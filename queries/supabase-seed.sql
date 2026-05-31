-- Professional Seed Data for Privailers Platform

-- 1. Courses
INSERT INTO courses (id, title, description, tier, duration, price) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Introductory Data Analysis', 'The ultimate foundation for aspiring analysts. Master Excel and SQL basics through real-world business cases.', 'free', '2 Weeks', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Advanced Data Analytics & Visualization', 'Transform raw data into strategic insights. Deep dive into Power BI, Tableau, and advanced statistical modeling.', 'paid', '6 Weeks', 45000.00),
  ('33333333-3333-3333-3333-333333333333', 'Python for Data Science', 'Build predictive models and automate reporting. Learn the python ecosystem (Pandas, Numpy, Scikit-Learn) from scratch.', 'paid', '8 Weeks', 75000.00);

-- 2. Modules for Introductory Data Analysis
INSERT INTO modules (course_id, title, "order", content) VALUES
  ('11111111-1111-1111-1111-111111111111', 'The Data Mindset', 1, 'Understanding the role of data in modern business decision making.'),
  ('11111111-1111-1111-1111-111111111111', 'Excel for Analysts: Essentials', 2, 'Mastering lookups, logical functions, and data cleaning techniques.'),
  ('11111111-1111-1111-1111-111111111111', 'Relational Databases & SQL Basics', 3, 'Writing your first queries to extract data from structured databases.'),
  ('11111111-1111-1111-1111-111111111111', 'Final Project: Retail Sales Report', 4, 'Apply your skills to build a weekly sales performance dashboard.');

-- 3. Modules for Advanced Data Analytics
INSERT INTO modules (course_id, title, "order", content) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Strategic Business Intelligence', 1, 'Frameworks for translating business questions into analytical problems.'),
  ('22222222-2222-2222-2222-222222222222', 'Advanced DAX & Power Query', 2, 'Building robust data models and complex measures in Power BI.'),
  ('22222222-2222-2222-2222-222222222222', 'The Art of Storytelling with Data', 3, 'Design principles for high-impact executive dashboards.'),
  ('22222222-2222-2222-2222-222222222222', 'Predictive Analysis in Tableau', 4, 'Blending data sources and building forecasting models.');

-- 4. Sample Leads
INSERT INTO leads (name, email, company, interest, message, status) VALUES
  ('Chinelo O.', 'chinelo@retail-solutions.ng', 'Retail Solutions Ltd', 'Data Consultancy for Business', 'We need help optimizing our supply chain data for the upcoming quarter.', 'new'),
  ('Tunde Williams', 'tunde.w@fintech-hub.com', 'FinTech Hub', 'Corporate Training', 'Requesting a quote for upskilling 20 junior analysts in SQL/Python.', 'contacted');

