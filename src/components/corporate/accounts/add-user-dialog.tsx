
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useCorporateAccount } from '@/hooks/use-corporate-account-store.tsx';
import { addCorporateUser, updateCorporateUserRole } from '@/lib/corporate-users-service';
import type { User, UserRole } from '@/lib/user-service';

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
}

export function AddUserDialog({ isOpen, onOpenChange, editingUser }: AddUserDialogProps) {
    const { account } = useCorporateAccount();
    const { toast } = useToast();
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState<UserRole>('corporate-user');
    const [isSaving, setIsSaving] = React.useState(false);
    
    const isEditMode = !!editingUser;

    React.useEffect(() => {
        if (editingUser) {
            setName(editingUser.name);
            setEmail(editingUser.email);
            setRole(editingUser.role);
        } else {
            setName('');
            setEmail('');
            setRole('corporate-user');
        }
    }, [editingUser, isOpen]);

    const handleSubmit = async () => {
        if (!account) {
            toast({ title: "Account not found", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            if (isEditMode && editingUser) {
                await updateCorporateUserRole(editingUser.id, role);
                toast({ title: "User Role Updated" });
            } else {
                 if (!name || !email || !role) {
                    toast({ title: "All fields are required", variant: "destructive" });
                    return;
                }
                await addCorporateUser(account.id, { name, email, role });
                toast({ title: "Invitation Sent", description: `${name} has been invited to join your corporate account.` });
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save user:", error);
            toast({ title: "Error", description: `Failed to ${isEditMode ? 'update' : 'invite'} user.`, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit User Role' : 'Invite New User'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} disabled={isEditMode} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={isEditMode} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="corporate-admin">Admin</SelectItem>
                                <SelectItem value="corporate-user">User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 animate-spin" />}
                        {isEditMode ? 'Save Changes' : 'Send Invite'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
