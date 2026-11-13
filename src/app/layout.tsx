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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://browser-compatible-treo-expansion.trycloudflare.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "EXCLUSIVE Spa Vehículos | Detallado de Autos y Motos",
  description: "Detallado profesional y Spa de Motos y Autos. Lavado técnico Snow Foam pH neutro, desengrasado y acabado espejo. Agenda tu cita en 30 segundos sin registros.",
  keywords: [
    "exclusive spa vehiculos",
    "exclusive detallado",
    "spa de motos y autos",
    "lavadero itagui",
    "lavado de motos medellin",
    "detailing automotriz",
    "agendar cita lavado",
    "snow foam ph neutro",
    "polichado ceramico"
  ],
  icons: {
    icon: "/images/logo-icon.png",
    shortcut: "/images/logo-icon.png",
    apple: "/images/logo-icon.png",
  },
  openGraph: {
    title: "EXCLUSIVE Spa Vehículos | Detallado de Autos y Motos",
    description: "Detallado profesional y Spa de Motos y Autos. Lavado técnico Snow Foam pH neutro, desengrasado y acabado espejo. Agenda tu cita en 30 segundos.",
    url: siteUrl,
    siteName: "EXCLUSIVE Spa Vehículos",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/images/og-share.jpg",
        width: 1200,
        height: 630,
        alt: "EXCLUSIVE Spa Vehículos - Detallado de Autos y Motos",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EXCLUSIVE Spa Vehículos | Detallado de Autos y Motos",
    description: "Detallado profesional y Spa de Motos y Autos. Lavado técnico Snow Foam pH neutro. Agenda tu cita en 30 segundos.",
    images: ["/images/og-share.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} dark scroll-smooth`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Intercept console.error to silence browser extension hydration warnings
                  var origError = console.error;
                  console.error = function() {
                    var str = '';
                    for (var i = 0; i < arguments.length; i++) {
                      str += ' ' + String(arguments[i]);
                    }
                    if (
                      str.indexOf('bis_skin_checked') !== -1 ||
                      str.indexOf('bis_register') !== -1 ||
                      str.indexOf('__processed_') !== -1 ||
                      (str.indexOf('hydration-mismatch') !== -1 && (str.indexOf('extension') !== -1 || str.indexOf('bis_') !== -1))
                    ) {
                      return;
                    }
                    return origError.apply(console, arguments);
                  };

                  var origWarn = console.warn;
                  console.warn = function() {
                    var str = '';
                    for (var i = 0; i < arguments.length; i++) {
                      str += ' ' + String(arguments[i]);
                    }
                    if (
                      str.indexOf('bis_skin_checked') !== -1 ||
                      str.indexOf('bis_register') !== -1 ||
                      str.indexOf('__processed_') !== -1
                    ) {
                      return;
                    }
                    return origWarn.apply(console, arguments);
                  };

                  // Prevent browser extensions from adding bis_skin_checked, bis_register, etc.
                  var origSetAttr = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, val) {
                    if (
                      name === 'bis_skin_checked' ||
                      name === 'bis_register' ||
                      (typeof name === 'string' && name.indexOf('__processed_') === 0)
                    ) {
                      return;
                    }
                    return origSetAttr.apply(this, arguments);
                  };

                  // Clean any attributes already injected
                  var clean = function() {
                    try {
                      var els = document.querySelectorAll('[bis_skin_checked]');
                      for (var i = 0; i < els.length; i++) {
                        els[i].removeAttribute('bis_skin_checked');
                      }
                      if (document.body) {
                        document.body.removeAttribute('bis_register');
                        for (var j = document.body.attributes.length - 1; j >= 0; j--) {
                          var a = document.body.attributes[j];
                          if (a && (a.name.indexOf('__processed_') === 0 || a.name.indexOf('bis_') === 0)) {
                            document.body.removeAttribute(a.name);
                          }
                        }
                      }
                    } catch (e) {}
                  };
                  clean();

                  if (window.MutationObserver) {
                    var obs = new MutationObserver(function(mutations) {
                      for (var i = 0; i < mutations.length; i++) {
                        var m = mutations[i];
                        if (m.type === 'attributes' && m.attributeName) {
                          if (
                            m.attributeName === 'bis_skin_checked' ||
                            m.attributeName === 'bis_register' ||
                            m.attributeName.indexOf('__processed_') === 0
                          ) {
                            if (m.target && m.target.removeAttribute) {
                              m.target.removeAttribute(m.attributeName);
                            }
                          }
                        }
                      }
                    });
                    obs.observe(document.documentElement, {
                      attributes: true,
                      subtree: true,
                      attributeFilter: ['bis_skin_checked', 'bis_register']
                    });
                  }
                } catch (err) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#07090E] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
