
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
import { Bell, Package, MessageSquare, Activity, UserPlus, Shield, FileEdit, HelpCircle, Gavel, FileQuestion, PackageSearch } from 'lucide-react';
import { onAdminNotificationsUpdate, type Notification, type NotificationType } from '@/lib/notifications-service';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

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

  React.useEffect(() => {
    const unsubscribe = onAdminNotificationsUpdate((newNotifications) => {
      setNotifications(newNotifications);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
      <DropdownMenuContent align="end" className="w-80">
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
                <DropdownMenuItem key={notification.id} asChild>
                  <Link href={notification.link || '#'} className="flex items-start gap-3 w-full">
                    <Icon className="mt-1 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm leading-snug">{notification.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}
                      </p>
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
