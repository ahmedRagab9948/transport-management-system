import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import { cookies } from 'next/headers';
import { AppProviders } from '@/providers/app-providers';
import type { Locale } from '@/lib/i18n';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TMS — Transport Management System',
  description: 'Enterprise transport management for logistics operations',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localeCookie = (await cookies()).get('tms_locale')?.value;
  const initialLocale: Locale = localeCookie === 'ar' ? 'ar' : 'en';
  const dir = initialLocale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={initialLocale} dir={dir} suppressHydrationWarning className={`${inter.variable} ${cairo.variable} h-full`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var t;
                try { t = localStorage.getItem('tms_theme') || localStorage.getItem('theme'); } catch(e) {}
                var d = 'dark';
                if (t === 'light' || (!t && window.matchMedia && !window.matchMedia('(prefers-color-scheme:dark)').matches)) d = 'light';
                document.documentElement.classList.add(d);

                /* block transitions until after first paint to prevent FOUC */
                document.documentElement.classList.add('no-transitions');
                requestAnimationFrame(function(){
                  requestAnimationFrame(function(){
                    document.documentElement.classList.remove('no-transitions');
                  });
                });
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AppProviders initialLocale={initialLocale}>{children}</AppProviders>
      </body>
    </html>
  );
}
