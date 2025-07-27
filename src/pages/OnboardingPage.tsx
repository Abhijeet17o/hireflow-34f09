import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User, CheckCircle, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingForm {
  fullName: string;
  jobTitle: string;
  company: string;
  companySize: string;
  industry: string;
  phone?: string;
}

export function OnboardingPage() {
  const { user, completeOnboarding, needsOnboarding } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Redirect to landing if onboarding is already completed
  if (!needsOnboarding) {
    return <Navigate to="/landing" replace />;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OnboardingForm>({
    defaultValues: {
      fullName: user?.name || '',
      jobTitle: '',
      company: '',
      companySize: '',
      industry: '',
      phone: '',
    }
  });

  const onSubmit = async (data: OnboardingForm) => {
    setIsSubmitting(true);
    try {
      // Save onboarding data
      const onboardingData = {
        ...data,
        email: user?.email,
        profileCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('accountSettings', JSON.stringify(onboardingData));
      
      // Update auth context to mark onboarding as completed
      completeOnboarding();
      
      // Redirect to landing page which will handle the final redirect
      window.location.href = '/landing';
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const watchedFields = watch();
  const step1Valid = watchedFields.fullName && watchedFields.jobTitle && watchedFields.company;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to HireFlow!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Let's set up your profile to get started
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep >= 1 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
            }`}>
              {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
            </div>
            <span className="ml-2 text-sm font-medium">Profile Info</span>
          </div>
          
          <ArrowRight className="h-4 w-4 text-gray-400" />
          
          <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep >= 2 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
            }`}>
              {currentStep > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
            </div>
            <span className="ml-2 text-sm font-medium">Company Details</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Profile Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-600 mt-1">Tell us about yourself</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('fullName', { required: 'Full name is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">From your Google account</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    {...register('jobTitle', { required: 'Job title is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g. HR Manager, Talent Acquisition Specialist"
                  />
                  {errors.jobTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    {...register('company', { required: 'Company name is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your company name"
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!step1Valid}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Company Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}

            {/* Step 2: Company Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
                  <p className="text-sm text-gray-600 mt-1">Help us customize your experience</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size *
                  </label>
                  <select
                    {...register('companySize', { required: 'Company size is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                  {errors.companySize && (
                    <p className="mt-1 text-sm text-red-600">{errors.companySize.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <select
                    {...register('industry', { required: 'Industry is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="consulting">Consulting</option>
                    <option value="media">Media & Marketing</option>
                    <option value="nonprofit">Non-profit</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.industry && (
                    <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Setting up...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
