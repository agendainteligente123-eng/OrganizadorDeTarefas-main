import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/src/components/AuthProvider';
import { ThemeProvider } from '@/src/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Rotina ADS',
  description: 'Gestão de tempo e hábitos',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased font-sans transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
