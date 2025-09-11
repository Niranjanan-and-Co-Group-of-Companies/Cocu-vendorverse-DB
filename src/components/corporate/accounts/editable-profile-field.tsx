
'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OtpVerificationDialog } from './otp-verification-dialog';
import { updateUserContact } from '@/lib/user-service';

interface EditableProfileFieldProps {
  label: string;
  fieldType: 'email' | 'tel';
  initialValue: string;
  userId: string;
}

export function EditableProfileField({ label, fieldType, initialValue, userId }: EditableProfileFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);
  const [isOtpOpen, setIsOtpOpen] = React.useState(false);

  const handleSave = () => {
    // In a real app, you would send an OTP to the new email/phone
    // For now, we simulate this by opening the OTP dialog
    setIsOtpOpen(true);
  };

  const handleFinalUpdate = async () => {
    // This function is called after successful OTP verification
    const fieldToUpdate = fieldType === 'email' ? 'email' : 'phone';
    await updateUserContact(userId, fieldToUpdate, value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  return (
    <>
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          <Input type={fieldType} value={value} readOnly={!isEditing} onChange={(e) => setValue(e.target.value)} />
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
          ) : (
            <>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
            </>
          )}
        </div>
      </div>
      <OtpVerificationDialog
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onVerified={handleFinalUpdate}
        contactInfo={value}
      />
    </>
  );
}
