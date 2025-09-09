
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin } from 'lucide-react';

const mockJobs = [
    { title: 'Senior Frontend Engineer', location: 'Remote (India)', department: 'Engineering' },
    { title: 'Vendor Onboarding Specialist', location: 'Mumbai, India', department: 'Operations' },
    { title: 'Head of Corporate Sales', location: 'Bangalore, India', department: 'Sales' },
    { title: 'Product Designer (UI/UX)', location: 'Remote (India)', department: 'Design' },
];

export default function CareersPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow bg-muted/40 py-12">
                <div className="container max-w-4xl">
                     <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold font-headline">Join Our Team</h1>
                        <p className="mt-2 text-lg text-muted-foreground">We're building the future of gifting. Come be a part of our journey.</p>
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Open Positions</CardTitle>
                             <CardDescription>We're always looking for talented people to join us.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockJobs.map((job, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                        <div>
                                            <h3 className="font-semibold">{job.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                <div className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.department}</div>
                                                <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</div>
                                            </div>
                                        </div>
                                        <Button asChild className="mt-3 sm:mt-0">
                                            <a href="#" target="_blank" rel="noopener noreferrer">Apply Now</a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
