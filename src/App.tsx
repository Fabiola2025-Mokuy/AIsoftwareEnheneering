import { useState } from 'react';
import { CourseList } from './components/CourseList';
import { CourseDetails } from './components/CourseDetails';

function App() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {selectedCourseId ? (
        <CourseDetails
          courseId={selectedCourseId}
          onBack={() => setSelectedCourseId(null)}
        />
      ) : (
        <CourseList onCourseSelect={setSelectedCourseId} />
      )}
    </div>
  );
}

export default App;
