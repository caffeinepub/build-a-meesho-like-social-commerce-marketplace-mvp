import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '@/utils/currency';
import RequireAuth from '@/components/auth/RequireAuth';
import DemoPaymentSection from '@/components/checkout/DemoPaymentSection';
import { simulatePaymentProcessing } from '@/components/checkout/demoPaymentProcessing';
import {
  generateDemoTransactionId,
  storeDemoTransactionId,
} from '@/components/checkout/demoPaymentReference';

interface AddressData {
  fullName: string;
  mobile: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { cartItems, subtotal } = useCart();
  const checkout = useCheckout();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [addressData, setAddressData] = useState<AddressData>({
    fullName: '',
    mobile: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
  });
  const [addressSaved, setAddressSaved] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isPaymentValid, setIsPaymentValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddressChange = (field: keyof AddressData, value: string) => {
    setAddressData((prev) => ({ ...prev, [field]: value }));
    setAddressSaved(false);
  };

  const validateAddress = (): boolean => {
    if (!addressData.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!addressData.mobile.trim() || addressData.mobile.length < 10) {
      toast.error('Please enter a valid mobile number');
      return false;
    }
    if (!addressData.pincode.trim() || addressData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    if (!addressData.addressLine1.trim()) {
      toast.error('Please enter address line 1');
      return false;
    }
    if (!addressData.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!addressData.state.trim()) {
      toast.error('Please enter your state');
      return false;
    }
    return true;
  };

  const handleSaveAddress = () => {
    if (validateAddress()) {
      setAddressSaved(true);
      sessionStorage.setItem('checkoutAddress', JSON.stringify(addressData));
      toast.success('Address saved successfully');
    }
  };

  const handleContinueToReview = () => {
    if (!addressSaved) {
      toast.error('Please save your address before continuing');
      return;
    }
    setStep(2);
  };

  const handleContinueToPayment = () => {
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (!isPaymentValid) {
      toast.error('Please complete the payment details');
      return;
    }

    if (!identity) {
      toast.error('Please sign in to place an order');
      return;
    }

    if (isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);

      // Simulate payment processing
      await simulatePaymentProcessing(2000);

      const addressString = `${addressData.fullName}, ${addressData.mobile}\n${addressData.addressLine1}${addressData.addressLine2 ? ', ' + addressData.addressLine2 : ''}\n${addressData.landmark ? addressData.landmark + ', ' : ''}${addressData.city}, ${addressData.state} - ${addressData.pincode}`;

      const orderId = await checkout.mutateAsync({
        address: addressString,
        paymentMethod,
      });

      // Generate and store transaction ID for non-COD methods
      if (paymentMethod !== 'cod') {
        const transactionId = generateDemoTransactionId();
        storeDemoTransactionId(orderId.toString(), transactionId);
      }

      // Clear saved address
      sessionStorage.removeItem('checkoutAddress');

      toast.success('Order placed successfully!');
      navigate({
        to: '/order-confirmation/$orderId',
        params: { orderId: orderId.toString() },
      });
    } catch (error: any) {
      setIsProcessing(false);
      // Display backend error message which includes stock information
      toast.error(error.message || 'Failed to place order');
    }
  };

  const formatAddress = () => {
    return (
      <div className="text-sm space-y-1">
        <p className="font-semibold">{addressData.fullName}</p>
        <p>{addressData.mobile}</p>
        <p>{addressData.addressLine1}</p>
        {addressData.addressLine2 && <p>{addressData.addressLine2}</p>}
        {addressData.landmark && <p>Landmark: {addressData.landmark}</p>}
        <p>
          {addressData.city}, {addressData.state} - {addressData.pincode}
        </p>
      </div>
    );
  };

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
              </div>
              <span className="text-sm font-medium">Address</span>
            </div>
            <div
              className={`h-0.5 w-16 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}
            />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
              </div>
              <span className="text-sm font-medium">Review</span>
            </div>
            <div
              className={`h-0.5 w-16 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}
            />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                3
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>

        {/* Step 1: Address */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={addressData.fullName}
                    onChange={(e) => handleAddressChange('fullName', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={addressData.mobile}
                    onChange={(e) => handleAddressChange('mobile', e.target.value)}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={addressData.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={addressData.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  value={addressData.addressLine1}
                  onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                  placeholder="House No., Building Name"
                />
              </div>

              <div>
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input
                  id="addressLine2"
                  value={addressData.addressLine2}
                  onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                  placeholder="Road Name, Area, Colony"
                />
              </div>

              <div>
                <Label htmlFor="landmark">Landmark (Optional)</Label>
                <Input
                  id="landmark"
                  value={addressData.landmark}
                  onChange={(e) => handleAddressChange('landmark', e.target.value)}
                  placeholder="Near..."
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={addressData.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  placeholder="State"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveAddress} variant="default">
                  Save Address
                </Button>
                {addressSaved && (
                  <Button onClick={handleContinueToReview} variant="default">
                    Continue to Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Review Order */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                {formatAddress()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="mt-4"
                >
                  Edit Address
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product.id.toString()} className="flex gap-4">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity.toString()}
                      </p>
                      <p className="font-bold text-primary">
                        {formatINR(item.product.price)}
                      </p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatINR(subtotal)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleContinueToPayment}>
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <DemoPaymentSection
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                  onValidationChange={setIsPaymentValid}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-primary">FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatINR(subtotal)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} disabled={isProcessing}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handlePlaceOrder}
                disabled={!isPaymentValid || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
