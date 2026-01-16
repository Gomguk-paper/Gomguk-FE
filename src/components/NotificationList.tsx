import { useMemo } from "react";
import { Bell, Sparkles, Tag, Bookmark, Clock } from "lucide-react";
import { useStore, type Notification } from "@/store/useStore";
import { papers } from "@/data/papers";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale/ko";

interface NotificationListProps {
  onNotificationClick?: (paperId: string) => void;
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "new_recommendation":
      return Sparkles;
    case "tag_match":
      return Tag;
    case "saved_update":
      return Bookmark;
    default:
      return Bell;
  }
};

const getNotificationLabel = (type: Notification["type"]) => {
  switch (type) {
    case "new_recommendation":
      return "새 추천";
    case "tag_match":
      return "태그 매칭";
    case "saved_update":
      return "저장 업데이트";
    default:
      return "알림";
  }
};

export function NotificationList({ onNotificationClick }: NotificationListProps) {
  const { getNotifications, markNotificationAsRead, getUnreadCount } = useStore();
  const notifications = getNotifications();
  const unreadCount = getUnreadCount();

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification.paperId);
    }
  };

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      // 읽지 않은 알림이 먼저
      if (!a.read && b.read) return -1;
      if (a.read && !b.read) return 1;
      // 최신순
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">알림</h3>
        </div>
        <ScrollArea className="h-[400px]">
          {sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">알림이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y">
              {sortedNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const paper = papers.find((p) => p.id === notification.paperId);
                const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: ko,
                });

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-secondary/50 transition-colors",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 p-2 rounded-full",
                          !notification.read
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-primary">
                            {getNotificationLabel(notification.type)}
                          </span>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm font-medium line-clamp-1 mb-1">
                          {paper?.title || notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
