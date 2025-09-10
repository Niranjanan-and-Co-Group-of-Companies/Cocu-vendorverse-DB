
'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuFooter,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, Package, MessageSquare, Activity, UserPlus, Shield, FileEdit, HelpCircle, Gavel, FileQuestion, PackageSearch, Circle, CheckCircle } from 'lucide-react';
import { onAdminNotificationsUpdate, type Notification, type NotificationType } from '@/lib/notifications-service';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { markNotificationAsRead } from '@/lib/notifications-actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const iconMap: { [key in NotificationType]: React.ElementType } = {
  ORDER_STATUS_UPDATE: Package,
  NEW_MESSAGE: MessageSquare,
  NEW_BID_RESPONSE: Gavel,
  NEW_VENDOR_SUBMISSION: UserPlus,
  USER_REPORT: Shield,
  CONTENT_UPDATE: FileEdit,
  NEW_SUPPORT_TICKET: HelpCircle,
  NEW_SOURCING_REQUEST: PackageSearch,
  NEW_BID_REQUEST: Gavel,
};

export function AdminNotificationDropdown() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribe = onAdminNotificationsUpdate((newNotifications) => {
      setNotifications(newNotifications);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const handleMarkAsRead = async (e: React.MouseEvent, notificationId?: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!notificationId) return;

    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      toast({ title: 'Error', description: 'Could not mark notification as read.', variant: 'destructive' });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
             <div className="p-2 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
          ) : notifications.length > 0 ? (
            notifications.map(notification => {
              const Icon = iconMap[notification.type] || Bell;
              return (
                <DropdownMenuItem key={notification.id} asChild className={cn(!notification.isRead && "bg-blue-50 dark:bg-blue-900/20")}>
                  <Link href={notification.link || '#'} className="flex items-start gap-3 w-full pr-8 relative">
                    <Icon className="mt-1 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm leading-snug">{notification.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}
                      </p>
                    </div>
                     <div className="absolute top-1/2 right-2 -translate-y-1/2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 group"
                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                            disabled={notification.isRead}
                            aria-label="Mark as read"
                        >
                            <Circle className={cn("h-3 w-3 text-blue-500", notification.isRead && "hidden")} />
                            <CheckCircle className={cn("h-3 w-3 text-green-500", !notification.isRead && "hidden")} />
                        </Button>
                    </div>
                  </Link>
                </DropdownMenuItem>
              );
            })
          ) : (
            <p className="text-center text-sm text-muted-foreground p-4">No new notifications</p>
          )}
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/admin/notifications">View All Notifications</Link>
            </Button>
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
