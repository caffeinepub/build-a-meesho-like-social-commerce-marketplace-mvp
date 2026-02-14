import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, Banknote } from 'lucide-react';
import DemoPaymentMethodPanel from './DemoPaymentMethodPanel';
import DemoPaymentDisclaimer from './DemoPaymentDisclaimer';

interface DemoPaymentSectionProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function DemoPaymentSection({
  paymentMethod,
  onPaymentMethodChange,
  onValidationChange,
}: DemoPaymentSectionProps) {
  return (
    <div className="space-y-4">
      <DemoPaymentDisclaimer />

      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <div
              className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                paymentMethod === 'cod'
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-accent'
              }`}
              onClick={() => onPaymentMethodChange('cod')}
            >
              <RadioGroupItem value="cod" id="cod" />
              <Banknote className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="cod" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-semibold">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Pay when you receive your order
                  </p>
                </div>
              </Label>
            </div>

            <div
              className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                paymentMethod === 'upi'
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-accent'
              }`}
              onClick={() => onPaymentMethodChange('upi')}
            >
              <RadioGroupItem value="upi" id="upi" />
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="upi" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-semibold">UPI</p>
                  <p className="text-sm text-muted-foreground">
                    Pay using UPI apps (Demo)
                  </p>
                </div>
              </Label>
            </div>

            <div
              className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                paymentMethod === 'card'
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-accent'
              }`}
              onClick={() => onPaymentMethodChange('card')}
            >
              <RadioGroupItem value="card" id="card" />
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="card" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-semibold">Credit/Debit Card</p>
                  <p className="text-sm text-muted-foreground">
                    Pay using your card (Demo)
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {paymentMethod && (
        <DemoPaymentMethodPanel
          method={paymentMethod as 'cod' | 'upi' | 'card'}
          onValidationChange={onValidationChange}
        />
      )}
    </div>
  );
}
