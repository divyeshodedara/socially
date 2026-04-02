import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import api from "../../api/api";
import { useSocket } from "../../context/SocketContext";

const MessageIcon = () => {
  const { socket, unreadMessageCount } = useSocket();
  const location = useLocation();
  const queryClient = useQueryClient();
  const prevLocationRef = useRef(location.pathname);

  // Fetch unread count with React Query
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["messages", "unread"],
    queryFn: async () => {
      const response = await api.get("/messages/unread/count");
      if (response.data.status === "success") {
        return response.data.data.unreadCount || 0;
      }
      return 0;
    },
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: false, // Disable background polling - rely on socket events only
  });

  // Only invalidate when leaving messages pages (not every navigation)
  useEffect(() => {
    const wasOnMessages = prevLocationRef.current.startsWith("/messages");
    const isOnMessages = location.pathname.startsWith("/messages");

    // Only refetch when navigating AWAY from messages section
    if (wasOnMessages && !isOnMessages) {
      queryClient.invalidateQueries(["messages", "unread"]);
    }

    prevLocationRef.current = location.pathname;
  }, [location.pathname, queryClient]);

  // Listen for new messages to update count
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (data) => {
        if (data.type === "newMessage") {
          queryClient.setQueryData(["messages", "unread"], (old = 0) => old + 1);
        }
        if (data.type === "messagesSeen") {
          queryClient.invalidateQueries(["messages", "unread"]); // refetch is fine here
        }
      };

      socket.on("message", handleNewMessage);

      return () => {
        socket.off("message", handleNewMessage);
      };
    }
  }, [socket, queryClient]);

  return (
    <NavLink
      to="/messages"
      className={({ isActive }) =>
        `p-2 rounded-btn hover:bg-mono-100 dark:hover:bg-mono-800 relative ${
          isActive
            ? "text-mono-black dark:text-mono-white bg-mono-100 dark:bg-mono-800"
            : "text-mono-500 dark:text-mono-400"
        }`
      }
      title="Messages"
    >
      <MessageCircle className="w-6 h-6" />
      {unreadMessageCount > 0 && (
        <span className="absolute top-0 right-0 min-w-[18px] h-[18px] flex items-center justify-center bg-blue-500 text-white text-xs font-bold rounded-full">
          {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
        </span>
      )}
    </NavLink>
  );
};

export default MessageIcon;
