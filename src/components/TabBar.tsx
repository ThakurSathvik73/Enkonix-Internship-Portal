import { Bell, Check, Search, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ModeToggle } from "./theme/ModeToggle";

type Props = {};

const TabBar = (props: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
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
  }, [isNotificationsOpen]);

  const runPageSearch = () => {
    const query = searchQuery.trim();
    const pageFind = (
      window as Window & {
        find?: (
          searchString: string,
          caseSensitive?: boolean,
          backwards?: boolean,
          wrapAround?: boolean,
          wholeWord?: boolean,
          searchInFrames?: boolean,
          showDialog?: boolean,
        ) => boolean;
      }
    ).find;

    if (!query || typeof pageFind !== "function") {
      return;
    }

    window.getSelection()?.removeAllRanges();
    pageFind(query, false, false, true, false, true, false);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runPageSearch();
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      window.getSelection()?.removeAllRanges();
      return;
    }

    const searchTimer = window.setTimeout(runPageSearch, 250);

    return () => window.clearTimeout(searchTimer);
  }, [searchQuery]);

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
        onSubmit={handleSearchSubmit}
        className="flex items-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 w-72 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-orange-500/30"
      >
        <Search size={18} className="text-orange-500" />
        <input
          type="search"
          placeholder="Search page"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!e.target.value.trim()) {
              window.getSelection()?.removeAllRanges();
            }
          }}
          className="flex-1 outline-none text-sm text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
          aria-label="Search page"
        />
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
