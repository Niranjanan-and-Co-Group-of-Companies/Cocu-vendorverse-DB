
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Edit, Trash2 } from 'lucide-react';
import type { CommissionableItem, Override } from '@/lib/commissions-service';
import { addOverride, deleteOverride } from '@/lib/commissions-service';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OverrideCardProps {
  title: string;
  description: string;
  items: CommissionableItem[];
  overrides: Override[];
  onEdit: (override: Override) => void;
  itemType: 'vendor' | 'product';
  searchPlaceholder: string;
}

export function OverrideCard({
  title,
  description,
  items,
  overrides,
  onEdit,
  itemType,
  searchPlaceholder,
}: OverrideCardProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { toast } = useToast();
  
  const searchResults = React.useMemo(() => {
    if (!searchQuery) return [];
    const lowerCaseQuery = searchQuery.toLowerCase();
    const existingOverrideIds = new Set(overrides.map(o => o.itemId));
    return items
      .filter(item => item.name.toLowerCase().includes(lowerCaseQuery) && !existingOverrideIds.has(item.id))
      .slice(0, 5);
  }, [searchQuery, items, overrides]);

  const handleAddOverride = async (item: CommissionableItem) => {
    try {
        await addOverride(itemType, item.id, item.name);
        toast({ title: `Override added for ${item.name}` });
        setSearchQuery('');
    } catch(error) {
        console.error(`Failed to add ${itemType} override:`, error);
        toast({ title: "Error", description: `Failed to add override for ${item.name}`, variant: 'destructive'});
    }
  };
  
  const handleDeleteOverride = async (overrideId: string) => {
    try {
        await deleteOverride(itemType, overrideId);
        toast({ title: "Override removed" });
    } catch (error) {
        console.error(`Failed to delete ${itemType} override:`, error);
        toast({ title: "Error", description: `Failed to remove override.`, variant: 'destructive'});
    }
  }

  const formatBuffer = (rule: { bufferType: 'fixed' | 'percentage', bufferValue: number }) => {
    if (rule.bufferType === 'fixed') {
        return `₹${rule.bufferValue.toFixed(2)}`;
    }
    return `${rule.bufferValue}%`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
             <div className="absolute top-full mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md z-10">
                {searchResults.map(item => (
                    <div 
                        key={item.id} 
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                        onClick={() => handleAddOverride(item)}
                    >
                        {item.name}
                    </div>
                ))}
            </div>
          )}
        </div>

        <ScrollArea className="h-48 pr-4">
          <Table>
            <TableBody>
              {overrides.length > 0 ? overrides.map((override) => (
                <TableRow key={override.id}>
                  <TableCell>
                    <p className="font-medium truncate">{override.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {override.commissionRate}% | {formatBuffer(override)}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(override)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteOverride(override.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell className="text-center text-muted-foreground py-8">
                        No overrides created.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
