import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

export default function AdminPortal() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Portal</h1>
        <p className="text-muted-foreground">Oversee and manage the VendorVerse platform.</p>
      </div>
      
      <Tabs defaultValue="vendors">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="orders">Gift Orders</TabsTrigger>
          <TabsTrigger value="catalog">Gift Catalog</TabsTrigger>
        </TabsList>
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Management</CardTitle>
              <CardDescription>Manage all gift vendors on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">V-001</TableCell>
                    <TableCell>Artisan Gifts</TableCell>
                    <TableCell><Badge>Approved</Badge></TableCell>
                    <TableCell>2023-01-15</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm">Manage</Button></TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="font-medium">V-002</TableCell>
                    <TableCell>Gourmet Baskets</TableCell>
                    <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                    <TableCell>2023-10-28</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm">Manage</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>View and manage all customers.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Customer list will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Gift Order Management</CardTitle>
              <CardDescription>Oversee all gift orders on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Gift order list will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="catalog">
          <Card>
            <CardHeader>
              <CardTitle>Gift Catalog Management</CardTitle>
              <CardDescription>Manage the entire gift catalog.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Gift catalog management tools will be here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
