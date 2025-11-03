/*
  # E-Learning Platform Database Schema

  1. New Tables
    - `courses`
      - `id` (uuid, primary key) - Unique identifier for each course
      - `title` (text) - Course title
      - `description` (text) - Course description
      - `thumbnail` (text) - URL for course thumbnail image
      - `duration` (text) - Estimated course duration
      - `level` (text) - Course difficulty level (Beginner, Intermediate, Advanced)
      - `created_at` (timestamptz) - When the course was created

    - `lessons`
      - `id` (uuid, primary key) - Unique identifier for each lesson
      - `course_id` (uuid, foreign key) - Reference to the parent course
      - `title` (text) - Lesson title
      - `description` (text) - Lesson description
      - `order_index` (integer) - Order of the lesson in the course
      - `duration` (text) - Estimated lesson duration
      - `created_at` (timestamptz) - When the lesson was created

    - `user_progress`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid) - Reference to authenticated user
      - `lesson_id` (uuid, foreign key) - Reference to the lesson
      - `course_id` (uuid, foreign key) - Reference to the course
      - `completed` (boolean) - Whether the lesson is completed
      - `completed_at` (timestamptz) - When the lesson was marked as completed
      - `created_at` (timestamptz) - When the progress record was created

  2. Security
    - Enable RLS on all tables
    - Public read access for courses and lessons
    - Authenticated users can manage their own progress

  3. Sample Data
    - Insert sample courses with lessons for demonstration
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  thumbnail text DEFAULT '',
  duration text DEFAULT '0h',
  level text DEFAULT 'Beginner',
  created_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  duration text DEFAULT '0min',
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses (public read access)
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  USING (true);

-- RLS Policies for lessons (public read access)
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  USING (true);

-- RLS Policies for user_progress (authenticated users only)
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample courses
INSERT INTO courses (title, description, thumbnail, duration, level) VALUES
('React Fundamentals', 'Learn the basics of React including components, props, state, and hooks. Perfect for beginners starting their React journey.', 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800', '4h', 'Beginner'),
('Advanced TypeScript', 'Master TypeScript with advanced types, generics, decorators, and design patterns for enterprise applications.', 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=800', '6h', 'Advanced'),
('CSS Mastery', 'From Flexbox to Grid, animations to transitions. Become a CSS expert and create stunning responsive designs.', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800', '5h', 'Intermediate'),
('Web Accessibility', 'Build inclusive web applications that everyone can use. Learn ARIA, semantic HTML, and accessibility best practices.', 'https://images.pexels.com/photos/7869263/pexels-photo-7869263.jpeg?auto=compress&cs=tinysrgb&w=800', '3h', 'Intermediate');

-- Get course IDs for inserting lessons
DO $$
DECLARE
  react_course_id uuid;
  typescript_course_id uuid;
  css_course_id uuid;
  a11y_course_id uuid;
BEGIN
  -- Get course IDs
  SELECT id INTO react_course_id FROM courses WHERE title = 'React Fundamentals';
  SELECT id INTO typescript_course_id FROM courses WHERE title = 'Advanced TypeScript';
  SELECT id INTO css_course_id FROM courses WHERE title = 'CSS Mastery';
  SELECT id INTO a11y_course_id FROM courses WHERE title = 'Web Accessibility';

  -- Insert lessons for React Fundamentals
  INSERT INTO lessons (course_id, title, description, order_index, duration) VALUES
  (react_course_id, 'Introduction to React', 'Understanding what React is and why it is popular', 1, '30min'),
  (react_course_id, 'JSX and Components', 'Learn how to write JSX and create reusable components', 2, '45min'),
  (react_course_id, 'Props and State', 'Master component communication and state management', 3, '50min'),
  (react_course_id, 'React Hooks', 'Deep dive into useState, useEffect, and custom hooks', 4, '1h'),
  (react_course_id, 'Building Your First App', 'Put everything together in a real project', 5, '1h 15min');

  -- Insert lessons for Advanced TypeScript
  INSERT INTO lessons (course_id, title, description, order_index, duration) VALUES
  (typescript_course_id, 'Advanced Types', 'Union types, intersection types, and type guards', 1, '1h'),
  (typescript_course_id, 'Generics Deep Dive', 'Creating flexible and reusable type-safe code', 2, '1h 15min'),
  (typescript_course_id, 'Decorators and Metadata', 'Using decorators for meta-programming', 3, '50min'),
  (typescript_course_id, 'Design Patterns in TypeScript', 'Implementing common patterns with TypeScript', 4, '1h 30min'),
  (typescript_course_id, 'TypeScript in Practice', 'Real-world enterprise application development', 5, '1h 25min');

  -- Insert lessons for CSS Mastery
  INSERT INTO lessons (course_id, title, description, order_index, duration) VALUES
  (css_course_id, 'Flexbox Fundamentals', 'Master the flexible box layout module', 1, '45min'),
  (css_course_id, 'CSS Grid Layout', 'Create complex layouts with CSS Grid', 2, '1h'),
  (css_course_id, 'Responsive Design', 'Building layouts that work on all devices', 3, '50min'),
  (css_course_id, 'Animations and Transitions', 'Bring your designs to life with motion', 4, '1h 15min'),
  (css_course_id, 'Modern CSS Features', 'CSS variables, clamp, aspect-ratio, and more', 5, '1h 10min');

  -- Insert lessons for Web Accessibility
  INSERT INTO lessons (course_id, title, description, order_index, duration) VALUES
  (a11y_course_id, 'Accessibility Fundamentals', 'Why accessibility matters and basic principles', 1, '30min'),
  (a11y_course_id, 'Semantic HTML', 'Using the right HTML elements for accessibility', 2, '40min'),
  (a11y_course_id, 'ARIA Attributes', 'Enhancing accessibility with ARIA roles and properties', 3, '50min'),
  (a11y_course_id, 'Keyboard Navigation', 'Ensuring your app works without a mouse', 4, '35min'),
  (a11y_course_id, 'Testing for Accessibility', 'Tools and techniques for accessibility testing', 5, '25min');
END $$;