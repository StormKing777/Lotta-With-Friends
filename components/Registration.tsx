import React, { useState } from 'react';
import { UserProfile } from '../types';

interface RegistrationProps {
  onRegister: (profile: UserProfile) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onRegister }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    legalName: '',
    email: '',
    dateOfBirth: '',
    address: '',
    ssnLast4: '',
    idUpload: null as File | null,
    termsAccepted: false
  });
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Legal Check
    if (calculateAge(formData.dateOfBirth) < 18) {
      alert("COMPLIANCE ERROR: You must be 18 years or older to participate in games of chance.");
      return;
    }

    setIsVerifying(true);
    // Simulate Identity Verification API call (e.g., Stripe Identity / Jumio)
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsVerifying(false);

    const newProfile: UserProfile = {
      id: crypto.randomUUID(),
      legalName: formData.legalName,
      email: formData.email,
      dateOfBirth: formData.dateOfBirth,
      ssnLast4: formData.ssnLast4,
      address: formData.address,
      isVerified: true
    };

    onRegister(newProfile);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full flex flex-col md:flex-row">
        {/* Left Side Info */}
        <div className="bg-blue-600 p-8 text-white md:w-2/5 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4">Join Social Lotto</h1>
            <p className="text-blue-100 text-sm mb-6">
              Create your secure profile to join community pools. We require identity verification to ensure legal compliance and secure payouts.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <span className="text-xs font-medium">Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="bg-blue-500 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg></div>
                 <span className="text-xs font-medium">Automated ID Verification</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="bg-blue-500 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg></div>
                 <span className="text-xs font-medium">Instant Payouts</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-blue-200 mt-8">
            Verified by SecureID™ • FDIC Insured Banking Integration
          </div>
        </div>

        {/* Form Side */}
        <div className="p-8 md:w-3/5 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Verification Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Legal First & Last Name</label>
                  <input required name="legalName" onChange={handleChange} className="w-full border p-2 rounded text-sm focus:border-blue-500 outline-none" placeholder="John Doe" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Date of Birth</label>
                  <input required name="dateOfBirth" type="date" onChange={handleChange} className="w-full border p-2 rounded text-sm focus:border-blue-500 outline-none" />
               </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Legal Residence</label>
              <input required name="address" onChange={handleChange} className="w-full border p-2 rounded text-sm focus:border-blue-500 outline-none" placeholder="123 Street, City, State, Zip" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">SSN (Last 4 Digits)</label>
                  <input required name="ssnLast4" maxLength={4} onChange={handleChange} className="w-full border p-2 rounded text-sm focus:border-blue-500 outline-none tracking-widest" placeholder="XXXX" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
                  <input required name="email" type="email" onChange={handleChange} className="w-full border p-2 rounded text-sm focus:border-blue-500 outline-none" placeholder="john@example.com" />
               </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" name="termsAccepted" required className="mt-1" onChange={handleChange} />
                    <span className="text-xs text-gray-500">
                        I certify that I am 18 years of age or older. I consent to the electronic verification of my identity. I agree to the <a href="#" className="text-blue-600 underline">Terms of Service</a> and <a href="#" className="text-blue-600 underline">Privacy Policy</a> related to real-money gaming compliance.
                    </span>
                </label>
            </div>

            <button 
                type="submit" 
                disabled={isVerifying}
                className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all mt-4 flex items-center justify-center gap-2 ${isVerifying ? 'bg-gray-400 cursor-wait' : 'bg-green-600 hover:bg-green-700'}`}
            >
                {isVerifying ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying Identity...
                    </>
                ) : 'Complete Verification & Join'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;