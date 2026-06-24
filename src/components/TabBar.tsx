import { Bell, Check, Search, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ModeToggle } from "./theme/ModeToggle";

type Props = {};

const searchablePages = [
  {
    title: "Dashboard",
    description: "Overview, quick actions, classes, resources, and tasks",
    path: "/dashbord",
    keywords: "home overview dashboard quick actions classes resources tasks",
  },
  {
    title: "Courses",
    description: "Browse, continue, and manage courses",
    path: "/courses",
    keywords: "course courses learning enrolled instructor students",
  },
  {
    title: "Assignments",
    description: "View, submit, and manage assignments",
    path: "/assignments",
    keywords: "assignment assignments submission due course grade",
  },
  {
    title: "Schedule",
    description: "Classes, meetings, calendar, and events",
    path: "/schedule",
    keywords: "schedule calendar class meeting event live",
  },
  {
    title: "Recordings",
    description: "Watch and manage class recordings",
    path: "/recordings",
    keywords: "recording recordings video lecture class",
  },
  {
    title: "Videos",
    description: "Student course videos and recordings",
    path: "/student-videos",
    keywords: "video videos student recordings course watch",
  },
  {
    title: "Notes",
    description: "Read course notes and study material",
    path: "/student-notes",
    keywords: "note notes study material topic course",
  },
  {
    title: "Discussions",
    description: "Ask questions and join course discussions",
    path: "/discussions",
    keywords: "discussion discussions doubt question reply forum",
  },
  {
    title: "Resources",
    description: "Files, downloads, and learning resources",
    path: "/resources",
    keywords: "resource resources file pdf image download material",
  },
  {
    title: "Downloads",
    description: "Downloadable course files",
    path: "/downloads",
    keywords: "download downloads file course syllabus",
  },
  {
    title: "Tasks",
    description: "Assigned work and to-do items",
    path: "/tasks",
    keywords: "task tasks todo assigned work course",
  },
  {
    title: "Users",
    description: "Manage admins, faculty, and students",
    path: "/users",
    keywords: "user users admin faculty student email role",
  },
  {
    title: "Students",
    description: "View student profiles and course enrollment",
    path: "/students",
    keywords: "student students course email grade",
  },
  {
    title: "Settings",
    description: "Profile, preferences, and notifications",
    path: "/settings",
    keywords: "settings profile notification password theme",
  },
  {
    title: "Content Manager",
    description: "Manage courses, videos, recordings, and notes",
    path: "/admin-content",
    keywords: "content manager admin courses videos recordings notes",
  },
  {
    title: "Create Content",
    description: "Faculty content creation for courses",
    path: "/faculty-content",
    keywords: "faculty create content videos recordings notes course",
  },
];

const TabBar = (props: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Assignment reminder",
      message: "React Project Submission is due today.",
      time: "Today",
      read: false,
    },
    {
      id: 2,
      title: "Class update",
      message: "Your next online class is available in Upcoming Classes.",
      time: "Tomorrow",
      read: false,
    },
    {
      id: 3,
      title: "Discussion reply",
      message: "A faculty member replied to your course discussion.",
      time: "2 days ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchResults = normalizedSearch
    ? searchablePages.filter((page) =>
        `${page.title} ${page.description} ${page.keywords}`
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : [];

  useEffect(() => {
    if (!isNotificationsOpen && !isSearchOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNotificationsOpen, isSearchOpen]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstResult = searchResults[0];
    if (!firstResult) {
      return;
    }

    window.location.href = firstResult.path;
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  };

  const dismissNotification = (id: number) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between h-16.25">
      {/* Search Bar */}
      <form
        ref={searchRef}
        onSubmit={handleSearchSubmit}
        className="relative flex items-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 w-72 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-orange-500/30"
      >
        <Search size={18} className="text-orange-500" />
        <input
          type="search"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          className="flex-1 outline-none text-sm text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
          aria-label="Search"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setIsSearchOpen(false);
            }}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}

        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute left-0 top-full mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="max-h-96 overflow-y-auto py-2">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <button
                    key={result.path}
                    type="button"
                    onClick={() => {
                      window.location.href = result.path;
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {result.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {result.description}
                    </p>
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  No results found for "{searchQuery.trim()}".
                </p>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Right Side - Notifications & User Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((open) => !open)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative"
            aria-label="Open notifications"
            aria-expanded={isNotificationsOpen}
          >
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 text-[10px] leading-3 text-white">
                {unreadCount}
              </span>
            )}
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Notifications
                </h2>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:underline"
                >
                  <Check size={14} />
                  Mark read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                    No notifications.
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-3 p-4 border-b last:border-b-0 border-gray-100 dark:border-gray-800 ${
                        notification.read ? "" : "bg-orange-50 dark:bg-orange-950/20"
                      }`}
                    >
                      <span
                        className={`mt-2 h-2 w-2 rounded-full shrink-0 ${
                          notification.read ? "bg-gray-300" : "bg-orange-500"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          <button
                            type="button"
                            onClick={() => dismissNotification(notification.id)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label={`Dismiss ${notification.title}`}
                          >
                            <X size={14} className="text-gray-500" />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-[11px] text-gray-400">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <ModeToggle />
        </div>

        {/* User Profile */}
       
       
      </div>
    </div>
  );
};

export default TabBar;
