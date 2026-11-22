import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata={title:'Drip District | The District of What’s Next',description:'Designer clothing, tech and accessories from Drip District.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
