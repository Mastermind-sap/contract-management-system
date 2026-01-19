'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchBlueprints, createContract } from '@/lib/api';
import styles from './page.module.css';

interface Blueprint {
  id: string;
  title: string;
  schema: string; // JSON string
}

export default function CreateContract() {
  const router = useRouter();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBp, setSelectedBp] = useState<Blueprint | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBlueprints().then(setBlueprints).catch(console.error);
  }, []);

  const handleBlueprintChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bp = blueprints.find(b => b.id === e.target.value);
    setSelectedBp(bp || null);
    setFormData({}); // Reset form data
  };

  const handleFieldChange = (label: string, value: any) => {
    setFormData(prev => ({ ...prev, [label]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBp) return;

    setLoading(true);
    try {
      await createContract({
        blueprint_id: selectedBp.id,
        data: JSON.stringify(formData),
      });
      router.push('/');
    } catch (err) {
      alert('Failed to create contract');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: { type: string; label: string }, idx: number) => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            key={idx}
            type={field.type}
            className={styles.input}
            value={formData[field.label] || ''}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required
            placeholder={field.label}
          />
        );
      case 'date':
        return (
          <input
            key={idx}
            type="date"
            className={styles.input}
            value={formData[field.label] || ''}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required
          />
        );
      case 'boolean':
        return (
          <label key={idx} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData[field.label] || false}
              onChange={(e) => handleFieldChange(field.label, e.target.checked)}
            />
            {field.label}
          </label>
        );
      default:
        return null;
    }
  };

  // Safe schema parsing
  const schema = selectedBp ? JSON.parse(selectedBp.schema) : [];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>New Contract</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.group}>
          <label className={styles.label}>Select Blueprint</label>
          <select 
            onChange={handleBlueprintChange} 
            className={styles.select} 
            defaultValue=""
          >
            <option value="" disabled>-- Choose a template --</option>
            {blueprints.map(bp => (
              <option key={bp.id} value={bp.id}>{bp.title}</option>
            ))}
          </select>
        </div>

        {selectedBp && (
          <div className={styles.dynamicForm}>
            <h2 className={styles.subtitle}>Contract Details</h2>
            <div className={styles.fields}>
              {schema.map((field: any, i: number) => (
                <div key={i} className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{field.label}</label>
                  {renderField(field, i)}
                </div>
              ))}
            </div>
            
            <div className={styles.actions}>
              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? 'Creating...' : 'Initialise Contract'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
