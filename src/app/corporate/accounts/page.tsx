
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCorporateAccount } from '@/hooks/use-corporate-account-store.tsx';
import { onCorporateUsersUpdate } from '@/lib/corporate-users-service';
import type { User, UserRole } from '@/lib/user-service';
import { AddUserDialog } from '@/components/corporate/accounts/add-user-dialog';
import { UserActions } from '@/components/corporate/accounts/user-actions';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


export default function CorporateAccountsPage() {
    const { account } = useCorporateAccount();
    const [users, setUsers] = React.useState<User[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        if (account) {
            const unsubscribe = onCorporateUsersUpdate(account.id, (fetchedUsers) => {
                setUsers(fetchedUsers);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setUsers([]);
            setLoading(false);
        }
    }, [account]);

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsAddUserOpen(true);
    };
    
    const handleAddUserClick = () => {
        setEditingUser(null);
        setIsAddUserOpen(true);
    };
    
    const getStatusVariant = (status: User['status']) => {
        switch(status) {
            case 'Active': return 'default';
            case 'Pending': return 'secondary';
            case 'Suspended': return 'destructive';
            default: return 'outline';
        }
    };
    
    const getRoleVariant = (role: UserRole): 'default' | 'secondary' | 'outline' => {
        switch(role) {
            case 'corporate-admin': return 'default';
            case 'corporate-user': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Manage Accounts</h1>
                        <p className="text-muted-foreground">
                            Here you can manage your company's users and permissions.
                        </p>
                    </div>
                    <Button onClick={handleAddUserClick}>
                        <PlusCircle className="mr-2" />
                        Invite User
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                     Array.from({length: 3}).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-40" /></div></div></TableCell>
                                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant={getRoleVariant(user.role)}>{user.role.replace('corporate-', '')}</Badge></TableCell>
                                        <TableCell><Badge variant={getStatusVariant(user.status)}>{user.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <UserActions user={user} onEdit={() => handleEditUser(user)} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <AddUserDialog 
                isOpen={isAddUserOpen}
                onOpenChange={setIsAddUserOpen}
                editingUser={editingUser}
            />
        </>
    );
}
