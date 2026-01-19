'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchContracts } from '@/lib/api';
import styles from './page.module.css';

interface Contract {
  id: string;
  blueprint: { title: string };
  status: string;
  created_at: string;
}

export default function Home() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts()
      .then(setContracts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Contracts</h1>
          <p className={styles.subtitle}>Manage your agreements securely.</p>
        </div>
        <Link href="/contracts/create" className={styles.button}>
          + New Contract
        </Link>
      </header>

      {loading ? (
        <div className={styles.loading}>Loading contracts...</div>
      ) : contracts.length === 0 ? (
        <div className={styles.empty}>
          <p>No contracts found.</p>
          <Link href="/contracts/create" className={styles.link}>Create your first one</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {contracts.map((contract) => (
            <Link key={contract.id} href={`/contracts/${contract.id}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.blueprintName}>{contract.blueprint.title}</span>
                <span className={`${styles.status} ${styles[contract.status.toLowerCase()]}`}>
                  {contract.status}
                </span>
              </div>
              <div className={styles.cardFooter}>
                Created on {new Date(contract.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
