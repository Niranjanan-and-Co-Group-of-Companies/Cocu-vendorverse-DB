

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
import { Bell, Package, MessageSquare, Activity, Gavel, HelpCircle, UserPlus, Shield, FileEdit, FileQuestion, X } from 'lucide-react';
import { onUserNotificationsUpdate, type Notification, type NotificationType } from '@/lib/notifications-service';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { markNotificationAsRead } from '@/lib/notifications-actions';
import { useToast } from '@/hooks/use-toast';

const iconMap: { [key in NotificationType]: React.ElementType } = {
  ORDER_STATUS_UPDATE: Package,
  NEW_ORDER: Package,
  NEW_MESSAGE: MessageSquare,
  NEW_BID_RESPONSE: Gavel,
  NEW_VENDOR_SUBMISSION: UserPlus,
  USER_REPORT: Shield,
  CONTENT_UPDATE: FileEdit,
  NEW_SUPPORT_TICKET: HelpCircle,
  NEW_SOURCING_REQUEST: FileQuestion,
  SOURCING_REQUEST_UPDATE: Package,
  NEW_BID_REQUEST: Gavel,
};

export function VendorNotificationDropdown({ vendorId }: { vendorId: string }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!vendorId) {
        setLoading(false);
        return;
    }
    const unsubscribe = onUserNotificationsUpdate(vendorId, (newNotifications) => {
      setNotifications(newNotifications);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [vendorId]);

  const handleCloseNotification = async (e: React.MouseEvent, notificationId?: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!notificationId) return;

    try {
      await markNotificationAsRead(notificationId);
      toast({
        title: "Notification Dismissed",
      })
    } catch (error) {
      toast({ title: 'Error', description: 'Could not dismiss notification.', variant: 'destructive' });
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const displayedNotifications = unreadNotifications.slice(0, 10);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell />
          {unreadNotifications.length > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadNotifications.length}</Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadNotifications.length > 0 && <Badge variant="secondary">{unreadNotifications.length} new</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
             <div className="p-2 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
          ) : displayedNotifications.length > 0 ? (
            displayedNotifications.map(notification => {
              const Icon = iconMap[notification.type] || Bell;
              return (
                <DropdownMenuItem key={notification.id} asChild>
                  <Link href={notification.link || '#'} className="flex items-start gap-3 w-full pr-8 relative">
                    <Icon className="mt-1 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm leading-snug">{notification.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}
                      </p>
                    </div>
                     <div className="absolute top-1/2 right-0 -translate-y-1/2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handleCloseNotification(e, notification.id)}
                            aria-label="Close notification"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
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
                <Link href="#">View All Notifications</Link>
            </Button>
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
