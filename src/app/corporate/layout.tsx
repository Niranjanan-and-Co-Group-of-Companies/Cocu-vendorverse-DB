
import CorporateLayout from '@/components/corporate/layout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CorporateLayout>{children}</CorporateLayout>;
}
