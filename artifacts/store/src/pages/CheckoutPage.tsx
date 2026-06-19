import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/store/cartStore';
import { useSessionToken } from '@/hooks/useSessionToken';
import { useModal } from '@/contexts/ModalContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileDock from '@/components/MobileDock';
import { ChevronRight, MapPin, CreditCard, CheckCircle2, ShoppingBag, ArrowLeft, Download, BadgeHelp, Clock } from 'lucide-react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

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

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const sessionToken = useSessionToken();
  const { showModal } = useModal();

  const cartItems = useCart((state) => state.items);
  const cartTotal = useCart((state) => state.getTotalPrice());
  const clearCart = useCart((state) => state.clearCart);

  const [step, setStep] = useState<'address' | 'review' | 'payment'>('address');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [municipality, setMunicipality] = useState('Bhimdatta');
  const [wardNo, setWardNo] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [municipalityOpen, setMunicipalityOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);
  const municipalityRef = useRef<HTMLDivElement>(null);
  const wardRef = useRef<HTMLDivElement>(null);

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'cash_on_delivery'>('cash_on_delivery');
  const [paymentTxnId, setPaymentTxnId] = useState('');
  const [qrConfig, setQrConfig] = useState<any | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (municipalityRef.current && !municipalityRef.current.contains(event.target as Node)) setMunicipalityOpen(false);
      if (wardRef.current && !wardRef.current.contains(event.target as Node)) setWardOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const savedAddress = localStorage.getItem('tsz_last_address');
    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress);
        setCustomerName(parsed.customerName || '');
        setCustomerPhone(parsed.customerPhone || '');
        setCustomerEmail(parsed.customerEmail || '');
        setShippingAddress(parsed.shippingAddress || '');
        setMunicipality(parsed.municipality || 'Bhimdatta');
        setWardNo(parsed.wardNo || 1);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (paymentMethod === 'cash_on_delivery') { setQrConfig(null); return; }
    const fetchQR = async () => {
      setQrLoading(true);
      try {
        const res = await fetch(`${BASE}/api/payment-qr/${paymentMethod}`);
        if (res.ok) setQrConfig(await res.json());
      } catch {}
      finally { setQrLoading(false); }
    };
    fetchQR();
  }, [paymentMethod]);

  const shippingFee = 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(cartTotal - discountAmount + shippingFee, 0);

  const currentMunicipality = MUNICIPALITIES_KANCHANPUR.find(m => m.name === municipality) || MUNICIPALITIES_KANCHANPUR[0];

  const validateAddressForm = () => {
    const errors: {[key: string]: string} = {};
    if (!customerName.trim()) errors.customerName = 'Full name is required';
    const phoneRegex = /^(98|97)\d{8}$/;
    if (!customerPhone.trim()) errors.customerPhone = 'Phone number is required';
    else if (!phoneRegex.test(customerPhone)) errors.customerPhone = 'Valid Nepal formatting required (98XXXXXXXX)';
    if (customerEmail.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) errors.customerEmail = 'Invalid email';
    }
    if (!shippingAddress.trim()) errors.shippingAddress = 'Street address is required';
    if (!municipality.trim()) errors.municipality = 'Municipality is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 'address' && validateAddressForm()) setStep('review');
    else if (step === 'review') setStep('payment');
  };

  const handleBackStep = () => {
    if (step === 'review') setStep('address');
    else if (step === 'payment') setStep('review');
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput) return;
    setCouponLoading(true); setCouponError('');
    try {
      const res = await fetch(`${BASE}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCodeInput, cartTotal })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponCodeInput('');
      } else {
        setCouponError(data.error || 'Invalid coupon code');
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleDownloadQR = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
  };

  const handlePlaceOrder = async () => {
    const errors: {[key: string]: string} = {};
    if (paymentMethod !== 'cash_on_delivery' && !paymentTxnId.trim()) {
      errors.paymentTxnId = 'Transaction ID is required for digital payments';
    }
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setOrderSubmitting(true);
    try {
      localStorage.setItem('tsz_last_address', JSON.stringify({ customerName, customerPhone, customerEmail, shippingAddress, municipality, wardNo }));

      const res = await fetch(`${BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_token: sessionToken,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          shipping_address: shippingAddress,
          municipality,
          ward_no: wardNo,
          notes,
          payment_method: paymentMethod,
          payment_txn_id: paymentTxnId || null,
          coupon_code: appliedCoupon?.code || null,
          subtotal: cartTotal,
          discount_amount: discountAmount,
          shipping_fee: shippingFee,
          total: grandTotal,
          items: cartItems.map(item => ({
            product_id: item.productId,
            variant_id: item.variantId,
            name: item.name,
            image_url: item.imageUrl,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.quantity * item.unitPrice
          }))
        })
      });
      const data = await res.json();
      if (data.success && data.order) {
        const newOrderId = data.order.id;
        setOrderId(newOrderId);
        const existing = JSON.parse(localStorage.getItem('sz_guest_orders') || '[]');
        localStorage.setItem('sz_guest_orders', JSON.stringify([...existing, newOrderId]));
        clearCart();
        setStep('address');
        showModal('success', 'Order Placed!', `Your order #${data.order.order_number} has been placed successfully! We'll contact you on ${customerPhone}.`, 8000);
        setTimeout(() => navigate('/orders'), 2000);
      } else {
        setFormErrors({ submit: data.error || 'Failed to place order. Please try again.' });
        showModal('error', 'Order Failed', data.error || 'Failed to place order. Please try again.');
      }
    } catch {
      setFormErrors({ submit: 'Network error. Please try again.' });
      showModal('error', 'Network Error', 'Failed to place order due to network error. Please try again.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !orderId) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-[#121212] uppercase tracking-tight mb-4">Your Bag is Empty</h2>
            <p className="text-sm text-stone-500 mb-8">Add some items to your cart before checking out.</p>
            <Link href="/shop" className="bg-[#FE5733] text-white px-8 py-4 rounded-sm font-bold uppercase text-xs tracking-widest hover:bg-[#e04825] transition-colors">Browse Products</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const steps = [
    { key: 'address', label: 'Address', icon: <MapPin className="w-4 h-4" /> },
    { key: 'review', label: 'Review', icon: <ShoppingBag className="w-4 h-4" /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
  ];
  const stepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <main className="flex-grow px-4 md:px-10 py-8 md:py-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mb-8">
            <Link href="/">Home</Link><ChevronRight className="w-3 h-3" />
            <Link href="/shop">Shop</Link><ChevronRight className="w-3 h-3" />
            <span className="text-stone-500 font-bold">Checkout</span>
          </div>

          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <React.Fragment key={s.key}>
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${i <= stepIndex ? 'text-[#FE5733]' : 'text-stone-400'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${i < stepIndex ? 'bg-[#121212] border-[#121212] text-white' : i === stepIndex ? 'border-[#FE5733] text-[#FE5733]' : 'border-stone-300 text-stone-400'}`}>
                    {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
                  </div>
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < stepIndex ? 'bg-[#121212]' : 'bg-stone-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              {step === 'address' && (
                <div className="bg-white border border-stone-200 rounded-[4px] p-6 md:p-8 shadow-sm space-y-6">
                  <h2 className="text-lg font-black uppercase tracking-tight text-[#121212]">Delivery Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Full Name *</label>
                      <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full h-11 border border-stone-200 bg-stone-50 rounded-[4px] px-4 text-sm focus:outline-none focus:border-[#121212]" />
                      {formErrors.customerName && <p className="text-[10px] text-red-500">{formErrors.customerName}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Phone Number *</label>
                      <input type="tel" placeholder="98XXXXXXXX" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full h-11 border border-stone-200 bg-stone-50 rounded-[4px] px-4 text-sm font-mono focus:outline-none focus:border-[#121212]" />
                      {formErrors.customerPhone && <p className="text-[10px] text-red-500">{formErrors.customerPhone}</p>}
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Email (Optional)</label>
                      <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full h-11 border border-stone-200 bg-stone-50 rounded-[4px] px-4 text-sm focus:outline-none focus:border-[#121212]" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Street Address *</label>
                      <input type="text" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} className="w-full h-11 border border-stone-200 bg-stone-50 rounded-[4px] px-4 text-sm focus:outline-none focus:border-[#121212]" />
                      {formErrors.shippingAddress && <p className="text-[10px] text-red-500">{formErrors.shippingAddress}</p>}
                    </div>
                    <div className="space-y-1" ref={municipalityRef}>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Municipality *</label>
                      <div className="relative">
                        <button type="button" onClick={() => setMunicipalityOpen(!municipalityOpen)} className="w-full h-11 border border-stone-200 bg-stone-50 rounded-[4px] px-4 text-sm text-left flex items-center justify-between focus:outline-none focus:border-[#121212]">
                          <span>{municipality}</span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${municipalityOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {municipalityOpen && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-stone-200 rounded-[4px] shadow-xl z-50 max-h-48 overflow-y-auto">
                            {MUNICIPALITIES_KANCHANPUR.map(m => (
                              <button key={m.name} type="button" onClick={() => { setMunicipality(m.name); setWardNo(1); setMunicipalityOpen(false); }} className={`w-full text-left px-4 py-2 text-xs hover:bg-stone-50 ${municipality === m.name ? 'text-[#FE5733] font-bold' : 'text-stone-700'}`}>
                                {m.name} <span className="text-stone-400">({m.type})</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1" ref={wardRef}>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Ward Number *</label>
                      <div className="relative">
                        <button type="button" onClick={() => setWardOpen(!wardOpen)} className="w-full h-11 border border-stone-200 bg-stone-50 rounded-[4px] px-4 text-sm text-left flex items-center justify-between focus:outline-none focus:border-[#121212]">
                          <span>Ward {wardNo}</span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${wardOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {wardOpen && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-stone-200 rounded-[4px] shadow-xl z-50 max-h-48 overflow-y-auto">
                            {Array.from({ length: currentMunicipality.wards }, (_, i) => i + 1).map(w => (
                              <button key={w} type="button" onClick={() => { setWardNo(w); setWardOpen(false); }} className={`w-full text-left px-4 py-2 text-xs hover:bg-stone-50 ${wardNo === w ? 'text-[#FE5733] font-bold' : 'text-stone-700'}`}>Ward {w}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Order Notes (Optional)</label>
                      <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special delivery instructions..." className="w-full border border-stone-200 bg-stone-50 rounded-[4px] px-4 py-3 text-sm focus:outline-none focus:border-[#121212] resize-none" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={handleNextStep} className="bg-[#FE5733] text-white font-bold uppercase tracking-widest text-xs h-12 px-10 rounded-[4px] hover:bg-[#e04825] transition-colors flex items-center gap-2">
                      Continue to Review <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 'review' && (
                <div className="bg-white border border-stone-200 rounded-[4px] p-6 md:p-8 shadow-sm space-y-6">
                  <h2 className="text-lg font-black uppercase tracking-tight text-[#121212]">Review Your Order</h2>
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.variantId} className="flex gap-4 p-4 bg-stone-50 rounded-[4px] border border-stone-100">
                        <img src={item.imageUrl} alt={item.name} className="w-16 h-20 object-cover rounded bg-white border border-stone-100 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#121212]">{item.name}</p>
                          <p className="text-xs text-stone-500 mt-1">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-[#FE5733] mt-2">Rs {(item.unitPrice * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-stone-200 pt-4 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-stone-500">
                      <span>Delivery to:</span>
                      <span className="text-[#121212] text-right">{shippingAddress}, Ward {wardNo}, {municipality}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-stone-500">
                      <span>Contact:</span>
                      <span className="text-[#121212]">{customerPhone}</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <button onClick={handleBackStep} className="border border-stone-200 text-stone-600 font-bold uppercase tracking-widest text-xs h-12 px-8 rounded-[4px] hover:bg-stone-50 transition-colors flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={handleNextStep} className="bg-[#FE5733] text-white font-bold uppercase tracking-widest text-xs h-12 px-10 rounded-[4px] hover:bg-[#e04825] transition-colors flex items-center gap-2">
                      Continue to Payment <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 'payment' && (
                <div className="bg-white border border-stone-200 rounded-[4px] p-6 md:p-8 shadow-sm space-y-6">
                  <h2 className="text-lg font-black uppercase tracking-tight text-[#121212]">Payment Method</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {(['cash_on_delivery', 'esewa', 'khalti'] as const).map(method => (
                      <button key={method} onClick={() => setPaymentMethod(method)} className={`p-4 rounded-[4px] border-2 text-xs font-bold uppercase tracking-wider transition-all ${paymentMethod === method ? 'border-[#FE5733] bg-[#FE5733]/5 text-[#FE5733]' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}>
                        {method === 'cash_on_delivery' ? 'Cash on Delivery' : method === 'esewa' ? 'eSewa' : 'Khalti'}
                      </button>
                    ))}
                  </div>

                  {paymentMethod !== 'cash_on_delivery' && (
                    <div className="bg-stone-50 border border-stone-200 rounded-[4px] p-6 space-y-4">
                      {qrLoading ? (
                        <div className="flex items-center justify-center py-8 text-stone-400 text-xs gap-2"><Clock className="w-5 h-5 animate-spin" /> Generating QR...</div>
                      ) : qrConfig ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="bg-white p-3 border border-stone-200 rounded-[4px] shadow-sm">
                              <img src={qrConfig.qr_image_url} alt="Payment QR" className="w-44 h-44 object-contain rounded-lg" />
                            </div>
                            <button onClick={() => handleDownloadQR(qrConfig.qr_image_url, `StyleZone-${paymentMethod}-QR.png`)} className="text-[10px] font-bold uppercase tracking-wider bg-white border border-stone-200 hover:text-[#FE5733] text-stone-600 h-8 px-4 rounded-full flex items-center gap-1 transition-all">
                              <Download className="w-3 h-3" /> Download QR
                            </button>
                          </div>
                          <div className="space-y-3">
                            <p className="text-sm font-black text-[#121212]">{qrConfig.account_name}</p>
                            {qrConfig.account_id && <p className="text-xs font-mono text-stone-500">ID: {qrConfig.account_id}</p>}
                            <p className="text-xs text-stone-500 leading-relaxed whitespace-pre-line">{qrConfig.instructions}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-stone-400 text-center py-4">QR config unavailable. Please try again.</p>
                      )}
                      <div className="space-y-1 border-t border-stone-200 pt-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-600">Transaction ID *</label>
                        <input type="text" placeholder="e.g. 000ABC123456" value={paymentTxnId} onChange={e => setPaymentTxnId(e.target.value)} className="w-full h-11 border border-stone-200 bg-white rounded-[4px] px-4 text-xs font-mono focus:outline-none focus:border-[#121212]" />
                        {formErrors.paymentTxnId && <p className="text-[10px] text-red-500">{formErrors.paymentTxnId}</p>}
                        <p className="text-[10px] text-stone-400">After paying Rs {grandTotal.toLocaleString()}, paste the Transaction ID from your payment history.</p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cash_on_delivery' && (
                    <div className="bg-stone-50 border border-stone-200 rounded-[4px] p-6 flex gap-4 items-start">
                      <BadgeHelp className="w-6 h-6 text-[#FE5733] flex-none mt-0.5 animate-bounce" />
                      <div className="space-y-1 text-xs text-stone-500 leading-relaxed">
                        <h4 className="text-sm font-black text-[#121212]">Cash on Delivery (COD)</h4>
                        <p>No upfront payment required. Pay <strong>Rs {grandTotal.toLocaleString()}</strong> in cash when your parcel is delivered to {municipality}.</p>
                      </div>
                    </div>
                  )}

                  {formErrors.submit && <p className="text-xs text-red-500 font-bold">{formErrors.submit}</p>}

                  <div className="flex justify-between pt-2">
                    <button onClick={handleBackStep} className="border border-stone-200 text-stone-600 font-bold uppercase tracking-widest text-xs h-12 px-8 rounded-[4px] hover:bg-stone-50 transition-colors flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={handlePlaceOrder} disabled={orderSubmitting} className="bg-[#FE5733] hover:bg-[#e04825] text-white font-black rounded-[4px] h-14 px-12 text-sm tracking-wider uppercase flex items-center gap-3 transition-all shadow-xl shadow-[#FE5733]/20 disabled:opacity-50 disabled:cursor-not-allowed">
                      {orderSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-stone-200 rounded-[4px] p-6 shadow-sm space-y-3.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-500">Promo Discount Coupon</h3>
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-[4px] flex items-center justify-between">
                    <div className="text-xs">
                      <p className="font-extrabold text-green-800">Code Applied: {appliedCoupon.code}</p>
                      <p className="text-[10px] text-green-600 mt-0.5">{appliedCoupon.description}</p>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} className="text-[10px] font-black text-red-500 hover:underline pl-2">Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input type="text" placeholder="e.g. WELCOME10" value={couponCodeInput} onChange={e => { setCouponCodeInput(e.target.value); setCouponError(''); }} className="h-10 bg-stone-50 border border-stone-200 text-stone-800 font-bold uppercase rounded-[4px] px-3 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-[#FE5733]" />
                    <button type="submit" disabled={couponLoading} className="bg-[#FE5733] hover:bg-[#e04825] text-white rounded-[4px] px-4 text-xs font-bold h-10 transition-colors">{couponLoading ? '...' : 'Apply'}</button>
                  </form>
                )}
                {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
              </div>

              <div className="bg-white border border-stone-200 rounded-[4px] p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-200">Order Summary</h3>
                <div className="max-h-48 overflow-y-auto space-y-3">
                  {cartItems.map(item => (
                    <div key={item.variantId} className="flex gap-3 text-xs">
                      <img src={item.imageUrl} alt={item.name} className="w-9 h-11 object-cover rounded bg-stone-50 border border-stone-100 shrink-0" />
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-[#121212] truncate">{item.name}</p>
                        <p className="text-[10px] text-stone-400">Qty: {item.quantity} | {item.size} | {item.color}</p>
                      </div>
                      <span className="font-bold text-[#121212] flex-none">Rs {(item.unitPrice * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-200 pt-4 space-y-2.5 text-xs font-semibold text-stone-500">
                  <div className="flex justify-between"><span>Subtotal</span><span className="text-[#121212]">Rs {cartTotal.toLocaleString()}</span></div>
                  {appliedCoupon && <div className="flex justify-between text-green-600"><span>Discount ({appliedCoupon.code})</span><span>-Rs {discountAmount.toLocaleString()}</span></div>}
                  <div className="flex justify-between"><span>Shipping</span><span className="text-[#121212] font-mono">Free</span></div>
                  <div className="border-t border-stone-200 pt-3 flex justify-between text-sm text-[#121212] font-black">
                    <span>Total</span>
                    <span className="text-[#FE5733] text-base font-black">Rs {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileDock />
    </div>
  );
}
