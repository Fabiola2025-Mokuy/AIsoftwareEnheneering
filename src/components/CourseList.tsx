import { useEffect, useState } from 'react';
import { Course } from '../types';
import { supabase } from '../lib/supabase';
import { CourseCard } from './CourseCard';
import { GraduationCap, Loader2 } from 'lucide-react';

interface CourseListProps {
  onCourseSelect: (courseId: string) => void;
}

export function CourseList({ onCourseSelect }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setCourses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchCourses}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <GraduationCap className="w-12 h-12 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">E-Learning Platform</h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Expand your knowledge with our curated courses. Learn at your own pace and track your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => onCourseSelect(course.id)}
          />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No courses available yet.</p>
        </div>
      )}
    </div>
  );
}
