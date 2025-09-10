

'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AddUserDialog } from '@/components/admin/users/add-user-dialog';
import { UserActions } from '@/components/admin/users/user-actions';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { User, UserRole } from '@/lib/user-service';
import { onUsersUpdate } from '@/lib/user-service';
import { UserProfileDialog } from '@/components/admin/users/user-profile-dialog';
import { UserOrdersDialog } from '@/components/admin/users/user-orders-dialog';


export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  const [viewingProfileUser, setViewingProfileUser] = React.useState<User | null>(null);
  const [viewingOrdersUser, setViewingOrdersUser] = React.useState<User | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const unsub = onUsersUpdate((usersData) => {
        setUsers(usersData);
        setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsub();
  }, []);

  const handleUserAdded = async (newUser: Omit<User, 'id' | 'avatar' | 'status' | 'joinedDate' | 'communicationPrefs'>) => {
    try {
        await addDoc(collection(db, 'users'), {
            ...newUser,
            avatar: `https://picsum.photos/seed/${Math.random()}/40/40`,
            status: 'Active',
            joinedDate: serverTimestamp(),
            communicationPrefs: { email: true, sms: true },
        });
        // The onSnapshot listener will automatically update the UI
    } catch (error) {
        console.error("Error adding user: ", error);
        toast({
            title: "Error",
            description: "Failed to add new customer.",
            variant: "destructive",
        });
    }
  };
  
  const handleUserStatusChange = async (userId: string, status: 'Active' | 'Suspended') => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { status });
        // The onSnapshot listener will automatically update the UI
    } catch(error) {
        console.error("Error updating user status: ", error);
        toast({
            title: "Error",
            description: "Failed to update user status.",
            variant: "destructive",
        });
    }
  }

  const getStatusVariant = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Suspended':
        return 'destructive';
    }
  };
  
  const getRoleVariant = (role: UserRole): 'default' | 'secondary' | 'outline' => {
      switch(role) {
          case 'admin': return 'default';
          case 'vendor': return 'secondary';
          case 'customer': return 'outline';
          default: return 'outline';
      }
  }

  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString();
    }
    return 'N/A';
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
              <h1 className="text-2xl font-bold">Manage Users</h1>
              <p className="text-muted-foreground">
              Here you can view, edit, and manage all customer accounts.
              </p>
          </div>
          <AddUserDialog
              open={isAddUserOpen}
              onOpenChange={setIsAddUserOpen}
              onUserAdded={handleUserAdded}
          >
            <Button disabled>
                <PlusCircle className="mr-2" />
                Add Customer
            </Button>
          </AddUserDialog>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="avatar" />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleVariant(user.role)} className="capitalize">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(user.joinedDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <UserActions 
                            user={user} 
                            onStatusChange={handleUserStatusChange}
                            onViewProfile={() => setViewingProfileUser(user)}
                            onViewOrders={() => setViewingOrdersUser(user)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      <UserProfileDialog user={viewingProfileUser} open={!!viewingProfileUser} onOpenChange={() => setViewingProfileUser(null)} />
      <UserOrdersDialog user={viewingOrdersUser} open={!!viewingOrdersUser} onOpenChange={() => setViewingOrdersUser(null)} />
    </>
  );
}
