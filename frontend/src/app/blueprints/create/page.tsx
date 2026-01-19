'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBlueprint } from '@/lib/api';
import styles from './page.module.css';

interface Field {
  type: 'text' | 'number' | 'date' | 'boolean';
  label: string;
}

export default function CreateBlueprint() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New field state
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<Field['type']>('text');

  const addField = () => {
    if (!newFieldLabel) return;
    setFields([...fields, { type: newFieldType, label: newFieldLabel }]);
    setNewFieldLabel(''); // Reset input
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      await createBlueprint({
        title,
        description,
        schema: JSON.stringify(fields),
      });
      router.push('/');
    } catch (err) {
      alert('Failed to create blueprint');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Blueprint</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.group}>
          <label className={styles.label}>Blueprint Title</label>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Non-Disclosure Agreement"
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
          />
        </div>

        <div className={styles.builder}>
          <h2 className={styles.subtitle}>Form Builder</h2>
          <p className={styles.hint}>Add fields to define the data structure of this contract.</p>
          
          <div className={styles.addSection}>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Field Label (e.g. 'Effective Date')"
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
            />
            <select 
              className={styles.select}
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value as Field['type'])}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="boolean">Checkbox</option>
            </select>
            <button type="button" onClick={addField} className={styles.addBtn} disabled={!newFieldLabel}>
              + Add Field
            </button>
          </div>

          <div className={styles.preview}>
            {fields.length === 0 ? (
              <div className={styles.empty}>No fields added yet.</div>
            ) : (
              fields.map((field, i) => (
                <div key={i} className={styles.fieldPreview}>
                  <span className={styles.badge}>{field.type}</span>
                  <span className={styles.fieldLabel}>{field.label}</span>
                  <button type="button" onClick={() => removeField(i)} className={styles.removeBtn}>×</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={() => router.back()} className={styles.secondaryBtn}>Cancel</button>
          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Creating...' : 'Save Blueprint'}
          </button>
        </div>
      </form>
    </div>
  );
}
