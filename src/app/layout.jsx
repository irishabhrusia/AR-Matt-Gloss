import './globals.css';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata = {
  title: 'AR Matt & Gloss Decorators | Make your walls unforgettable',
  description: 'Professional interior & exterior painting, limewash and spray finishes across London and Surrey. Fully insured, spotlessly tidy.',
  icons: {
    icon: '/assets/graphics/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/svg+xml" href="/assets/graphics/favicon.svg" />

        {/* Preload stylesheets for instantaneous navigation */}
        <link rel="preload" href="/assets/css/home.css" as="style" />
        <link rel="preload" href="/assets/css/services.css" as="style" />
        <link rel="preload" href="/assets/css/portfolio.css" as="style" />
        <link rel="preload" href="/assets/css/testimonials.css" as="style" />
        <link rel="preload" href="/assets/css/contact.css" as="style" />
        <link rel="preload" href="/assets/css/interior-painting.css" as="style" />
        <link rel="preload" href="/assets/css/exterior-painting.css" as="style" />
        <link rel="preload" href="/assets/css/limewash-specialist.css" as="style" />
        <link rel="preload" href="/assets/css/decorative-finishes.css" as="style" />
        <link rel="preload" href="/assets/css/cabinet-refinishing.css" as="style" />
        <link rel="preload" href="/assets/css/commercial-painting.css" as="style" />

        <link id="active-page-style" rel="stylesheet" href="/assets/css/home.css" />
      </head>
      <body suppressHydrationWarning>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
