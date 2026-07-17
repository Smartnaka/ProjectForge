import type { Metadata } from "next"; import "./globals.css"; import { Providers } from "@/components/providers";
export const metadata: Metadata={title:"ProjectForge — Plan before code",description:"A premium software engineering workspace for planning complete applications before implementation."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body><Providers>{children}</Providers></body></html>}
