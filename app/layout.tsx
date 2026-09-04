import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Thetanuts Finance | Options Strategy Explorer',
  description: 'Professional options intelligence powered by Thetanuts Finance.',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
