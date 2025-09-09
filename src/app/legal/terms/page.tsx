
export default function TermsOfServicePage() {
    return (
        <>
            <h1>Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <h2>1. Agreement to Terms</h2>
            <p>By using our services, you agree to be bound by these Terms. If you don’t agree to be bound by these Terms, do not use the services.</p>

            <h2>2. Privacy Policy</h2>
            <p>Please refer to our Privacy Policy for information on how we collect, use and disclose information from our users.</p>

            <h2>3. Changes to Terms or Services</h2>
            <p>We may update the Terms at any time, in our sole discretion. If we do so, we’ll let you know either by posting the updated Terms on the Site or through other communications. It’s important that you review the Terms whenever we update them or you use the Services.</p>

            <h2>4. Who May Use the Services</h2>
            <p>You may use the Services only if you are 18 years or older and capable of forming a binding contract with VendorVerse and are not barred from using the Services under applicable law.</p>

            <h2>5. Content Ownership</h2>
            <p>We do not claim any ownership rights in any User Content and nothing in these Terms will be deemed to restrict any rights that you may have to use and exploit your User Content.</p>
        </>
    );
}
