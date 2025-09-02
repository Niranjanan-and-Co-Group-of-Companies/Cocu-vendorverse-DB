import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function CustomerPortal() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Customer Portal</h1>
            <p className="text-muted-foreground">Manage your gift orders and corporate needs.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> New Gift Order
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Gift Orders</CardTitle>
          <CardDescription>Track and manage your recent gift orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">#G-3210</TableCell>
                <TableCell>2023-10-26</TableCell>
                <TableCell><Badge>Shipped</Badge></TableCell>
                <TableCell>$150.00</TableCell>
                <TableCell className="text-right"><Button variant="outline" size="sm">View Details</Button></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">#G-3209</TableCell>
                <TableCell>2023-10-24</TableCell>
                <TableCell><Badge variant="secondary">Processing</Badge></TableCell>
                <TableCell>$75.50</TableCell>
                <TableCell className="text-right"><Button variant="outline" size="sm">View Details</Button></TableCell>
              </TableRow>
               <TableRow>
                <TableCell className="font-medium">#G-3208</TableCell>
                <TableCell>2023-10-22</TableCell>
                <TableCell><Badge variant="destructive">Cancelled</Badge></TableCell>
                <TableCell>$25.00</TableCell>
                <TableCell className="text-right"><Button variant="outline" size="sm">View Details</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Gift Catalog</CardTitle>
          <CardDescription>Browse available gifts from our vendors.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for gifts..." className="pl-8" />
          </div>
          <div className="text-center text-muted-foreground py-8">
            <p>The gift catalog will be displayed here.</p>
            <p className="text-sm">Start by searching for a perfect gift.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
