import { useEffect, useState } from 'react';
import { Course, Lesson, UserProgress } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LessonItem } from './LessonItem';
import { ArrowLeft, Clock, BookOpen, Loader2, Award } from 'lucide-react';

interface CourseDetailsProps {
  courseId: string;
  onBack: () => void;
}

export function CourseDetails({ courseId, onBack }: CourseDetailsProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Map<string, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [courseResult, lessonsResult, progressResult] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).maybeSingle(),
        supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true }),
        user
          ? supabase
              .from('user_progress')
              .select('*')
              .eq('course_id', courseId)
              .eq('user_id', user.id)
          : { data: null, error: null },
      ]);

      if (courseResult.error) throw courseResult.error;
      if (lessonsResult.error) throw lessonsResult.error;
      if (progressResult.error) throw progressResult.error;

      setCourse(courseResult.data);
      setLessons(lessonsResult.data || []);

      const progressMap = new Map<string, UserProgress>();
      (progressResult.data || []).forEach((p) => {
        progressMap.set(p.lesson_id, p);
      });
      setProgress(progressMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
      console.error('Error fetching course data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (lessonId: string, completed: boolean) => {
    if (!user) return;

    try {
      const existingProgress = progress.get(lessonId);

      if (existingProgress) {
        const { error } = await supabase
          .from('user_progress')
          .update({
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .eq('id', existingProgress.id);

        if (error) throw error;

        setProgress((prev) => {
          const newProgress = new Map(prev);
          newProgress.set(lessonId, {
            ...existingProgress,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          });
          return newProgress;
        });
      } else {
        const { data, error } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            course_id: courseId,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;

        setProgress((prev) => {
          const newProgress = new Map(prev);
          newProgress.set(lessonId, data);
          return newProgress;
        });
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      alert('Failed to update progress. Please try again.');
    }
  };

  const completedCount = Array.from(progress.values()).filter((p) => p.completed).length;
  const progressPercentage = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;
  const isAllCompleted = lessons.length > 0 && completedCount === lessons.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2"
      >
        <ArrowLeft size={20} />
        <span>Back to Courses</span>
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="relative h-64">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                {course.level}
              </span>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen size={16} />
                <span>{lessons.length} lessons</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{course.description}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Your Progress</h2>
          <span className="text-2xl font-bold">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-sm mt-3 text-blue-100">
          {completedCount} of {lessons.length} lessons completed
        </p>
        {isAllCompleted && (
          <div className="flex items-center gap-2 mt-4 bg-white/10 rounded-lg p-3">
            <Award className="w-6 h-6 text-yellow-300" />
            <span className="font-semibold">Congratulations! You completed this course!</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Lessons</h2>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <LessonItem
            key={lesson.id}
            lesson={lesson}
            progress={progress.get(lesson.id) || null}
            onToggleComplete={handleToggleComplete}
            disabled={false}
          />
        ))}
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No lessons available for this course yet.</p>
        </div>
      )}
    </div>
  );
}
