import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  validateUPI,
  validateCardNumber,
  validateCardExpiry,
  validateCVV,
  validateCardholderName,
  ValidationResult,
} from './demoPaymentValidation';

interface DemoPaymentMethodPanelProps {
  method: 'cod' | 'upi' | 'card';
  onValidationChange: (isValid: boolean) => void;
}

export default function DemoPaymentMethodPanel({
  method,
  onValidationChange,
}: DemoPaymentMethodPanelProps) {
  // UPI state
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');

  // Card state
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardErrors, setCardErrors] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  // Format expiry as MM/YY
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Validate UPI
  useEffect(() => {
    if (method === 'upi') {
      const result = validateUPI(upiId);
      setUpiError(result.error || '');
      onValidationChange(result.isValid);
    }
  }, [method, upiId, onValidationChange]);

  // Validate Card
  useEffect(() => {
    if (method === 'card') {
      const nameResult = validateCardholderName(cardholderName);
      const numberResult = validateCardNumber(cardNumber);
      const expiryResult = validateCardExpiry(expiry);
      const cvvResult = validateCVV(cvv);

      const allValid =
        nameResult.isValid &&
        numberResult.isValid &&
        expiryResult.isValid &&
        cvvResult.isValid;

      onValidationChange(allValid);
    }
  }, [method, cardholderName, cardNumber, expiry, cvv, onValidationChange]);

  // COD - always valid
  useEffect(() => {
    if (method === 'cod') {
      onValidationChange(true);
    }
  }, [method, onValidationChange]);

  if (method === 'cod') {
    return (
      <Card className="bg-accent/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Cash on Delivery</p>
            <p className="text-xs text-muted-foreground">
              Pay with cash when your order is delivered to your doorstep.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (method === 'upi') {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID *</Label>
            <Input
              id="upiId"
              type="text"
              placeholder="yourname@bank"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              onBlur={() => {
                const result = validateUPI(upiId);
                setUpiError(result.error || '');
              }}
              className={upiError ? 'border-destructive' : ''}
            />
            {upiError && (
              <p className="text-xs text-destructive">{upiError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter your UPI ID (e.g., yourname@paytm, yourname@googlepay)
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (method === 'card') {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name *</Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="Name on card"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              onBlur={() => {
                const result = validateCardholderName(cardholderName);
                setCardErrors((prev) => ({
                  ...prev,
                  cardholderName: result.error || '',
                }));
              }}
              className={cardErrors.cardholderName ? 'border-destructive' : ''}
            />
            {cardErrors.cardholderName && (
              <p className="text-xs text-destructive">
                {cardErrors.cardholderName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number *</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value);
                if (formatted.replace(/\s/g, '').length <= 19) {
                  setCardNumber(formatted);
                }
              }}
              onBlur={() => {
                const result = validateCardNumber(cardNumber);
                setCardErrors((prev) => ({
                  ...prev,
                  cardNumber: result.error || '',
                }));
              }}
              className={cardErrors.cardNumber ? 'border-destructive' : ''}
              maxLength={23}
            />
            {cardErrors.cardNumber && (
              <p className="text-xs text-destructive">{cardErrors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date *</Label>
              <Input
                id="expiry"
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => {
                  const formatted = formatExpiry(e.target.value);
                  if (formatted.length <= 5) {
                    setExpiry(formatted);
                  }
                }}
                onBlur={() => {
                  const result = validateCardExpiry(expiry);
                  setCardErrors((prev) => ({
                    ...prev,
                    expiry: result.error || '',
                  }));
                }}
                className={cardErrors.expiry ? 'border-destructive' : ''}
                maxLength={5}
              />
              {cardErrors.expiry && (
                <p className="text-xs text-destructive">{cardErrors.expiry}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                type="password"
                placeholder="123"
                value={cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    setCvv(value);
                  }
                }}
                onBlur={() => {
                  const result = validateCVV(cvv);
                  setCardErrors((prev) => ({
                    ...prev,
                    cvv: result.error || '',
                  }));
                }}
                className={cardErrors.cvv ? 'border-destructive' : ''}
                maxLength={4}
              />
              {cardErrors.cvv && (
                <p className="text-xs text-destructive">{cardErrors.cvv}</p>
              )}
            </div>
          </div>

          <Separator />
          <p className="text-xs text-muted-foreground">
            Your card information is secure and encrypted.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}
