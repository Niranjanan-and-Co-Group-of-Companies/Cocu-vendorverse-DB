
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AccountAddressesPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Addresses</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Your saved shipping and billing addresses will appear here.</p>
            </CardContent>
        </Card>
    );
}
