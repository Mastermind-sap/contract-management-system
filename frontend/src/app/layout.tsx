import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Contract Platform',
  description: 'Premium Contract Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <nav className={styles.nav}>
          <div className={styles.container}>
            <Link href="/" className={styles.logo}>
              ContractFlow
            </Link>
            <div className={styles.links}>
              <Link href="/" className={styles.link}>Dashboard</Link>
              <Link href="/blueprints/create" className={styles.link}>New Blueprint</Link>
            </div>
          </div>
        </nav>
        <main className={styles.main}>
          {children}
        </main>
      </body>
    </html>
  );
}
