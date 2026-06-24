import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, BookOpen, Users, Clock, X, Search, Plus } from "lucide-react";
import React, { useState } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { getCourses } from "@/utils/api";

type Course = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  code?: string;
  description?: string;
  instructor: string;
  students?: number;
  enrolledStudents?: string[];
  duration?: string;
  progress?: number;
  status: "enrolled" | "completed" | "available";
};

const Courses = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fallbackCourses: Course[] = [
    {
      id: "1",
      name: "Web Development Fundamentals",
      code: "WEB101",
      description: "Build responsive web applications with modern frontend tools.",
      instructor: "Dr. Smith",
      students: 45,
      duration: "12 weeks",
      progress: 65,
      status: user?.role === "Student" ? "enrolled" : "available",
    },
    {
      id: "2",
      name: "Data Structures & Algorithms",
      code: "DSA201",
      description: "Practice core data structures, algorithms, and problem solving.",
      instructor: "Prof. Johnson",
      students: 38,
      duration: "10 weeks",
      progress: 30,
      status: user?.role === "Student" ? "enrolled" : "available",
    },
    {
      id: "3",
      name: "UI/UX Design Principles",
      code: "DES110",
      description: "Learn user-centered interface design and usability principles.",
      instructor: "Ms. Williams",
      students: 52,
      duration: "8 weeks",
      status: "available",
    },
  ];

  const [courses, setCourses] = useState<Course[]>(fallbackCourses);

  React.useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getCourses();
        const apiCourses = (result.data || []).map((course: Course) => ({
          ...course,
          status:
            user?.role === "Student" && course.enrolledStudents?.includes(user.email)
              ? "enrolled"
              : "available",
          progress:
            user?.role === "Student" && course.enrolledStudents?.includes(user.email)
              ? 35
              : undefined,
        }));

        setCourses(apiCourses.length > 0 ? apiCourses : fallbackCourses);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError("Could not load live courses. Showing sample courses.");
        setCourses(fallbackCourses);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [user?.email, user?.role]);

  const filteredCourses = courses.filter((course) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    return [
      course.name,
      course.title,
      course.code,
      course.description,
      course.instructor,
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query));
  });

  const canCreateCourse = user?.role === "Superadmin" || user?.role === "Admin";

  const handleEnroll = (courseId: string) => {
    setCourses((current) =>
      current.map((course) =>
        (course._id || course.id) === courseId
          ? { ...course, status: "enrolled", progress: 0 }
          : course,
      ),
    );
  };

  const goToCourseContent = (course: Course) => {
    const courseName = encodeURIComponent(course.name || course.title || "");
    window.location.href = user?.role === "Student"
      ? `/student-videos?course=${courseName}`
      : "/admin-content";
  };

  return (
    <>
      <Head>
        <title>Courses | LMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <div
  className={`fixed inset-y-0 left-0 z-50 
  transform transition-transform duration-300 
  lg:relative lg:translate-x-0 
  bg-white dark:bg-gray-900
  h-screen overflow-y-auto overflow-x-hidden
  ${
    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
          <Sidebar />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 dark:text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-orange-500">Courses</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Courses
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.role === "Student" && "Browse and enroll in available courses"}
                  {user?.role === "Faculty" && "View courses and create course content"}
                  {user?.role === "Admin" && "Manage all courses and instructors"}
                  {user?.role === "Superadmin" && "Manage all courses and instructors"}
                </p>
              </div>
              {canCreateCourse && (
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/admin-content";
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus size={20} />
                  Create Course
                </button>
              )}
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label="Clear course search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredCourses.length} result{filteredCourses.length === 1 ? "" : "s"} for "{searchTerm.trim()}".
                </p>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading courses...
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
                <BookOpen className="mx-auto mb-3 text-gray-400" size={32} />
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  No courses found
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try searching by course name, code, instructor, or description.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const courseId = course._id || course.id || course.name || "";
                  const courseTitle = course.name || course.title || "Untitled course";
                  const studentCount = course.enrolledStudents?.length ?? course.students ?? 0;

                  return (
                <div
                  key={courseId}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                      <BookOpen className="text-orange-500" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {courseTitle}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {course.instructor}
                      </p>
                      {course.code && (
                        <p className="mt-1 text-xs font-medium text-orange-500">
                          {course.code}
                        </p>
                      )}
                    </div>
                  </div>

                  {course.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                      {course.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Users size={16} />
                      <span>{studentCount} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock size={16} />
                      <span>{course.duration || "Self-paced"}</span>
                    </div>
                  </div>

                  {user?.role === "Student" && course.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {user?.role === "Student" && course.status === "available" && (
                      <button
                        type="button"
                        onClick={() => handleEnroll(courseId)}
                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
                      >
                        Enroll
                      </button>
                    )}
                    {user?.role === "Student" && course.status === "enrolled" && (
                      <button
                        type="button"
                        onClick={() => goToCourseContent(course)}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                      >
                        Continue Learning
                      </button>
                    )}
                    {user?.role === "Faculty" && (
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = "/faculty-content";
                        }}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                      >
                        Add Content
                      </button>
                    )}
                    {(user?.role === "Superadmin" || user?.role === "Admin") && (
                      <button
                        type="button"
                        onClick={() => goToCourseContent(course)}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                      >
                        Manage
                      </button>
                    )}
                  </div>
                </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Courses;

