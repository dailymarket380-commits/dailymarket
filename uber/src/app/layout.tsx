import './globals.css';

export const metadata = {
  title: 'Daily Market | Operations',
  description: 'Manage drivers, deliveries, and live operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
