'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/cartStore';
import { useSessionToken } from '@/hooks/useSessionToken';
import { useModal } from '@/contexts/ModalContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  ChevronRight, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowLeft, 
  Download, 
  BadgeHelp,
  Clock
} from 'lucide-react';

const MUNICIPALITIES_KANCHANPUR = [
  { name: "Bhimdatta", type: "Urban Municipality", wards: 19 },
  { name: "Bedkot", type: "Urban Municipality", wards: 10 },
  { name: "Belauri", type: "Urban Municipality", wards: 10 },
  { name: "Dodhara Chandani", type: "Urban Municipality", wards: 10 },
  { name: "Krishnapur", type: "Urban Municipality", wards: 9 },
  { name: "Punarbas", type: "Urban Municipality", wards: 11 },
  { name: "Shuklaphanta", type: "Urban Municipality", wards: 12 },
  { name: "Beldandi", type: "Rural Municipality", wards: 5 },
  { name: "Laljhadi", type: "Rural Municipality", wards: 6 }
];

interface ShippingRate {
  kanchanpur: number;
  sudurpashchim: number;
  other: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const sessionToken = useSessionToken();
  const { showModal } = useModal();
  
  const cartItems = useCart((state) => state.items);
  const cartTotal = useCart((state) => state.getTotalPrice());
  const clearCart = useCart((state) => state.clearCart);
  
  // Checkout Wizards Steps: 'address' | 'review' | 'payment'
  const [step, setStep] = useState<'address' | 'review' | 'payment'>('address');
  
  // FormData Address states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [municipality, setMunicipality] = useState('Bhimdatta');
  const [wardNo, setWardNo] = useState<number>(1);
  const [notes, setNotes] = useState('');
  
  // Custom dropdown states
  const [municipalityOpen, setMunicipalityOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);
  
  // Refs for click outside detection
  const municipalityRef = useRef<HTMLDivElement>(null);
  const wardRef = useRef<HTMLDivElement>(null);
  
  // Click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (municipalityRef.current && !municipalityRef.current.contains(event.target as Node)) {
        setMunicipalityOpen(false);
      }
      if (wardRef.current && !wardRef.current.contains(event.target as Node)) {
        setWardOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Payment Selection Selector
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'cash_on_delivery'>('cash_on_delivery');
  const [paymentTxnId, setPaymentTxnId] = useState('');
  const [qrConfig, setQrConfig] = useState<any | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // General Statuses
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // 1. Auto fill from last used address
  useEffect(() => {
    const savedAddress = localStorage.getItem('tsz_last_address');
    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress);
        Promise.resolve().then(() => {
          setCustomerName(parsed.customerName || '');
          setCustomerPhone(parsed.customerPhone || '');
          setCustomerEmail(parsed.customerEmail || '');
          setShippingAddress(parsed.shippingAddress || '');
          setMunicipality(parsed.municipality || 'Bhimdatta');
          setWardNo(parsed.wardNo || 1);
        });
      } catch (e) {
        console.error('Failed to parse previous address', e);
      }
    }
  }, []);

  // 2. Fetch QRs configuration when payment method toggles
  useEffect(() => {
    if (paymentMethod === 'cash_on_delivery') {
      Promise.resolve().then(() => {
        setQrConfig(null);
      });
      return;
    }
    const fetchQR = async () => {
      setQrLoading(true);
      try {
        const res = await fetch(`/api/payment-qr/${paymentMethod}`);
        if (res.ok) {
          const config = await res.json();
          setQrConfig(config);
        }
      } catch (err) {
        console.error('Error fetching QR config', err);
      } finally {
        setQrLoading(false);
      }
    };
    Promise.resolve().then(() => {
      fetchQR();
    });
  }, [paymentMethod]);

  // 3. Compute active shipping rates (always 0 for Kanchanpur)
  const shippingFee = 0;
  
  // Calculate discount
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(cartTotal - discountAmount + shippingFee, 0);

  // Checkout validation Step 1
  const validateAddressForm = () => {
    const errors: {[key: string]: string} = {};
    if (!customerName.trim()) errors.customerName = 'Full name is required';
    
    const phoneRegex = /^(98|97)\d{8}$/;
    if (!customerPhone.trim()) {
      errors.customerPhone = 'Phone number is required';
    } else if (!phoneRegex.test(customerPhone)) {
      errors.customerPhone = 'Valid Nepal formatting required (98XXXXXXXX or 97XXXXXXXX)';
    }

    if (customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        errors.customerEmail = 'Invalid email structure';
      }
    }

    if (!shippingAddress.trim()) errors.shippingAddress = 'Street shipping address is required';
    if (!municipality.trim()) errors.municipality = 'Municipality is required';
    if (!wardNo) errors.wardNo = 'Ward number is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 'address' && validateAddressForm()) {
      setStep('review');
    } else if (step === 'review') {
      setStep('payment');
    }
  };

  const handleBackStep = () => {
    if (step === 'review') {
      setStep('address');
    } else if (step === 'payment') {
      setStep('review');
    }
  };

  // Coupon application logic
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          subtotal: cartTotal
        })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data);
        showModal('success', 'Coupon Applied!', `Discount code applied successfully. You save Rs ${data.discountAmount.toLocaleString()}!`);
      } else {
        setCouponError(data.error || 'Failed to apply promotional code.');
        showModal('error', 'Coupon Failed', data.error || 'Failed to apply promotional code.');
      }
    } catch (err) {
      setCouponError('Network error validating discount code.');
    } finally {
      setCouponLoading(false);
    }
  };

  // Forced Blob file-download utility for QR codes
  const handleDownloadQR = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download QR code', err);
      // Fallback
      window.open(url, '_blank');
    }
  };

  // PLACE ORDER SUBMIT LOGIC
  const handlePlaceOrder = async () => {
    if (paymentMethod !== 'cash_on_delivery' && !paymentTxnId.trim()) {
      setFormErrors({ paymentTxnId: `Please enter the matching ${paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} transaction ID.` });
      return;
    }
    
    setOrderSubmitting(true);
    setFormErrors({});

    const orderPayload = {
      sessionToken,
      items: cartItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        imageUrl: item.imageUrl,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      customerName,
      customerPhone,
      customerEmail: customerEmail.trim() || undefined,
      shippingAddress,
      municipality,
      wardNo,
      paymentMethod,
      paymentTxnId: paymentMethod !== 'cash_on_delivery' ? paymentTxnId.trim() : undefined,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      notes
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      
      if (data.success) {
        // Save WooCommerce order ID to localStorage for guest order history
        if (typeof window !== 'undefined') {
          const guestOrders = localStorage.getItem('sz_guest_orders');
          let orderIds: string[] = [];
          if (guestOrders) {
            try {
              orderIds = JSON.parse(guestOrders);
            } catch (e) {
              orderIds = [];
            }
          }
          
          // Add new order ID if not already in the list (use WooCommerce orderId)
          if (data.orderId && !orderIds.includes(data.orderId)) {
            orderIds.push(data.orderId);
            localStorage.setItem('sz_guest_orders', JSON.stringify(orderIds));
          }
        }
        
        // Save last-used address for auto fill
        const addressObj = { customerName, customerPhone, customerEmail, shippingAddress, municipality, wardNo };
        localStorage.setItem('tsz_last_address', JSON.stringify(addressObj));
        
        // Clear shopping bag and redirect!
        clearCart();
        showModal('success', 'Order Placed Successfully!', `Your order ${data.orderNumber} has been confirmed. Thank you for shopping with us!`);
        setTimeout(() => {
          router.push(`/checkout/success?order_id=${data.orderId}`);
        }, 2000);
      } else {
        setFormErrors({ submit: data.error || 'The server responded with an error. Please retry.' });
        showModal('error', 'Order Failed', data.error || 'The server responded with an error. Please retry.');
      }
    } catch (e) {
      setFormErrors({ submit: 'Unable to connect with The Style Zone database.' });
      showModal('error', 'Connection Error', 'Unable to connect with The Style Zone database. Please check your internet connection and try again.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-stone-300" />
          <div>
            <h1 className="text-xl font-bold text-[#121212] font-sans">No items present</h1>
            <p className="text-xs text-stone-400 max-w-sm mt-1">Please select boutique outfits and add them to your shopping cart bag before checking out.</p>
          </div>
          <Link href="/shop" className="bg-[#FE5733] hover:bg-[#e04825] text-white rounded-[4px] text-xs font-bold px-6 py-2.5 transition-colors">
            Return to Catalogue
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10 flex-grow space-y-6">
        
        {/* Progress Tracker Stepper Header */}
        <div className="bg-white border border-stone-200 rounded-[4px] p-4 flex justify-between items-center max-w-3xl mx-auto text-xs font-bold text-stone-400">
          <div className={`flex items-center gap-1.5 ${step === 'address' ? 'text-[#FE5733]' : 'text-stone-650'}`}>
            <span className="w-5 h-5 bg-[#FE5733]/10 text-[#FE5733] rounded-full flex items-center justify-center text-[10px] font-extrabold">1</span>
            <span>Billing Address</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300" />
          <div className={`flex items-center gap-1.5 ${step === 'review' ? 'text-[#FE5733] animate-pulse' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${step === 'review' ? 'bg-[#FE5733]/10 text-[#FE5733]' : 'bg-stone-100 text-stone-400'}`}>2</span>
            <span>Review Order</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300" />
          <div className={`flex items-center gap-1.5 ${step === 'payment' ? 'text-[#FE5733] animate-pulse' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${step === 'payment' ? 'bg-[#FE5733]/10 text-[#FE5733]' : 'bg-stone-100 text-stone-400'}`}>3</span>
            <span>Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: STEP RENDERERS */}
          <div className="lg:col-span-7">
            {step === 'address' && (
              <div className="bg-white border border-black/5 rounded-[4px] p-4 md:p-6 lg:p-8 shadow-sm space-y-6 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-black/5 pb-3">
                  <MapPin className="w-5 h-5 text-stone-400" />
                  <h2 className="text-base font-black text-[#121212] uppercase tracking-wider">Shipping Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Full Name */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Customers Full Name *</label>
                    <input
                      type="text"
                      inputMode="text"
                      autoComplete="name"
                      placeholder="e.g. Bhupesh Bhatt"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full h-11 bg-stone-50 border border-black/10 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 rounded-[4px] px-4 text-xs font-medium outline-none transition-all duration-200 ease-in-out"
                    />
                    {formErrors.customerName && <p className="text-[10px] text-red-500 font-medium">{formErrors.customerName}</p>}
                  </div>

                  {/* Nepal Phone Number */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Nepal Phone Number *</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="e.g. 98XXXXXXXX"
                      maxLength={10}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full h-11 bg-stone-50 border border-black/10 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 rounded-[4px] px-4 text-xs font-medium outline-none transition-all duration-200 ease-in-out"
                    />
                    {formErrors.customerPhone && <p className="text-[10px] text-red-500 font-medium">{formErrors.customerPhone}</p>}
                  </div>

                  {/* Email address optional */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Email Address (Optional)</label>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="e.g. name@domain.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full h-11 bg-stone-50 border border-black/10 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 rounded-[4px] px-4 text-xs font-medium outline-none transition-all duration-200 ease-in-out"
                    />
                    {formErrors.customerEmail && <p className="text-[10px] text-red-500 font-medium">{formErrors.customerEmail}</p>}
                  </div>

                  {/* Street Shipping address */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Street Shipping Address *</label>
                    <input
                      type="text"
                      inputMode="text"
                      autoComplete="street-address"
                      placeholder="e.g. Gali No. 3, Main Marg, Mahendranagar"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full h-11 bg-stone-50 border border-black/10 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 rounded-[4px] px-4 text-xs font-medium outline-none transition-all duration-200 ease-in-out"
                    />
                    {formErrors.shippingAddress && <p className="text-[10px] text-red-500 font-medium">{formErrors.shippingAddress}</p>}
                  </div>

                  {/* Municipality Custom Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Municipality *</label>
                    <div className="relative" ref={municipalityRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setMunicipalityOpen(!municipalityOpen);
                          setWardOpen(false);
                        }}
                        className="w-full h-11 bg-stone-50 border border-stone-200 rounded-[4px] px-4 text-xs font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#FE5733] focus:border-[#FE5733] flex items-center justify-between"
                      >
                        {municipality || 'Select Municipality'}
                        <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${municipalityOpen ? 'rotate-90' : ''}`} />
                      </button>
                      <div className={`absolute z-10 w-full left-0 top-full mt-1 transition-all duration-200 ease-in-out ${municipalityOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                        <div 
                          className="bg-white border border-stone-200 rounded-[4px] shadow-lg max-h-48 overflow-y-auto"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          {MUNICIPALITIES_KANCHANPUR.map((muni) => (
                            <button
                              key={muni.name}
                              type="button"
                              onClick={() => {
                                setMunicipality(muni.name);
                                setWardNo(1);
                                setMunicipalityOpen(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-stone-800 hover:bg-stone-50 transition-colors"
                            >
                              {muni.name} ({muni.type})
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {formErrors.municipality && <p className="text-[10px] text-red-500 font-medium">{formErrors.municipality}</p>}
                  </div>

                  {/* Ward No. Custom Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Ward No. *</label>
                    <div className="relative" ref={wardRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setWardOpen(!wardOpen);
                          setMunicipalityOpen(false);
                        }}
                        className="w-full h-11 bg-stone-50 border border-stone-200 rounded-[4px] px-4 text-xs font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#FE5733] focus:border-[#FE5733] flex items-center justify-between"
                      >
                        {wardNo ? `Ward No. ${wardNo}` : 'Select Ward No'}
                        <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${wardOpen ? 'rotate-90' : ''}`} />
                      </button>
                      <div className={`absolute z-10 w-full left-0 top-full mt-1 transition-all duration-200 ease-in-out ${wardOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                        <div 
                          className="bg-white border border-stone-200 rounded-[4px] shadow-lg max-h-48 overflow-y-auto"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          {Array.from({length: MUNICIPALITIES_KANCHANPUR.find(m => m.name === municipality)?.wards || 1}, (_, i) => i + 1).map((ward) => (
                            <button
                              key={ward}
                              type="button"
                              onClick={() => {
                                setWardNo(ward);
                                setWardOpen(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-stone-800 hover:bg-stone-50 transition-colors"
                            >
                              Ward No. {ward}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {formErrors.wardNo && <p className="text-[10px] text-red-500 font-medium">{formErrors.wardNo}</p>}
                  </div>

                  {/* Buyer Notes */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Special Delivery Instructions / Notes</label>
                    <textarea
                      placeholder="e.g. Please call before deliver, leave at building reception if busy..."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-stone-50 border border-black/10 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 rounded-[4px] p-4 text-xs font-medium outline-none transition-all duration-200 ease-in-out"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-black/5 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="bg-[#FE5733] hover:bg-[#e04825] text-white rounded-[4px] font-black h-13 px-10 text-sm tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Next: Review Order <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="bg-white border border-stone-200 rounded-[4px] p-6 lg:p-8 shadow-sm animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
                  <button 
                    onClick={handleBackStep}
                    className="text-xs font-medium text-stone-400 hover:text-stone-600 flex items-center gap-2 transition-colors"
                    aria-label="Back to address step"
                  >
                    <ArrowLeft className="w-3 h-3" /> Edit Address
                  </button>
                  <h2 className="text-xl font-black text-[#121212] uppercase tracking-widest">Review Your Order</h2>
                </div>

                {/* Two-column layout for review */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Shipping Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Shipping Details
                    </h3>
                    <div className="bg-stone-50 border border-stone-200 rounded-[4px] p-5 space-y-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Full Name</p>
                        <p className="font-semibold text-[#121212]">{customerName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Phone</p>
                        <p className="font-semibold text-[#121212]">{customerPhone}</p>
                      </div>
                      {customerEmail && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Email</p>
                          <p className="font-medium text-[#121212]">{customerEmail}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Address</p>
                        <p className="font-medium text-[#121212]">{shippingAddress}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Municipality</p>
                          <p className="font-semibold text-[#121212]">{municipality}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Ward No.</p>
                          <p className="font-semibold text-[#121212]">{wardNo}</p>
                        </div>
                      </div>
                      {notes && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Notes</p>
                          <p className="font-medium text-[#121212] italic text-sm">{notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Order Summary */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" /> Order Summary
                    </h3>
                    <div className="bg-stone-50 border border-stone-200 rounded-[4px] p-5 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-600">Subtotal</span>
                        <span className="font-semibold text-[#121212]">Rs {cartTotal.toLocaleString()}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-sm text-green-700">
                          <span>Discount ({appliedCoupon.code})</span>
                          <span className="font-semibold">-Rs {discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-600">Shipping</span>
                        <span className="font-semibold text-[#121212]">Rs {shippingFee.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-stone-300 pt-3 flex justify-between">
                        <span className="font-bold text-[#121212]">Total</span>
                        <span className="font-bold text-[#FE5733] text-lg">Rs {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">Order Items ({cartItems.length})</h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.variantId} className="flex gap-4 p-4 bg-stone-50 border border-stone-200 rounded-[4px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl} alt={item.name} className="w-16 h-20 object-cover rounded bg-white border border-stone-200 flex-none" />
                        <div className="flex-grow min-w-0">
                          <p className="font-semibold text-[#121212] truncate text-sm">{item.name}</p>
                          <p className="text-xs text-stone-500 mt-1">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="font-bold text-[#FE5733]">Rs {(item.unitPrice * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-8 pt-6 border-t border-black/5 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="bg-[#FE5733] hover:bg-[#e04825] text-white rounded-[4px] font-black h-14 px-14 text-base tracking-wider uppercase flex items-center gap-3 transition-all cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Proceed to Payment <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white border border-stone-200 rounded-[4px] p-6 lg:p-8 shadow-sm space-y-6 animate-fade-in">
                
                {/* Back button header */}
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <button 
                    onClick={handleBackStep}
                    className="text-xs font-bold text-stone-500 hover:text-[#FE5733] flex items-center gap-1"
                    aria-label="Back to review step"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Review
                  </button>
                  <h2 className="text-sm font-black text-[#121212] uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-stone-400" /> Secure Payment
                  </h2>
                </div>

                {/* Radio selections of methods */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* eSewa */}
                  <button
                    onClick={() => setPaymentMethod('esewa')}
                    className={`p-4 border-2 rounded-[4px] text-left transition-all relative flex flex-col justify-between h-24 cursor-pointer outline-hidden ${paymentMethod === 'esewa' ? 'border-green-500 bg-green-50 shadow-md scale-[1.02]' : 'border-black/10 hover:border-black/20 hover:bg-stone-50'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold text-[#121212]">eSewa</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'esewa' ? 'bg-green-500 border-green-500 text-white' : 'border-stone-300'}`}>
                        {paymentMethod === 'esewa' && <CheckCircle2 className="w-3 h-3 fill-green-500 text-white" />}
                      </span>
                    </div>
                    {/* label */}
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-stone-400 font-medium">Scan & pay with eSewa</p>
                    </div>
                  </button>

                  {/* Khalti */}
                  <button
                    onClick={() => setPaymentMethod('khalti')}
                    className={`p-4 border-2 rounded-[4px] text-left transition-all relative flex flex-col justify-between h-24 cursor-pointer outline-hidden ${paymentMethod === 'khalti' ? 'border-purple-600 bg-purple-50 shadow-md scale-[1.02]' : 'border-black/10 hover:border-black/20 hover:bg-stone-50'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold text-[#121212]">Khalti</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'khalti' ? 'bg-purple-600 border-purple-600 text-white' : 'border-stone-300'}`}>
                        {paymentMethod === 'khalti' && <CheckCircle2 className="w-3 h-3 fill-purple-600 text-white" />}
                      </span>
                    </div>
                    {/* label */}
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-stone-400 font-medium">Scan & pay with Khalti</p>
                    </div>
                  </button>

                  {/* COD */}
                  <button
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-4 border-2 rounded-[4px] text-left transition-all relative flex flex-col justify-between h-24 cursor-pointer outline-hidden ${paymentMethod === 'cash_on_delivery' ? 'border-[#FE5733] bg-[#FE5733]/5 shadow-md scale-[1.02]' : 'border-black/10 hover:border-black/20 hover:bg-stone-50'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold text-[#121212]">Cash on Delivery</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cash_on_delivery' ? 'bg-[#FE5733] border-[#FE5733] text-white' : 'border-stone-300'}`}>
                        {paymentMethod === 'cash_on_delivery' && <CheckCircle2 className="w-3 h-3 fill-[#FE5733] text-white" />}
                      </span>
                    </div>
                    {/* label */}
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-stone-400 font-medium">Pay Rs {grandTotal.toLocaleString()} on delivery</p>
                    </div>
                  </button>
                </div>

                {/* QR PANEL CONTENT */}
                {paymentMethod !== 'cash_on_delivery' && (
                  <div className="bg-stone-50 border border-stone-200 rounded-[4px] p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* QR Code Graphic Frame */}
                    <div className="md:col-span-5 flex flex-col items-center gap-3">
                      {qrLoading ? (
                        <div className="w-48 h-64 bg-white border border-stone-200 rounded-[4px] flex flex-col items-center justify-center text-xs text-stone-400">
                          <Clock className="w-8 h-8 text-stone-300 animate-spin mb-1" />
                          <span>Generating QR config...</span>
                        </div>
                      ) : qrConfig ? (
                        <>
                          <div className="bg-white p-3 border border-stone-200 rounded-[4px] shadow-sm relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={qrConfig.qr_image_url} 
                              alt={`${paymentMethod.toUpperCase()} Pay QR`} 
                              className="w-44 h-44 object-contain rounded-lg"
                            />
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleDownloadQR(qrConfig.qr_image_url, `StyleZone-${paymentMethod}-QR.png`)}
                            className="bg-white hover:bg-stone-100 hover:text-[#FE5733] text-stone-700 border border-stone-200 font-bold rounded-full text-[10px] uppercase tracking-wider h-8 px-4 flex items-center gap-1.3 transition-all cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Code Image
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-stone-400">Config missing. Please retry.</p>
                      )}
                    </div>

                    {/* QR Payment walkthrough / steps */}
                    <div className="md:col-span-7 space-y-4">
                      {qrConfig && (
                        <div className="space-y-2 text-xs">
                          <p className="text-[10px] uppercase font-black tracking-widest text-stone-400">Account Merchant:</p>
                          <p className="text-sm font-black text-[#121212]">{qrConfig.account_name}</p>
                          {qrConfig.account_id && <p className="text-xs font-mono text-stone-500">ID Account: {qrConfig.account_id}</p>}
                          
                          <div className="border-t border-stone-200/60 pt-3.5 space-y-1.5 text-xs text-stone-600">
                            <p className="text-[10px] uppercase font-black tracking-widest text-stone-400">Scan & Pay Instructions:</p>
                            <p className="whitespace-pre-line leading-relaxed font-sans font-medium text-stone-500">{qrConfig.instructions}</p>
                          </div>
                        </div>
                      )}

                      {/* Transaction ID input field */}
                      <div className="space-y-1 pt-2 border-t border-stone-200/60">
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                          Enter your {paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} Transaction ID *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 000ABC123456"
                          value={paymentTxnId}
                          onChange={(e) => setPaymentTxnId(e.target.value)}
                          className="w-full h-11 bg-white border border-stone-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 rounded-[4px] px-4 text-xs font-mono outline-none transition-all duration-200 ease-in-out"
                          required
                        />
                        <p className="text-[10px] text-stone-400 leading-relaxed font-medium">After paying exact Rs {grandTotal.toLocaleString()}, copy the Transaction ID from payment history details statement and paste it here.</p>
                        {formErrors.paymentTxnId && <p className="text-[10px] text-red-500 font-bold">{formErrors.paymentTxnId}</p>}
                      </div>
                    </div>

                  </div>
                )}

                {/* Cash on Delivery prompt block */}
                {paymentMethod === 'cash_on_delivery' && (
                  <div className="bg-stone-50 border border-stone-200 rounded-[4px] p-6 flex gap-4 items-start font-sans">
                    <BadgeHelp className="w-6 h-6 text-[#FE5733] flex-none mt-0.5 animate-bounce" />
                    <div className="space-y-1.5 text-xs leading-relaxed text-stone-500">
                      <h4 className="text-sm font-black text-[#121212]">Cash on Delivery (COD) Rules</h4>
                      <p>No upfront transaction IDs or payments are required. Your order will be compiled instantly with status &ldquo;Confirmed&rdquo;. Please pay <strong>Rs {grandTotal.toLocaleString()}</strong> in cash directly to our delivery executive when your parcel package is handed to you in {municipality}.</p>
                    </div>
                  </div>
                )}

                {/* Place Order CTA with error indicators */}
                <div className="pt-4 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  {formErrors.submit && (
                    <p className="text-xs text-red-500 font-black">{formErrors.submit}</p>
                  )}
                  <div className="w-full flex justify-end">
                    <button
                      onClick={handlePlaceOrder}
                      disabled={orderSubmitting}
                      className="w-full md:w-auto bg-[#FE5733] hover:bg-[#e04825] text-white font-black rounded-[4px] h-14 px-16 text-base tracking-wider uppercase flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl shadow-[#FE5733]/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:transform-none"
                    >
                      {orderSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* RIGHT: ORDER SUMMARY - Show on all steps */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Promo Codes Application container */}
            <div className="bg-white border border-stone-200 rounded-[4px] p-6 shadow-sm space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-500">Promo Discount Coupon</h3>
              
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 p-3 rounded-[4px] flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-extrabold text-green-850">Code Applied: {appliedCoupon.code}</p>
                    <p className="text-[10px] text-green-400 mt-0.5 leading-relaxed">{appliedCoupon.description}</p>
                  </div>
                  <button 
                    onClick={() => setAppliedCoupon(null)}
                    className="text-[10px] font-black text-red-500 hover:underline cursor-pointer flex-none pl-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponCodeInput}
                    onChange={(e) => {
                      setCouponCodeInput(e.target.value);
                      setCouponError('');
                    }}
                    className="h-10 bg-stone-50 border border-stone-200 text-stone-800 font-bold uppercase rounded-[4px] px-3 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-[#FE5733] focus:border-[#FE5733]"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="bg-[#FE5733] hover:bg-[#e04825] text-white rounded-[4px] px-4 text-xs font-bold h-10 transition-colors cursor-pointer"
                  >
                    {couponLoading ? 'Checking...' : 'Apply Code'}
                  </button>
                </form>
              )}
              {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
            </div>

            {/* Price computations and list items */}
            <div className="bg-white border border-stone-200 rounded-[4px] p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-200">Review Bag items</h3>
              
              {/* Items scroll */}
              <div className="max-h-48 overflow-y-auto space-y-3.5 pr-1">
                {cartItems.map((item) => (
                  <div key={item.variantId} className="flex gap-3 text-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} className="w-9 h-11 object-cover rounded bg-stone-50 border border-stone-100 flex-none" />
                    <div className="flex-grow min-w-0 pr-1 justify-center py-0.5 space-y-0.3">
                      <p className="font-bold text-[#121212] truncate">{item.name}</p>
                      <p className="text-[10px] text-stone-400 font-medium">Qty: {item.quantity} | Size: {item.size} | Color: {item.color}</p>
                    </div>
                    <span className="font-bold text-[#121212] flex-none text-right">Rs {(item.unitPrice * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Price Details totals calculations */}
              <div className="border-t border-stone-200 pt-4 space-y-2.5 text-xs font-semibold text-stone-500">
                <div className="flex justify-between">
                  <span>Subtotal Amount</span>
                  <span className="text-[#121212]">Rs {cartTotal.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-red-505">
                    <span>Discount applied ({appliedCoupon.code})</span>
                    <span>-Rs {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping rates ({municipality})</span>
                  <span className="text-[#121212] font-mono">Rs {shippingFee.toLocaleString()}</span>
                </div>
                
                <div className="border-t border-stone-200 pt-3 flex justify-between text-sm text-[#121212] font-black">
                  <span>Order Total NPR</span>
                  <span className="text-[#FE5733] text-base font-black">Rs {grandTotal.toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
