'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchContract, updateContractStatus } from '@/lib/api';
import styles from './page.module.css';

interface Contract {
  id: string;
  blueprint: { title: string };
  status: string;
  data: string; // JSON string
  created_at: string;
  updated_at: string;
}

export default function ContractDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(p => {
        setId(p.id);
        fetchContract(p.id)
        .then(setContract)
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [params]);

  const handleStatusChange = async (newStatus: string) => {
    if (!contract) return;
    setActionLoading(true);
    try {
      const updated = await updateContractStatus(contract.id, newStatus);
      setContract(updated);
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading contract...</div>;
  if (!contract) return <div className={styles.error}>Contract not found</div>;

  const data = JSON.parse(contract.data);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
            <div className={styles.meta}>
                <span className={styles.label}>Contract ID: {contract.id}</span>
            </div>
            <h1 className={styles.title}>{contract.blueprint.title}</h1>
        </div>
        <span className={`${styles.statusBadge} ${styles[contract.status.toLowerCase()]}`}>
          {contract.status}
        </span>
      </div>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>Contract Terms</h2>
        <div className={styles.grid}>
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className={styles.field}>
              <span className={styles.fieldLabel}>{key}</span>
              <span className={styles.fieldValue}>
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.lifecycle}>
        <h2 className={styles.sectionTitle}>Actions</h2>
        <div className={styles.actions}>
            {contract.status === 'CREATED' && (
                <button 
                  onClick={() => handleStatusChange('APPROVED')} 
                  disabled={actionLoading}
                  className={styles.approveBtn}
                >
                    Approve Contract
                </button>
            )}
            {contract.status === 'APPROVED' && (
                <button 
                  onClick={() => handleStatusChange('SENT')} 
                  disabled={actionLoading}
                  className={styles.sendBtn}
                >
                    Mark as Sent
                </button>
            )}
            {contract.status === 'SENT' && (
                <button 
                  onClick={() => handleStatusChange('SIGNED')} 
                  disabled={actionLoading}
                  className={styles.signBtn}
                >
                    Sign Contract
                </button>
            )}
            {contract.status === 'SIGNED' && (
                <button 
                  onClick={() => handleStatusChange('LOCKED')} 
                  disabled={actionLoading}
                  className={styles.lockBtn}
                >
                    Finalize & Lock
                </button>
            )}
            
            {/* Revoke is always possible unless Finalized/Revoked */}
            {['CREATED', 'APPROVED', 'SENT', 'SIGNED'].includes(contract.status) && (
                <button 
                  onClick={() => handleStatusChange('REVOKED')} 
                  disabled={actionLoading}
                  className={styles.revokeBtn}
                >
                    Revoke Contract
                </button>
            )}

            {['LOCKED', 'REVOKED'].includes(contract.status) && (
                <p className={styles.finalState}>This contract is finalized and cannot be modified.</p>
            )}
        </div>
      </div>
    </div>
  );
}
