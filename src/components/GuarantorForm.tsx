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

export function GuarantorForm({ staffId, onSuccess }: GuarantorFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingForm, setUploadingForm] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [selectedGuarantor, setSelectedGuarantor] = useState<Guarantor | null>(null);
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
  const [showList, setShowList] = useState(true);

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
    const notes = prompt('Enter verification notes (optional):');
    try {
      const response = await guarantorService.verifyGuarantor(guarantorId, notes || undefined);
      if (response.success) {
        setSuccessMessage('Guarantor verified successfully');
        loadGuarantors();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify guarantor');
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
    <div className="p-4" style={{ backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        <span className="text-sm text-slate-500 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </div>
      {type === 'textarea' ? (
        <textarea
          className="input w-full"
          value={(formData[field] as string) || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          rows={3}
          required={required}
          style={{ backgroundColor: 'white' }}
        />
      ) : type === 'select' ? (
        <div className="relative">
          <select
            className="input w-full pr-10"
            value={(formData[field] as string) || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            required={required}
            style={{ backgroundColor: 'white', appearance: 'none' }}
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
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      ) : (
        <input
          type={type}
          className="input w-full"
          value={(formData[field] as string) || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          required={required}
          style={{ backgroundColor: 'white' }}
        />
      )}
    </div>
  );

  if (!showList) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {selectedGuarantor ? 'Edit Guarantor' : 'Add New Guarantor'}
          </h4>
          <button
            onClick={resetForm}
            className="btn btn-secondary"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-8">
          {successMessage && (
            <div className="bg-success-50 border-l-4 border-success-500 p-4">
              <p className="text-sm text-success-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {successMessage}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-error-50 border-l-4 border-error-500 p-4">
              <p className="text-sm text-error-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {/* Personal Information */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <User className="w-5 h-5 text-primary-600" />
              <h5 className="font-bold text-slate-800">Personal Information</h5>
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
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-primary-600" />
              <h5 className="font-bold text-slate-800">Address Information</h5>
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
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Shield className="w-5 h-5 text-primary-600" />
              <h5 className="font-bold text-slate-800">Identification Details</h5>
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
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Briefcase className="w-5 h-5 text-primary-600" />
              <h5 className="font-bold text-slate-800">Employment Information</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField label="Occupation" field="occupation" icon={Briefcase} />
              <InputField label="Employer Name" field="employer_name" icon={Briefcase} />
              <InputField label="Employer Address" field="employer_address" icon={MapPin} />
            </div>
          </section>

          {/* Guarantee Details */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <FileText className="w-5 h-5 text-primary-600" />
              <h5 className="font-bold text-slate-800">Guarantee Details (Optional)</h5>
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
              className="btn btn-secondary px-8"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-10"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <UserCheck className="w-6 h-6 text-primary-600" />
            Guarantors Information
          </h4>
          <p className="text-sm text-slate-500 mt-1">
            {guarantors.length} guarantor{guarantors.length !== 1 ? 's' : ''} on record
          </p>
        </div>
        <button
          onClick={() => setShowList(false)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Guarantor
        </button>
      </div>

      {successMessage && (
        <div className="bg-success-50 border-l-4 border-success-500 p-4">
          <p className="text-sm text-success-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {successMessage}
          </p>
        </div>
      )}

      {guarantors.length === 0 ? (
        <div className="card p-12 text-center border-dashed border-2">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-10 h-10 text-slate-300" />
          </div>
          <h5 className="text-lg font-bold text-slate-800 mb-2">No guarantors added yet</h5>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Every staff member requires verified guarantors for security and institutional compliance.</p>
          <button
            onClick={() => setShowList(false)}
            className="btn btn-primary px-8"
          >
            Add First Guarantor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {guarantors.map(guarantor => (
            <div key={guarantor.id} className="card overflow-hidden hover-lift flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold text-lg shadow-sm">
                    {guarantor.first_name[0]}{guarantor.last_name[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 leading-tight">
                      {guarantor.first_name} {guarantor.middle_name} {guarantor.last_name}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        {guarantor.relationship}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">{guarantor.occupation}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {guarantor.is_verified ? (
                    <span className="badge badge-success">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="badge badge-warning">
                      <AlertCircle className="w-3 h-3 mr-1" /> Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{guarantor.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate" title={guarantor.email}>
                      {guarantor.email || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {guarantor.city}, {guarantor.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {guarantor.id_type?.replace(/_/g, ' ') || 'ID'}: {guarantor.id_number || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleEdit(guarantor)}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    <Edit2Icon className="w-3.5 h-3.5" /> Edit
                  </button>
                  
                  {!guarantor.is_verified && (
                    <button
                      onClick={() => handleVerify(guarantor.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-success-600 hover:text-success-800 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Verify
                    </button>
                  )}

                  <div className="relative group">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-white shadow-xl border border-slate-200 rounded-xl p-2 min-w-[160px] z-20 animate-scale-in">
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-medium text-slate-700">
                        <FileText className="w-3.5 h-3.5 text-primary-500" /> 
                        {uploadingForm ? 'Uploading...' : 'Guarantor Form'}
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files?.[0] && handleUploadDocument(guarantor.id, 'form', e.target.files[0])} disabled={uploadingForm} />
                      </label>
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-medium text-slate-700">
                        <Shield className="w-3.5 h-3.5 text-primary-500" /> 
                        {uploadingId ? 'Uploading...' : 'ID Document'}
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files?.[0] && handleUploadDocument(guarantor.id, 'id', e.target.files[0])} disabled={uploadingId} />
                      </label>
                    </div>
                  </div>

                  {guarantor.guarantor_form_path && (
                    <a
                      href={`${API_ENDPOINT}${guarantor.guarantor_form_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(guarantor.id, `${guarantor.first_name} ${guarantor.last_name}`)}
                  className="flex items-center gap-1.5 text-xs font-bold text-error-500 hover:text-error-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
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
