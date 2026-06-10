import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MenuGO | Smart Digital Menu for Restaurants",
  description: "Experience the future of dining with MenuGO. Browse menus, place orders, and track your meal in real-time.",
  verification: {
    google: "EWODIrKK4OlJYCbLfMQvZPZiFWu-dVh0OvazszeqvM8",
  },
};

import ThemeRegistry from "@/components/ThemeRegistry";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Instantly remove extension-injected attributes to prevent React hydration mismatch errors
                const observer = new MutationObserver(function(mutations) {
                  for (let i = 0; i < mutations.length; i++) {
                    const addedNodes = mutations[i].addedNodes;
                    for (let j = 0; j < addedNodes.length; j++) {
                      const node = addedNodes[j];
                      if (node.nodeType === 1) {
                        if (node.hasAttribute('bis_skin_checked')) {
                          node.removeAttribute('bis_skin_checked');
                        }
                        const children = node.getElementsByTagName('*');
                        for (let k = 0; k < children.length; k++) {
                          if (children[k].hasAttribute('bis_skin_checked')) {
                            children[k].removeAttribute('bis_skin_checked');
                          }
                        }
                      }
                    }
                  }
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden" suppressHydrationWarning>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
