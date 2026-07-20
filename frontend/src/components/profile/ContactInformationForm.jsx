import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ContactInformationForm({ formData, onChange, isReadOnly = false }) {
  const { user } = useAuth();
  
  if (isReadOnly) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Email Address</label>
          <div style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {user?.email || '-'}
            {user?.emailVerified && <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 6px', borderRadius: '4px' }}>Verified</span>}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Mobile Number</label>
          <div style={{ color: 'var(--text)' }}>{formData.mobileNumber || '-'}</div>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Address</label>
          <div style={{ color: 'var(--text)' }}>
            {formData.addressLine1 ? (
              <>
                {formData.addressLine1} {formData.addressLine2 && `, ${formData.addressLine2}`} <br/>
                {formData.city && `${formData.city}, `} {formData.state && `${formData.state}, `} {formData.postalCode} <br/>
                {formData.country}
              </>
            ) : '-'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Email Address <span style={{color: '#f87171'}}>*</span></label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="email" 
            className="form-control" 
            value={user?.email || ''}
            readOnly
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
          />
        </div>
        <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>Email cannot be changed here.</small>
      </div>
      
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Mobile Number</label>
        <input 
          type="tel" 
          name="mobileNumber"
          className="form-control" 
          value={formData.mobileNumber || ''}
          onChange={onChange}
          placeholder="+1 555 123 4567"
          pattern="^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$"
          title="Please enter a valid phone number"
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
        <label className="form-label">Address Line 1</label>
        <input 
          type="text" 
          name="addressLine1"
          className="form-control" 
          value={formData.addressLine1 || ''}
          onChange={onChange}
          placeholder="Street address, P.O. box, company name, c/o"
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
        <label className="form-label">Address Line 2</label>
        <input 
          type="text" 
          name="addressLine2"
          className="form-control" 
          value={formData.addressLine2 || ''}
          onChange={onChange}
          placeholder="Apartment, suite, unit, building, floor, etc."
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">City</label>
        <input 
          type="text" 
          name="city"
          className="form-control" 
          value={formData.city || ''}
          onChange={onChange}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">State / Province</label>
        <input 
          type="text" 
          name="state"
          className="form-control" 
          value={formData.state || ''}
          onChange={onChange}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Postal / Zip Code</label>
        <input 
          type="text" 
          name="postalCode"
          className="form-control" 
          value={formData.postalCode || ''}
          onChange={onChange}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Country</label>
        <input 
          type="text" 
          name="country"
          className="form-control" 
          value={formData.country || ''}
          onChange={onChange}
        />
      </div>
    </div>
  );
}