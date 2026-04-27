import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Download, Trash2, CheckCircle, AlertCircle, User, Phone, Mail, MapPin, Briefcase, FileText, Shield, Calendar, Plus, UserCheck, Eye, ChevronDown } from 'lucide-react';
import { guarantorService, Guarantor, GuarantorInput } from '../services/guarantorService';
import { API_ENDPOINT } from '../config/config';

interface GuarantorFormProps {
  staffId: number;
  onSuccess?: () => void;
}

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
  'FCT'
];

const idTypeOptions = [
  { value: 'national_id', label: 'National ID Card' },
  { value: 'passport', label: 'International Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'voters_card', label: "Voter's Card" },
  { value: 'other', label: 'Other' }
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const guaranteeTypeOptions = [
  { value: 'personal', label: 'Personal Guarantee' },
  { value: 'financial', label: 'Financial Guarantee' },
  { value: 'both', label: 'Both Personal & Financial' }
];

const relationshipOptions = [
  'Spouse', 'Parent', 'Sibling', 'Child', 'Relative', 'Friend', 'Colleague', 'Other'
];

const T = {
  primary: 'var(--primary-600)',
  primaryLight: 'var(--primary-500)',
  primaryPale: 'var(--primary-50)',
  primaryBorder: 'var(--primary-200)',
  success: 'var(--success-600)',
  successPale: 'var(--success-50)',
  successBorder: 'var(--success-100)',
  warning: 'var(--warning-600)',
  warningPale: 'var(--warning-50)',
  warningBorder: 'var(--warning-100)',
  danger: 'var(--error-600)',
  dangerPale: 'var(--error-50)',
  dangerBorder: 'var(--error-100)',
  purple: 'var(--purple-600)',
  purplePale: 'var(--purple-50)',
  purpleBorder: 'var(--purple-100)',
  surface: 'var(--bg-elevated)',
  surfaceAlt: 'var(--bg-secondary)',
  surfaceMuted: 'var(--bg-tertiary)',
  border: 'var(--border-light)',
  borderStrong: 'var(--border-medium)',
  text: 'var(--text-primary)',
  textSub: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  shadow: 'var(--shadow-sm)',
  shadowMd: 'var(--shadow-md)',
  shadowLg: 'var(--shadow-lg)',
  radius: 'var(--radius-lg)',
  radiusXl: 'var(--radius-xl)',
};

const cardStyle: React.CSSProperties = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: T.radiusXl,
  boxShadow: T.shadow,
};

const panelStyle: React.CSSProperties = {
  ...cardStyle,
  overflow: 'hidden',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem 1rem',
  border: `1.5px solid ${T.border}`,
  borderRadius: T.radius,
  background: T.surface,
  color: T.text,
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  boxShadow: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: T.text,
  marginBottom: '0.45rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const primaryButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.8rem 1.2rem',
  borderRadius: T.radius,
  border: 'none',
  background: `linear-gradient(135deg, ${T.primaryLight}, ${T.primary})`,
  color: '#fff',
  fontSize: '0.9rem',
  fontWeight: 700,
  boxShadow: T.shadowMd,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const secondaryButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.8rem 1.2rem',
  borderRadius: T.radius,
  border: `1.5px solid ${T.border}`,
  background: T.surface,
  color: T.textSub,
  fontSize: '0.9rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: T.shadow,
};

const sectionStyle: React.CSSProperties = {
  ...cardStyle,
  padding: '1.35rem',
};

const metricStyle = (accent: string, pale: string): React.CSSProperties => ({
  ...cardStyle,
  padding: '1rem 1.15rem',
  borderTop: `3px solid ${accent}`,
  background: pale,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
});

const getGuarantorFileUrl = (filePath?: string | null): string | null => {
  if (!filePath) {
    return null;
  }

  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  if (filePath.startsWith('/api/')) {
    return `${API_ENDPOINT.replace(/\/$/, '')}${filePath}`;
  }

  return `${API_ENDPOINT.replace(/\/$/, '')}/${filePath.replace(/^\//, '')}`;
};

export function GuarantorForm({ staffId, onSuccess }: GuarantorFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingForm, setUploadingForm] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [selectedGuarantor, setSelectedGuarantor] = useState<Guarantor | null>(null);
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
  const [showList, setShowList] = useState(true);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyingGuarantorId, setVerifyingGuarantorId] = useState<number | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  const emptyGuarantor: GuarantorInput = {
    staff_id: staffId,
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: undefined,
    phone_number: '',
    alternate_phone: '',
    email: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Nigeria',
    id_type: undefined,
    id_number: '',
    id_issuing_authority: '',
    id_issue_date: '',
    id_expiry_date: '',
    relationship: '',
    occupation: '',
    employer_name: '',
    employer_address: '',
    guarantee_type: 'personal',
    guarantee_amount: undefined,
    guarantee_terms: '',
    is_active: true
  };

  const [formData, setFormData] = useState<GuarantorInput>(emptyGuarantor);

  useEffect(() => {
    loadGuarantors();
  }, [staffId]);

  const loadGuarantors = async () => {
    try {
      const response = await guarantorService.getGuarantors(staffId);
      if (response.success) {
        setGuarantors(response.data.guarantors || []);
      }
    } catch (err: any) {
      console.error('Error loading guarantors:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (selectedGuarantor) {
        const response = await guarantorService.updateGuarantor(selectedGuarantor.id, formData);
        if (response.success) {
          setSuccessMessage('Guarantor updated successfully');
          resetForm();
          loadGuarantors();
          if (onSuccess) onSuccess();
        }
      } else {
        const response = await guarantorService.createGuarantor(formData);
        if (response.success) {
          setSuccessMessage('Guarantor created successfully');
          resetForm();
          loadGuarantors();
          if (onSuccess) onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save guarantor');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyGuarantor);
    setSelectedGuarantor(null);
    setShowList(true);
    setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, 3000);
  };

  const handleEdit = (guarantor: Guarantor) => {
    setFormData({
      ...guarantor,
      date_of_birth: guarantor.date_of_birth ? guarantor.date_of_birth.split('T')[0] : '',
      id_issue_date: guarantor.id_issue_date ? guarantor.id_issue_date.split('T')[0] : '',
      id_expiry_date: guarantor.id_expiry_date ? guarantor.id_expiry_date.split('T')[0] : ''
    });
    setSelectedGuarantor(guarantor);
    setShowList(false);
  };

  const handleDelete = async (guarantorId: number, guarantorName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${guarantorName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await guarantorService.deleteGuarantor(guarantorId);
      if (response.success) {
        setSuccessMessage('Guarantor deleted successfully');
        loadGuarantors();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete guarantor');
    }
  };

  const handleVerify = async (guarantorId: number) => {
    setError(null);
    setSuccessMessage(null);
    setVerifyingGuarantorId(guarantorId);
    setVerificationNotes('');
    setIsVerifyModalOpen(true);
  };

  const closeVerifyModal = () => {
    if (verifying) return;
    setIsVerifyModalOpen(false);
    setVerifyingGuarantorId(null);
    setVerificationNotes('');
  };

  const confirmVerify = async () => {
    if (!verifyingGuarantorId) return;
    setVerifying(true);
    try {
      const response = await guarantorService.verifyGuarantor(
        verifyingGuarantorId,
        verificationNotes.trim() ? verificationNotes.trim() : undefined
      );
      if (response.success) {
        setSuccessMessage('Guarantor verified successfully');
        loadGuarantors();
        setTimeout(() => setSuccessMessage(null), 3000);
        closeVerifyModal();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify guarantor');
    } finally {
      setVerifying(false);
    }
  };

  const handleUploadDocument = async (guarantorId: number, documentType: 'form' | 'id', file: File) => {
    try {
      if (documentType === 'form') {
        setUploadingForm(true);
      } else {
        setUploadingId(true);
      }

      const response = await guarantorService.uploadDocument(guarantorId, documentType, file);
      if (response.success) {
        setSuccessMessage('Document uploaded successfully');
        loadGuarantors();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      if (documentType === 'form') {
        setUploadingForm(false);
      } else {
        setUploadingId(false);
      }
    }
  };

  const handleInputChange = (field: keyof GuarantorInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const stats = {
    total: guarantors.length,
    verified: guarantors.filter((g) => g.is_verified).length,
    pending: guarantors.filter((g) => !g.is_verified).length,
  };

  const InputField = ({ 
    label, 
    field, 
    type = 'text', 
    required = false,
    icon: Icon
  }: { 
    label: string; 
    field: keyof GuarantorInput; 
    type?: string; 
    required?: boolean;
    icon?: any;
  }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4" style={{ color: T.textMuted }} />}
        <span style={{ ...labelStyle, marginBottom: 0 }}>
          {label} {required && <span style={{ color: T.danger }}>*</span>}
        </span>
      </div>
      {type === 'textarea' ? (
        <textarea
          className="input w-full"
          value={(formData[field] as string) || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          rows={3}
          required={required}
          style={inputStyle}
        />
      ) : type === 'select' ? (
        <div className="relative">
          <select
            className="input w-full"
            value={(formData[field] as string) || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            required={required}
            style={{ ...inputStyle, appearance: 'none', paddingRight: '2.5rem' }}
          >
            <option value="">Select {label}</option>
            {field === 'gender' && genderOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            {field === 'id_type' && idTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            {field === 'guarantee_type' && guaranteeTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            {field === 'state' && nigerianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
            {field === 'relationship' && relationshipOptions.map(rel => (
              <option key={rel} value={rel}>{rel}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.textMuted }} />
        </div>
      ) : (
        <input
          type={type}
          className="input w-full"
          value={(formData[field] as string) || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          required={required}
          style={inputStyle}
        />
      )}
    </div>
  );

  if (!showList) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: T.text }}>
        <div style={{ ...cardStyle, padding: '1.15rem 1.3rem', background: `linear-gradient(135deg, ${T.primaryPale}, #ffffff)` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.7rem', borderRadius: '999px', background: T.surface, border: `1px solid ${T.primaryBorder}`, color: T.primary, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <Shield className="w-3.5 h-3.5" />
                Guarantor Records
              </div>
              <h4 style={{ margin: '0.75rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: T.text }}>
                {selectedGuarantor ? 'Edit Guarantor' : 'Add New Guarantor'}
              </h4>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.92rem', color: T.textSub, maxWidth: '60ch' }}>
                Capture verified guarantor details in a consistent format for onboarding and compliance.
              </p>
            </div>
          <button
            onClick={resetForm}
              style={secondaryButton}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {successMessage && (
            <div style={{ ...sectionStyle, borderColor: T.successBorder, background: T.successPale }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: T.success, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <CheckCircle className="w-4 h-4" />
                {successMessage}
              </p>
            </div>
          )}

          {error && (
            <div style={{ ...sectionStyle, borderColor: T.dangerBorder, background: T.dangerPale }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: T.danger, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {/* Personal Information */}
          <section style={sectionStyle}>
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '10px', background: T.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.primary }}>
                <User className="w-4 h-4" />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: 800, color: T.text }}>Personal Information</h5>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.84rem', color: T.textMuted }}>Primary identity and contact details.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField label="First Name" field="first_name" required icon={User} />
              <InputField label="Middle Name" field="middle_name" />
              <InputField label="Last Name" field="last_name" required icon={User} />
              <InputField label="Date of Birth" field="date_of_birth" type="date" icon={Calendar} />
              <InputField label="Gender" field="gender" type="select" icon={User} />
              <InputField label="Phone Number" field="phone_number" type="tel" required icon={Phone} />
              <InputField label="Alternate Phone" field="alternate_phone" type="tel" icon={Phone} />
              <InputField label="Email" field="email" type="email" icon={Mail} />
              <InputField label="Relationship" field="relationship" type="select" icon={UserCheck} />
            </div>
          </section>

          {/* Address */}
          <section style={sectionStyle}>
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '10px', background: T.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.primary }}>
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: 800, color: T.text }}>Address Information</h5>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.84rem', color: T.textMuted }}>Residence and mailing information for the guarantor.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField label="Address Line 1" field="address_line_1" required icon={MapPin} />
              <InputField label="Address Line 2" field="address_line_2" />
              <InputField label="City" field="city" icon={MapPin} />
              <InputField label="State" field="state" type="select" icon={MapPin} />
              <InputField label="Postal Code" field="postal_code" icon={MapPin} />
              <InputField label="Country" field="country" icon={MapPin} />
            </div>
          </section>

          {/* Identification */}
          <section style={sectionStyle}>
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '10px', background: T.purplePale, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.purple }}>
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: 800, color: T.text }}>Identification Details</h5>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.84rem', color: T.textMuted }}>Government-issued ID used for verification.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField label="ID Type" field="id_type" type="select" icon={Shield} />
              <InputField label="ID Number" field="id_number" icon={Shield} />
              <InputField label="Issuing Authority" field="id_issuing_authority" icon={Shield} />
              <InputField label="Issue Date" field="id_issue_date" type="date" icon={Calendar} />
              <InputField label="Expiry Date" field="id_expiry_date" type="date" icon={Calendar} />
            </div>
          </section>

          {/* Employment */}
          <section style={sectionStyle}>
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '10px', background: T.successPale, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.success }}>
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: 800, color: T.text }}>Employment Information</h5>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.84rem', color: T.textMuted }}>Occupation and employer context.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField label="Occupation" field="occupation" icon={Briefcase} />
              <InputField label="Employer Name" field="employer_name" icon={Briefcase} />
              <InputField label="Employer Address" field="employer_address" icon={MapPin} />
            </div>
          </section>

          {/* Guarantee Details */}
          <section style={sectionStyle}>
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '10px', background: T.warningPale, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.warning }}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: 800, color: T.text }}>Guarantee Details</h5>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.84rem', color: T.textMuted }}>Optional terms if the guarantor is backing a financial obligation.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField label="Guarantee Type" field="guarantee_type" type="select" icon={FileText} />
              <InputField label="Guarantee Amount (₦)" field="guarantee_amount" type="number" icon={BanknoteIcon} />
              <div className="md:col-span-2 lg:col-span-3">
                <InputField label="Terms & Conditions" field="guarantee_terms" type="textarea" icon={FileText} />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={resetForm}
              style={secondaryButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButton,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {selectedGuarantor ? 'Update' : 'Create'} Guarantor
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', color: T.text }}>
      <div style={{ ...cardStyle, padding: '1.15rem 1.25rem', background: `linear-gradient(135deg, ${T.primaryPale}, #ffffff)` }}>
        <div className="flex items-center justify-between" style={{ gap: '1rem', flexWrap: 'wrap' }}>
        <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.7rem', borderRadius: '999px', background: T.surface, border: `1px solid ${T.primaryBorder}`, color: T.primary, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <UserCheck className="w-3.5 h-3.5" />
              Guarantor Registry
            </div>
          <h4 style={{ margin: '0.75rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: T.text }}>
            Guarantors Information
          </h4>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.92rem', color: T.textSub }}>
            {guarantors.length} guarantor{guarantors.length !== 1 ? 's' : ''} on record
          </p>
        </div>
        <button
          onClick={() => setShowList(false)}
            style={primaryButton}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Guarantor
        </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
        <div style={metricStyle(T.primary, T.primaryPale)}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textMuted }}>Total</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: T.text, lineHeight: 1.1 }}>{stats.total}</div>
          </div>
          <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '12px', background: `${T.primary}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.primary }}>
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div style={metricStyle(T.success, T.successPale)}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textMuted }}>Verified</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: T.text, lineHeight: 1.1 }}>{stats.verified}</div>
          </div>
          <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '12px', background: `${T.success}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.success }}>
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div style={metricStyle(T.warning, T.warningPale)}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textMuted }}>Pending</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: T.text, lineHeight: 1.1 }}>{stats.pending}</div>
          </div>
          <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '12px', background: `${T.warning}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.warning }}>
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {successMessage && (
        <div style={{ ...sectionStyle, borderColor: T.successBorder, background: T.successPale }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: T.success, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <CheckCircle className="w-4 h-4" />
            {successMessage}
          </p>
        </div>
      )}

      {guarantors.length === 0 ? (
        <div style={{ ...cardStyle, padding: '3rem 1.5rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px' }}>
          <div style={{ width: '4.25rem', height: '4.25rem', background: T.primaryPale, borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: T.primary }}>
            <UserCheck className="w-10 h-10" />
          </div>
          <h5 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', fontWeight: 800, color: T.text }}>No guarantors added yet</h5>
          <p style={{ margin: '0 auto 1.25rem', maxWidth: '34rem', color: T.textSub, fontSize: '0.92rem' }}>
            Every staff member requires verified guarantors for security and institutional compliance.
          </p>
          <button
            onClick={() => setShowList(false)}
            style={primaryButton}
          >
            Add First Guarantor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {guarantors.map(guarantor => (
            <div key={guarantor.id} style={{ ...panelStyle, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1.15rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', background: `linear-gradient(180deg, ${T.surfaceAlt}, ${T.surface})` }}>
                <div className="flex items-center gap-4">
                  <div style={{ width: '3rem', height: '3rem', borderRadius: '14px', background: T.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.primary, fontWeight: 900, fontSize: '1rem' }}>
                    {guarantor.first_name[0]}{guarantor.last_name[0]}
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 800, color: T.text, lineHeight: 1.2 }}>
                      {guarantor.first_name} {guarantor.middle_name} {guarantor.last_name}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: T.textSub, background: T.surfaceMuted, padding: '0.25rem 0.5rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {guarantor.relationship}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: T.textMuted }}>•</span>
                      <span style={{ fontSize: '0.82rem', color: T.textSub, fontWeight: 700 }}>{guarantor.occupation}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {guarantor.is_verified ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.65rem', borderRadius: '999px', background: T.successPale, color: T.success, fontSize: '0.72rem', fontWeight: 800 }}>
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.65rem', borderRadius: '999px', background: T.warningPale, color: T.warning, fontSize: '0.72rem', fontWeight: 800 }}>
                      <AlertCircle className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: '1.15rem', display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '1rem' }} className="sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '10px', background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMuted }}>
                      <Phone className="w-4 h-4" />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: T.textSub }}>{guarantor.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '10px', background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMuted }}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: T.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={guarantor.email}>
                      {guarantor.email || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '10px', background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMuted }}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: T.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {guarantor.city}, {guarantor.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '10px', background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMuted }}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: T.textSub }}>
                      {guarantor.id_type?.replace(/_/g, ' ') || 'ID'}: {guarantor.id_number || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.9rem 1.15rem', background: T.surfaceAlt, borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleEdit(guarantor)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'transparent', color: T.primary, fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    <Edit2Icon className="w-3.5 h-3.5" /> Edit
                  </button>
                  
                  {!guarantor.is_verified && (
                    <button
                      onClick={() => handleVerify(guarantor.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'transparent', color: T.success, fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Verify
                    </button>
                  )}

                  <div className="relative group">
                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'transparent', color: T.textSub, fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}>
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block rounded-xl p-2 min-w-[160px] z-20 animate-scale-in" style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: T.shadowLg }}>
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs font-medium" style={{ color: T.textSub }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <FileText className="w-3.5 h-3.5" style={{ color: T.primary }} /> 
                        {uploadingForm ? 'Uploading...' : 'Guarantor Form'}
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files?.[0] && handleUploadDocument(guarantor.id, 'form', e.target.files[0])} disabled={uploadingForm} />
                      </label>
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs font-medium" style={{ color: T.textSub }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <Shield className="w-3.5 h-3.5" style={{ color: T.primary }} /> 
                        {uploadingId ? 'Uploading...' : 'ID Document'}
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files?.[0] && handleUploadDocument(guarantor.id, 'id', e.target.files[0])} disabled={uploadingId} />
                      </label>
                    </div>
                  </div>

                  {guarantor.guarantor_form_path && (
                    <a
                      href={getGuarantorFileUrl(guarantor.guarantor_form_path) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: T.textSub, fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none' }}
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(guarantor.id, `${guarantor.first_name} ${guarantor.last_name}`)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'transparent', color: T.danger, fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isVerifyModalOpen && (
        <div
          onClick={closeVerifyModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '1.25rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px, 100%)',
              ...cardStyle,
              boxShadow: T.shadowLg,
              border: `1px solid ${T.border}`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1rem 1.1rem',
                background: `linear-gradient(135deg, ${T.successPale}, ${T.surface})`,
                borderBottom: `1px solid ${T.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '10px', background: T.successPale, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.success }}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: T.text }}>Verify guarantor</p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: T.textMuted }}>Optional: add internal verification notes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeVerifyModal}
                disabled={verifying}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: verifying ? 'not-allowed' : 'pointer',
                  color: T.textMuted,
                  display: 'inline-flex',
                  padding: '0.25rem',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div style={{ padding: '1rem 1.1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ ...labelStyle, marginBottom: 0 }}>Verification Notes</span>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={4}
                  placeholder="e.g., Confirmed ID matches records and documents are complete (optional)"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  disabled={verifying}
                />
              </div>
            </div>

            <div
              style={{
                padding: '0.95rem 1.1rem',
                borderTop: `1px solid ${T.border}`,
                background: T.surfaceAlt,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button type="button" onClick={closeVerifyModal} disabled={verifying} style={secondaryButton}>
                Cancel
              </button>
              <button type="button" onClick={confirmVerify} disabled={verifying} style={{ ...primaryButton, background: `linear-gradient(135deg, ${T.success}, ${T.primary})` }}>
                {verifying ? 'Verifying…' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Internal icons
function Edit2Icon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function BanknoteIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}
