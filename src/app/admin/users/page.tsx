
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

// This will eventually come from Firestore
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Suspended';
  joinedDate: string;
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice.j@example.com', avatar: 'https://picsum.photos/seed/10/40/40', status: 'Active', joinedDate: '2023-10-15' },
  { id: '2', name: 'Bob Williams', email: 'bob.w@example.com', avatar: 'https://picsum.photos/seed/11/40/40', status: 'Active', joinedDate: '2023-09-20' },
  { id: '3', name: 'Charlie Brown', email: 'charlie.b@example.com', avatar: 'https://picsum.photos/seed/12/40/40', status: 'Suspended', joinedDate: '2023-08-01' },
  { id: '4', name: 'Diana Miller', email: 'diana.m@example.com', avatar: 'https://picsum.photos/seed/13/40/40', status: 'Active', joinedDate: '2023-11-05' },
  { id: '5', name: 'Ethan Davis', email: 'ethan.d@example.com', avatar: 'https://picsum.photos/seed/14/40/40', status: 'Active', joinedDate: '2023-10-28' },
];


export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);

  React.useEffect(() => {
    // Simulate fetching data from Firestore
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 1000);
  }, []);

  const handleUserAdded = (newUser: Omit<User, 'id' | 'avatar' | 'status' | 'joinedDate'>) => {
    const user: User = {
        ...newUser,
        id: (users.length + 1).toString(),
        avatar: `https://picsum.photos/seed/${users.length + 10}/40/40`,
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [user, ...prev]);
  };
  
  const handleUserStatusChange = (userId: string, status: 'Active' | 'Suspended') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  }

  const getStatusVariant = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Suspended':
        return 'destructive';
    }
  };

  return (
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
            <Button onClick={() => setIsAddUserOpen(true)}>
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
                      <Badge variant={getStatusVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                       <UserActions user={user} onStatusChange={handleUserStatusChange} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
