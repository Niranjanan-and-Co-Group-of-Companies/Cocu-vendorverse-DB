
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow bg-muted/40 py-12">
                <div className="container max-w-4xl">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl font-headline">About CO&Cu</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                            <p>
                                Welcome to CO&Cu, your premier destination for unique and memorable gifts for every occasion.
                                Our mission is to bridge the gap between talented vendors and customers seeking high-quality,
                                personalized, and corporate gifting solutions.
                            </p>
                            <h2>Our Story</h2>
                            <p>
                                Founded in 2024, CO&Cu was born from a simple idea: gifting should be a joyful and seamless
                                experience. We saw a world full of incredible artisans and vendors with amazing products, and a
                                world of customers looking for something more personal than mass-produced items. We decided to
                                create a platform to bring them together.
                            </p>
                             <h2>What We Do</h2>
                            <p>
                                We provide a robust platform for vendors to showcase their products, and for customers to discover
                                and customize them. From personalized gifts for loved ones to large-scale corporate orders, our
                                technology and community make it all possible.
                            </p>
                        </CardContent>
                     </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
