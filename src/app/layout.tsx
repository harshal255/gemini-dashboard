import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const neueKabel = localFont({
  src: [
    {
      path: "../assets/Neue_Kabel_Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/Neue_Kabel_Light_Italic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../assets/Neue_Kabel_Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-neue-kabel",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gemini API Checker | Validate & Test Google Gemini Keys Online",
  description: "Test and check if Google Gemini API key is valid or not online. Securely validate keys in browser, inspect models catalog, response latency, free tier token counts, and RPM/RPD limits.",
  keywords: "how to test if gemini api is working, how to check if api is valid or not, how do i check my gemini validity, test gemini api key online, free gemini api, gemini api key generator, how to get gemini api key, gemini api models, is gemini api free for testing, check gemini api key validity javascript github",
  authors: [{ name: "Gemini API Checker" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "Gemini API Checker | Validate & Test Google Gemini Keys",
    description: "Securely validate and test Google Gemini API keys online. Inspect latency, token counts, models, and free-tier request limits in the browser.",
    images: [{ url: "/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gemini API Checker | Test Key Validity",
    description: "Secure, client-side Gemini API key validator. Test prompts, files, latency, and view active rate limits.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${neueKabel.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('gemini_tester_theme');
                  var theme = saved === 'light' ? 'light' : 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `
          }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
