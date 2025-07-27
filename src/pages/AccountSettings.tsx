import { useState, useEffect } from 'react';
import { User, Palette, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

interface AccountSettingsForm {
  // Profile Information
  fullName: string;
  email: string;
  jobTitle: string;
  company: string;
}

export function AccountSettings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<AccountSettingsForm>();

  // Load saved account settings or use user data
  useEffect(() => {
    const savedSettings = localStorage.getItem('accountSettings');
    let defaultValues: Partial<AccountSettingsForm> = {};

    if (savedSettings) {
      try {
        defaultValues = JSON.parse(savedSettings);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }

    // Fallback to user data from Google
    const finalDefaults = {
      fullName: defaultValues.fullName || user?.name || '',
      email: user?.email || '',
      jobTitle: defaultValues.jobTitle || '',
      company: defaultValues.company || '',
    };

    reset(finalDefaults);
  }, [user, reset]);

  const onSubmit = async (data: AccountSettingsForm) => {
    setIsSubmitting(true);
    try {
      // Save account settings to localStorage for now
      localStorage.setItem('accountSettings', JSON.stringify(data));
      
      alert('Account settings saved successfully!');
      reset(data); // Reset form state to mark as clean
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and personal information</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Information</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Update your personal details and professional information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        {...register('fullName', { required: 'Full name is required' })}
                        type="text"
                        id="fullName"
                        className="input-field"
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Please enter a valid email address'
                          }
                        })}
                        type="email"
                        id="email"
                        className="input-field"
                        placeholder="your.email@company.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title
                      </label>
                      <input
                        {...register('jobTitle')}
                        type="text"
                        id="jobTitle"
                        className="input-field"
                        placeholder="e.g., Senior HR Manager"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        {...register('company')}
                        type="text"
                        id="company"
                        className="input-field"
                        placeholder="e.g., TechCorp Inc."
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Application Preferences</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Customize your application experience and regional settings.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <div className="input-field bg-gray-50 text-gray-500 cursor-not-allowed flex items-center justify-between">
                        <span>Coming Soon</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">Feature in development</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Theme customization will be available soon</p>
                    </div>

                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <div className="input-field bg-gray-50 text-gray-500 cursor-not-allowed flex items-center justify-between">
                        <span>Coming Soon</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">Feature in development</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Multi-language support will be available soon</p>
                    </div>

                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <div className="input-field bg-gray-50 text-gray-500 cursor-not-allowed flex items-center justify-between">
                        <span>Coming Soon</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">Feature in development</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Timezone configuration will be available soon</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="btn-secondary"
                  disabled={isSubmitting || !isDirty}
                >
                  Reset Changes
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                  disabled={isSubmitting || !isDirty}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
