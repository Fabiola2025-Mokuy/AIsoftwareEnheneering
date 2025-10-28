import { Lesson, UserProgress } from '../types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface LessonItemProps {
  lesson: Lesson;
  progress: UserProgress | null;
  onToggleComplete: (lessonId: string, completed: boolean) => void;
  disabled: boolean;
}

export function LessonItem({ lesson, progress, onToggleComplete, disabled }: LessonItemProps) {
  const isCompleted = progress?.completed || false;

  return (
    <div
      className={`bg-white rounded-lg p-6 shadow-sm transition-all duration-300 ${
        isCompleted ? 'border-2 border-green-500' : 'border border-gray-200'
      } hover:shadow-md`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggleComplete(lesson.id, !isCompleted)}
          disabled={disabled}
          className={`flex-shrink-0 mt-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isCompleted
              ? 'text-green-600 focus:ring-green-500 hover:scale-110'
              : 'text-gray-300 hover:text-gray-400 focus:ring-blue-500 hover:scale-105'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : (
            <Circle className="w-7 h-7" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3
              className={`text-lg font-semibold transition-colors ${
                isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}
            >
              {lesson.order_index}. {lesson.title}
            </h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm flex-shrink-0">
              <Clock size={16} />
              <span>{lesson.duration}</span>
            </div>
          </div>

          <p className={`text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
            {lesson.description}
          </p>

          {isCompleted && progress?.completed_at && (
            <p className="text-xs text-green-600 mt-2">
              Completed on {new Date(progress.completed_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
