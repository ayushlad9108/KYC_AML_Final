import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Upload,
  Camera,
  FileCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  CreditCard,
  Car,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import { DocumentType, KYCStatus } from '@/types';

const documentTypes = [
  {
    type: DocumentType.PAN,
    label: 'PAN Card',
    icon: CreditCard,
    description: 'Permanent Account Number card issued by Income Tax Department',
  },
  {
    type: DocumentType.AADHAAR,
    label: 'Aadhaar Card',
    icon: User,
    description: 'Unique identification number issued by UIDAI',
  },
  {
    type: DocumentType.DRIVERS_LICENSE,
    label: "Driver's License",
    icon: Car,
    description: 'Valid driving license issued by RTO',
  },
];

const KYCPage: React.FC = () => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedDocumentType, setSelectedDocumentType] = React.useState<DocumentType | null>(null);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [verificationStatus, setVerificationStatus] = React.useState<KYCStatus>(KYCStatus.NOT_STARTED);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setCurrentStep(3);
    }
  };

  const handleVerification = async () => {
    setIsProcessing(true);
    setVerificationStatus(KYCStatus.IN_PROGRESS);
    
    // Simulate verification process
    setTimeout(() => {
      setVerificationStatus(KYCStatus.APPROVED);
      setIsProcessing(false);
      setCurrentStep(4);
    }, 3000);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step <= currentStep
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'border-gray-300 text-gray-400'
            }`}
          >
            {step < currentStep ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{step}</span>
            )}
          </div>
          {step < 4 && (
            <div
              className={`w-16 h-0.5 ${
                step < currentStep ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Personal Information
      </h3>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="Enter your first name"
            {...register('firstName', { required: 'First name is required' })}
            error={errors.firstName?.message as string}
          />
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            {...register('lastName', { required: 'Last name is required' })}
            error={errors.lastName?.message as string}
          />
        </div>
        <Input
          label="Date of Birth"
          type="date"
          {...register('dateOfBirth', { required: 'Date of birth is required' })}
          error={errors.dateOfBirth?.message as string}
        />
        <Input
          label="Phone Number"
          placeholder="Enter your phone number"
          {...register('phone', { required: 'Phone number is required' })}
          error={errors.phone?.message as string}
        />
        <div className="flex justify-end">
          <Button onClick={() => setCurrentStep(2)}>
            Continue
          </Button>
        </div>
      </form>
    </Card>
  );

  const renderDocumentSelection = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Select Document Type
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documentTypes.map((doc) => (
          <motion.div
            key={doc.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedDocumentType(doc.type);
              setCurrentStep(3);
            }}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedDocumentType === doc.type
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
            }`}
          >
            <div className="text-center">
              <doc.icon className="w-8 h-8 mx-auto mb-3 text-primary-600 dark:text-primary-400" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {doc.label}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {doc.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );

  const renderDocumentUpload = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Upload Document
      </h3>
      
      {!uploadedFile ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Upload your {selectedDocumentType} document
          </h4>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleDocumentUpload}
            className="hidden"
            id="document-upload"
          />
          <label htmlFor="document-upload">
            <Button as="span" variant="outline">
              Choose File
            </Button>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <FileCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-300">
                Document uploaded successfully
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {uploadedFile.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Camera className="w-5 h-5 text-primary-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Next: Liveness verification required
            </span>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setUploadedFile(null)}>
              Upload Different File
            </Button>
            <Button onClick={handleVerification} loading={isProcessing}>
              Start Verification
            </Button>
          </div>
        </div>
      )}
    </Card>
  );

  const renderVerificationStatus = () => (
    <Card className="p-6 text-center">
      {verificationStatus === KYCStatus.IN_PROGRESS && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <Clock className="w-16 h-16 mx-auto text-yellow-500 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Verification in Progress
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We're analyzing your document and performing liveness detection...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
            />
          </div>
        </motion.div>
      )}

      {verificationStatus === KYCStatus.APPROVED && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Verification Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your identity has been successfully verified. You can now access all platform features.
          </p>
          <div className="space-y-2">
            <Badge variant="kyc" kycStatus={KYCStatus.APPROVED} size="lg">
              KYC Approved
            </Badge>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Confidence Score: 96%
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          KYC Verification
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your identity verification to access all platform features
        </p>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === 1 && renderPersonalInfo()}
        {currentStep === 2 && renderDocumentSelection()}
        {currentStep === 3 && renderDocumentUpload()}
        {currentStep === 4 && renderVerificationStatus()}
      </motion.div>
    </div>
  );
};

export default KYCPage;