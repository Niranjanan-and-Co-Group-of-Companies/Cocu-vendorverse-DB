import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function VendorPortal() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Vendor Portal</h1>
            <p className="text-muted-foreground">Manage your products, orders, and bids.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>
      
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">My Products</TabsTrigger>
          <TabsTrigger value="bids">Bids</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Orders</CardTitle>
              <CardDescription>Manage and fulfill customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">#3210</TableCell>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell><Badge variant="secondary">Processing</Badge></TableCell>
                    <TableCell>$150.00</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm">View Details</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>My Products</CardTitle>
              <CardDescription>Manage your product listings.</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-8">
              <p>You haven't added any products yet.</p>
              <Button size="sm" className="mt-4">Add your first product</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bids">
          <Card>
            <CardHeader>
              <CardTitle>Active Bids</CardTitle>
              <CardDescription>Manage your bids on corporate requirements.</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-8">
              <p>No active bids to display.</p>
               <Button variant="outline" size="sm" className="mt-4">Browse Requirements</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
