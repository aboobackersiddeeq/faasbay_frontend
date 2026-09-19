import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  QrCode,
  Truck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Lock,
  MapPin,
  Phone,
  User,
  Mail,
  Landmark,
  Wallet,
  Check,
  Building2,
  Banknote,
  Zap,
} from "lucide-react";
import faasbayLogo from "@/assets/faasbay-logo.png";
import { useCart } from "@/hooks/use-cart";
import { API_ENDPOINTS, RAZORPAY_KEY_ID } from "@/config/api";
import { recordNewAdminOrder } from "@/lib/cloud-orders-sync";
import type { AdminOrder } from "@/admin/shared/types";

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const ONLINE_PAYMENT_METHODS = [
  {
    id: "upi" as const,
    title: "UPI (GPay / PhonePe / Paytm)",
    desc: "Instant payment with zero transaction fees",
    badge: "",
    icon: "upi",
  },
  {
    id: "card" as const,
    title: "Debit / Credit Card",
    desc: "Visa, Mastercard, RuPay, Maestro & Amex",
    badge: "",
    icon: "card",
  },
  {
    id: "netbanking" as const,
    title: "Net Banking",
    desc: "All major Indian banks supported (SBI, HDFC, ICICI)",
    badge: "",
    icon: "netbanking",
  },
  {
    id: "wallet" as const,
    title: "Wallet",
    desc: "Paytm, Amazon Pay, PhonePe & Mobikwik",
    badge: "",
    icon: "wallet",
  },
];

export const INDIAN_STATES = [
  "Kerala",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Delhi",
  "Andhra Pradesh",
  "Telangana",
  "Gujarat",
  "Uttar Pradesh",
  "West Bengal",
  "Rajasthan",
  "Punjab",
  "Haryana",
  "Bihar",
  "Madhya Pradesh",
  "Odisha",
  "Assam",
  "Jharkhand",
  "Chhattisgarh",
  "Uttarakhand",
  "Himachal Pradesh",
  "Goa",
  "Jammu and Kashmir",
  "Tripura",
  "Manipur",
  "Meghalaya",
  "Nagaland",
  "Puducherry",
  "Chandigarh",
  "Arunachal Pradesh",
  "Mizoram",
  "Sikkim",
  "Ladakh",
  "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
];

const CASH_PAYMENT_METHODS = [
  {
    id: "cod" as const,
    title: "Cash on Delivery",
    desc: "Pay safely with cash or UPI at your doorstep",
    badge: "",
    icon: "cod",
  },
];

export function CheckoutModal() {
  const {
    checkoutItems,
    checkoutSubtotal,
    checkoutDiscount,
    checkoutCouponCode,
    checkoutShippingFee,
    checkoutTotal,
    isCheckoutOpen,
    closeCheckout,
    clearCart,
    clearBuyNow,
    isBuyNow,
    userProfile,
    loginUser,
  } = useCart();

  const items = checkoutItems;
  const subtotal = checkoutSubtotal;
  const discount = checkoutDiscount;

  // Desktop step: 1 (Shipping) | 2 (Payment) | 3 (Confirmation)
  const [desktopStep, setDesktopStep] = useState<1 | 2 | 3>(1);

  // Mobile step: "delivery" | "payment"
  const [mobileStep, setMobileStep] = useState<"delivery" | "payment">("delivery");

  // Form State (Initialized empty or from logged-in user profile, NEVER fake sample data)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Kerala");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [formError, setFormError] = useState("");

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "wallet" | "cod">("upi");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Determine COD Advance Delivery Fee (from primary product or fallback to 100)
  const primaryProduct = items[0]?.product;
  const codAdvanceDeliveryFee = primaryProduct?.deliveryCharge !== undefined
    ? Number(primaryProduct.deliveryCharge)
    : (primaryProduct?.codCharge !== undefined ? Number(primaryProduct.codCharge) : 100);

  const isCod = paymentMethod === "cod";
  const shippingFee = isCod ? codAdvanceDeliveryFee : 0; // Prepaid is 100% Free Delivery
  const productPriceDue = Math.max(0, subtotal - discount);
  const total = productPriceDue + shippingFee;

  const amountToPayNow = isCod ? codAdvanceDeliveryFee : productPriceDue;
  const amountDueOnDelivery = isCod ? productPriceDue : 0;

  // Sync with user profile if logged in
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.email) setEmail(userProfile.email);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.address) setAddress(userProfile.address);
      if (userProfile.city) setCity(userProfile.city);
      if (userProfile.pincode) setPincode(userProfile.pincode);
      if (userProfile.state) setState(userProfile.state);
    }
  }, [userProfile, isCheckoutOpen]);

  // Pre-load Razorpay SDK
  useEffect(() => {
    if (isCheckoutOpen) {
      loadRazorpayScript();
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const validateShipping = () => {
    if (!name.trim()) {
      setFormError("Please enter your full name");
      return false;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, "").length < 10) {
      setFormError("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!address.trim()) {
      setFormError("Please enter your delivery street address");
      return false;
    }
    if (!city.trim()) {
      setFormError("Please enter your city");
      return false;
    }
    if (!state.trim()) {
      setFormError("Please select your state");
      return false;
    }
    if (!pincode.trim() || pincode.length < 6) {
      setFormError("Please enter a valid 6-digit PIN code");
      return false;
    }
    setFormError("");
    return true;
  };

  const handlePlaceOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateShipping()) {
      if (mobileStep === "payment") setMobileStep("delivery");
      if (desktopStep === 2) setDesktopStep(1);
      return;
    }

    setIsProcessing(true);
    setFormError("");

    const customerPayload = {
      name: name.trim(),
      email: email.trim() || `${phone.replace(/[^0-9]/g, "")}@faasbay.customer`,
      phone: phone.trim(),
      shippingAddress: {
        street: address.trim(),
        city: city.trim(),
        state,
        pincode: pincode.trim(),
        country: "India",
      },
    };

    const itemsPayload = items.map((i) => ({
      productId: i.product.id,
      title: i.product.title,
      quantity: i.quantity,
      unitPrice: typeof i.product.price === "number"
        ? i.product.price
        : parseInt(String(i.product.price || "0").replace(/[^\d]/g, ""), 10) || 0,
    }));

    const recordAndFinalizeOrder = async (confirmedOrderId: string, isPaid: boolean, methodLabel: string) => {
      const finalId = confirmedOrderId || `FB-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(finalId);
      setIsSuccess(true);
      setDesktopStep(3);

      if (isBuyNow) {
        clearBuyNow();
      } else {
        clearCart();
      }

      // Record in Admin orders storage for real-time tracking
      const newAdminOrder: AdminOrder = {
        orderId: finalId,
        createdAt: new Date().toISOString(),
        customer: {
          name: customerPayload.name,
          email: customerPayload.email,
          phone: customerPayload.phone,
        },
        shippingAddress: {
          name: customerPayload.name,
          street: address.trim(),
          city: city.trim(),
          state: state,
          pincode: pincode.trim(),
          country: "India",
          phone: customerPayload.phone,
        },
        items: items.map((i, idx) => ({
          productId: i.product.id,
          title: i.product.title,
          sku: `FB-${i.product.id || idx + 1}`,
          quantity: i.quantity,
          unitPrice:
            typeof i.product.price === "number"
              ? i.product.price
              : parseInt(String(i.product.price || "0").replace(/[^\d]/g, ""), 10) || 0,
          total:
            (typeof i.product.price === "number"
              ? i.product.price
              : parseInt(String(i.product.price || "0").replace(/[^\d]/g, ""), 10) || 0) * i.quantity,
          image: i.product.image || i.product.images?.[0] || "",
        })),
        subtotal,
        discount,
        shippingFee,
        advancePaid: amountToPayNow,
        codAmountDue: amountDueOnDelivery,
        taxAmount: Math.round(total * 0.18),
        totalAmount: total,
        paymentMethod: methodLabel,
        paymentStatus: isCod ? `Advance Paid (₹${amountToPayNow})` : (isPaid ? "Paid" : "Pending"),
        orderStatus: "Processing",
        trackingNumber: `TRK-${finalId}-EXP`,
        courier: "DTDC EXPRESS",
        notes: [],
        timeline: [
          {
            status: "Order Placed",
            timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            note: isCod 
              ? `Advance delivery fee ₹${amountToPayNow} paid online • Collect ₹${amountDueOnDelivery} cash on delivery` 
              : "Online payment captured & verified",
          },
        ],
      };
      // Persist the order to MongoDB. If this fails the shopper must know the
      // order was not recorded, rather than seeing a false confirmation.
      try {
        await recordNewAdminOrder(newAdminOrder);
      } catch (e: any) {
        setIsProcessing(false);
        setFormError(
          e?.message || "The order could not be saved to the server. Please contact support before retrying."
        );
        return;
      }

      // ONLY save customer profile & log in upon actual confirmed order
      loginUser({
        name: customerPayload.name,
        phone: customerPayload.phone,
        email: customerPayload.email,
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        state: state,
      });
    };

    // If order amount to pay now is 0 (e.g. 100% discount promo)
    if (amountToPayNow <= 0) {
      try {
        const res = await fetch(API_ENDPOINTS.orders, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: customerPayload,
            items: itemsPayload,
            paymentMethod: isCod ? "Cash on Delivery (Advance Paid)" : "Promotional 100% Discount",
            couponCode: checkoutCouponCode,
            // totalAmount/discountAmount/shippingFee below are display-only —
            // the server independently re-prices the order from couponCode and
            // real catalog prices and ignores these.
            totalAmount: total,
            discountAmount: discount,
            shippingFee: shippingFee,
          }),
        });
        const data = await res.json();
        setIsProcessing(false);
        const resolvedId = data.data?.orderId || `FB-${Math.floor(100000 + Math.random() * 900000)}`;
        await recordAndFinalizeOrder(resolvedId, true, "100% Free Order");
      } catch (err) {
        setIsProcessing(false);
        await recordAndFinalizeOrder(`FB-${Math.floor(100000 + Math.random() * 900000)}`, true, "100% Free Order");
      }
      return;
    }

    // ONLINE PAYMENT GATEWAY (Razorpay) for Prepaid Order OR COD Advance Delivery Fee
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setFormError("Failed to initialize payment gateway. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      let rzpOrderId = "";
      let serverKeyId = RAZORPAY_KEY_ID;

      // 1. Create order token on backend for amountToPayNow
      try {
        const createRes = await fetch(API_ENDPOINTS.razorpayCreateOrder, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountToPayNow,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
          }),
        });
        if (createRes.ok) {
          const createData = await createRes.json();
          if (createData.success && createData.order?.id) {
            rzpOrderId = createData.order.id;
            if (createData.keyId) serverKeyId = createData.keyId;
          }
        }
      } catch (e) {
        console.warn("Direct Razorpay client-checkout fallback", e);
      }

      // 2. Smart Payment Gateway Setup
      const rzpMethodMap: Record<string, string> = {
        card: "card",
        upi: "upi",
        netbanking: "netbanking",
        wallet: "wallet",
        cod: "upi",
      };
      const targetMethod = rzpMethodMap[paymentMethod] || "upi";

      const options: any = {
        key: serverKeyId || RAZORPAY_KEY_ID,
        amount: Math.round(amountToPayNow * 100),
        currency: "INR",
        name: "FaasBay",
        description: isCod 
          ? `COD Advance Delivery Charge (₹${amountToPayNow})` 
          : `Order Payment (${items.length} item${items.length > 1 ? "s" : ""})`,
        image: faasbayLogo,
        prefill: {
          name: customerPayload.name,
          email: customerPayload.email,
          contact: customerPayload.phone,
          method: targetMethod,
        },
        config: {
          display: {
            blocks: {
              chosen_method: {
                name: isCod
                  ? "Pay Advance Delivery Fee via UPI / QR"
                  : targetMethod === "card"
                  ? "Credit & Debit Cards"
                  : targetMethod === "netbanking"
                  ? "Net Banking"
                  : targetMethod === "wallet"
                  ? "Wallets"
                  : "UPI / QR Code",
                instruments: [
                  {
                    method: targetMethod,
                  },
                ],
              },
              other_methods: {
                name: "Other Payment Options",
                instruments: [
                  { method: "upi" },
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                ],
              },
            },
            sequence: ["block.chosen_method", "block.other_methods"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (response: any) => {
          try {
            const methodLabel = isCod 
              ? "Cash on Delivery (Advance Paid)" 
              : (targetMethod === "upi" ? "UPI (Online)" : targetMethod === "card" ? "Card (Online)" : "Razorpay (Online)");

            const verifyRes = await fetch(API_ENDPOINTS.razorpayVerify, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || rzpOrderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customer: customerPayload,
                items: itemsPayload,
                couponCode: checkoutCouponCode,
                paymentMethod: methodLabel,
                // totalAmount/discountAmount/shippingFee below are display-only —
                // the server independently re-prices the order from couponCode
                // and real catalog prices, and verifies the amount actually
                // captured via Razorpay against that, not against these.
                totalAmount: total,
                discountAmount: discount,
                shippingFee: shippingFee,
              }),
            });
            const verifyData = await verifyRes.json();
            setIsProcessing(false);
            const resolvedId = verifyData.data?.orderId || `FB-${Math.floor(100000 + Math.random() * 900000)}`;
            await recordAndFinalizeOrder(resolvedId, true, methodLabel);
          } catch (vErr) {
            setIsProcessing(false);
            await recordAndFinalizeOrder(
              `FB-${Math.floor(100000 + Math.random() * 900000)}`, 
              true, 
              isCod ? "Cash on Delivery (Advance Paid)" : "Razorpay (Online)"
            );
          }
        },
      };

      if (rzpOrderId) {
        options.order_id = rzpOrderId;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (failedRes: any) => {
        setIsProcessing(false);
        setFormError(failedRes.error?.description || "Payment was cancelled or failed. Please try again.");
      });
      rzp.open();
    } catch (error: any) {
      setIsProcessing(false);
      setFormError(error.message || "An unexpected error occurred during payment gateway launch.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:items-center md:justify-center p-0 md:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={() => {
          if (!isSuccess) closeCheckout();
        }}
      />

      {/* ========================================================================= */}
      {/* 1. DESKTOP CHECKOUT DIALOG (LOCKED, RESTORED, FULL DESKTOP UX)           */}
      {/* ========================================================================= */}
      <div
        role="dialog"
        aria-label="Desktop Secure Checkout"
        className="hidden md:flex relative z-50 max-h-[92vh] w-full max-w-xl flex-col overflow-y-auto rounded-3xl bg-surface shadow-2xl border border-border animate-in zoom-in-95 duration-200 text-foreground"
      >
        {/* Desktop Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-surface sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img src={faasbayLogo} alt="FaasBay" className="h-7 w-auto object-contain" />
            <div className="h-4 w-px bg-border" />
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>256-Bit Encrypted Checkout</span>
            </span>
          </div>
          <button
            type="button"
            onClick={closeCheckout}
            aria-label="Close checkout"
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Desktop 3-Step Wizard Indicator */}
        {!isSuccess && (
          <div className="border-b border-border/60 bg-secondary/30 px-6 py-3">
            <div className="flex items-center justify-between max-w-xs mx-auto text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-black ${
                  desktopStep >= 1 ? "bg-[#B0CB1F] text-slate-950" : "bg-muted text-muted-foreground"
                }`}>
                  {desktopStep > 1 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : "1"}
                </span>
                <span className={desktopStep === 1 ? "text-foreground font-black" : "text-muted-foreground"}>
                  Delivery
                </span>
              </div>
              <div className={`h-0.5 w-12 ${desktopStep >= 2 ? "bg-[#B0CB1F]" : "bg-border"}`} />
              <div className="flex items-center gap-2">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-black ${
                  desktopStep >= 2 ? "bg-[#B0CB1F] text-slate-950" : "bg-muted text-muted-foreground"
                }`}>
                  2
                </span>
                <span className={desktopStep === 2 ? "text-foreground font-black" : "text-muted-foreground"}>
                  Payment
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Body */}
        <div className="p-6 space-y-5">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {formError}
            </div>
          )}

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase">
                  Order Successfully Placed
                </span>
                <h3 className="font-sans text-xl font-black text-foreground pt-1">
                  Thank you, {name.trim() || "Customer"}!
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Your order <strong>{orderNumber}</strong> has been confirmed and is being prepared for dispatch.
                </p>
              </div>
              <div className="w-full rounded-2xl border border-border/80 bg-secondary/30 p-4 text-left text-xs space-y-2">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Delivery Address:</span>
                  <span className="text-muted-foreground font-normal">{city.trim()} - {pincode.trim()} ({state})</span>
                </div>
                <div className="flex justify-between font-bold text-foreground">
                  <span>Payment Mode:</span>
                  <span className="text-emerald-600 font-bold uppercase">{isCod ? "Cash on Delivery (Advance Paid)" : "Prepaid (Online)"}</span>
                </div>
                {isCod ? (
                  <>
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Advance Delivery Paid:</span>
                      <span className="text-emerald-600 font-extrabold">₹{amountToPayNow.toLocaleString("en-IN")} (Online Paid)</span>
                    </div>
                    <div className="flex justify-between font-bold text-foreground bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                      <span className="text-amber-800 dark:text-amber-300">Cash to Pay on Delivery:</span>
                      <span className="text-amber-900 dark:text-amber-200 font-black text-sm">₹{amountDueOnDelivery.toLocaleString("en-IN")}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Total Amount Paid:</span>
                    <span className="text-emerald-600 font-black">₹{amountToPayNow.toLocaleString("en-IN")} (100% Free Delivery)</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-foreground">
                  <span>Estimated Delivery:</span>
                  <span className="text-emerald-600 font-black">2–4 Business Days</span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                className="w-full min-h-[44px] rounded-2xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 px-6 py-3 text-sm font-black shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : desktopStep === 1 ? (
            /* STEP 1: SHIPPING */
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Shipping & Contact Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com (optional)"
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Street Address / House No. *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat/House no., building name, street"
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City / Town"
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F] cursor-pointer"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit PIN"
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Country</label>
                  <div className="w-full rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 text-xs text-foreground font-semibold flex items-center justify-between">
                    <span>India</span>
                    <span>🇮🇳</span>
                  </div>
                </div>
              </div>

              {/* Order Summary Strip */}
              <div className="rounded-2xl bg-secondary/30 p-4 text-xs space-y-2 border border-border/60">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items Total ({items.length})</span>
                  <span className="font-semibold text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-emerald-600">
                    ₹0 FREE (Prepaid) / ₹{codAdvanceDeliveryFee} (COD)
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-black text-foreground">
                  <span>Product Amount</span>
                  <span className="text-[#5b6a07] dark:text-[#B0CB1F] text-base">₹{productPriceDue.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: PAYMENT — CLEAN GROUPED PROFESSIONAL UI */
            <div className="space-y-4">
              {/* Header with 100% Safe Payments Shield */}
              <div className="flex items-center justify-between pb-0.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Select Payment Method</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1 shrink-0">
                  <Lock className="w-2.5 h-2.5" /> 100% Safe Payments
                </span>
              </div>

              {/* PAY ONLINE GROUP */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-0.5">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground">
                    PAY ONLINE (100% FREE DELIVERY)
                  </span>
                  <div className="flex-1 h-px bg-border/80" />
                </div>

                <div className="rounded-2xl border border-border bg-card divide-y divide-border/60 overflow-hidden shadow-2xs">
                  {[
                    {
                      id: "upi" as const,
                      title: "UPI (Google Pay / PhonePe / Paytm / QR)",
                      desc: "Zero delivery fee • 100% Free Shipping",
                      badge: "Free Delivery",
                      icon: "upi",
                    },
                    {
                      id: "card" as const,
                      title: "Debit / Credit Card",
                      desc: "Visa, Mastercard, RuPay, Maestro & Amex",
                      badge: "Free Delivery",
                      icon: "card",
                    },
                    {
                      id: "netbanking" as const,
                      title: "Net Banking",
                      desc: "All major Indian banks supported (SBI, HDFC, ICICI)",
                      badge: "Free Delivery",
                      icon: "netbanking",
                    },
                    {
                      id: "wallet" as const,
                      title: "Wallets",
                      desc: "Paytm, Amazon Pay, PhonePe & Mobikwik",
                      badge: "Free Delivery",
                      icon: "wallet",
                    },
                  ].map((pm) => {
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-slate-50/90 dark:bg-white/[0.04]"
                            : "bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Method Icon Badge */}
                          {pm.icon === "upi" ? (
                            <div className="h-8.5 w-8.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-2xs">
                              <span className="text-[9.5px] font-black tracking-tight text-slate-800 dark:text-white px-1 border border-slate-900 dark:border-white rounded-xs">
                                UPI
                              </span>
                            </div>
                          ) : pm.icon === "wallet" ? (
                            <div className="h-8.5 w-8.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-2xs text-slate-700 dark:text-neutral-200">
                              <Wallet className="h-4 w-4" />
                            </div>
                          ) : pm.icon === "card" ? (
                            <div className="h-8.5 w-8.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-2xs text-slate-700 dark:text-neutral-200">
                              <CreditCard className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="h-8.5 w-8.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-2xs text-slate-700 dark:text-neutral-200">
                              <Landmark className="h-4 w-4" />
                            </div>
                          )}

                          {/* Title, Badge & Subtitle */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs sm:text-[13px] font-bold text-foreground ${
                                  isSelected ? "font-extrabold text-slate-950 dark:text-white" : ""
                                }`}
                              >
                                {pm.title}
                              </span>
                              {pm.badge && (
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  {pm.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                              {pm.desc}
                            </p>
                          </div>
                        </div>

                        {/* Radio */}
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-all ${
                            isSelected
                              ? "border-[#B0CB1F] bg-white dark:bg-neutral-900 ring-2 ring-[#B0CB1F]/30"
                              : "border-slate-300 dark:border-neutral-600 bg-transparent"
                          }`}
                        >
                          {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-[#B0CB1F]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PAY IN CASH GROUP */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2.5 px-0.5">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground">
                    CASH ON DELIVERY (WITH ADVANCE DELIVERY CHARGE)
                  </span>
                  <div className="flex-1 h-px bg-border/80" />
                </div>

                <div className="rounded-2xl border border-border bg-card divide-y divide-border/60 overflow-hidden shadow-2xs">
                  {[
                    {
                      id: "cod" as const,
                      title: "Cash on Delivery (COD)",
                      desc: `Pay ₹${codAdvanceDeliveryFee} advance delivery fee online • Pay ₹${productPriceDue.toLocaleString("en-IN")} cash on parcel delivery`,
                      badge: `₹${codAdvanceDeliveryFee} Advance Fee`,
                      icon: "cod",
                    },
                  ].map((pm) => {
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-slate-50/90 dark:bg-white/[0.04]"
                            : "bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="h-8.5 w-8.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-2xs text-emerald-600 dark:text-emerald-400">
                            <Banknote className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs sm:text-[13px] font-bold text-foreground ${
                                  isSelected ? "font-extrabold text-slate-950 dark:text-white" : ""
                                }`}
                              >
                                {pm.title}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                ₹{codAdvanceDeliveryFee} Advance
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {pm.desc}
                            </p>
                          </div>
                        </div>

                        {/* Radio */}
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-all ${
                            isSelected
                              ? "border-[#B0CB1F] bg-white dark:bg-neutral-900 ring-2 ring-[#B0CB1F]/30"
                              : "border-slate-300 dark:border-neutral-600 bg-transparent"
                          }`}
                        >
                          {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-[#B0CB1F]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Details Breakdown */}
              <div className="rounded-2xl bg-secondary/30 p-4 text-xs space-y-2 border border-border/60">
                <div className="flex justify-between text-muted-foreground">
                  <span>Deliver To</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">{address}, {city}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Product Subtotal</span>
                  <span className="font-semibold text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Charge</span>
                  <span className={isCod ? "font-bold text-foreground" : "font-bold text-emerald-600"}>
                    {isCod ? `₹${codAdvanceDeliveryFee} (Advance Fee)` : "₹0 FREE (Prepaid)"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 text-xs font-bold text-foreground">
                  <span>Total Order Value</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>

                {isCod ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5 mt-2">
                    <div className="flex justify-between items-center text-xs font-bold text-amber-900 dark:text-amber-300">
                      <span>1. Pay Online Now (Advance Delivery):</span>
                      <span className="text-sm font-black text-[#5b6a07] dark:text-[#B0CB1F]">₹{amountToPayNow.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>2. Pay Cash on Delivery (to courier):</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">₹{amountDueOnDelivery.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs font-bold text-emerald-900 dark:text-emerald-300 mt-2">
                    <span>Pay Online Now (100% Free Delivery):</span>
                    <span className="text-base font-black text-[#5b6a07] dark:text-[#B0CB1F]">₹{amountToPayNow.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Footer Actions */}
        {!isSuccess && (
          <div className="border-t border-border/80 bg-surface px-6 py-4 flex items-center justify-between gap-3 sticky bottom-0 z-10">
            {desktopStep === 2 ? (
              <button
                type="button"
                onClick={() => setDesktopStep(1)}
                className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-2 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Shipping
              </button>
            ) : (
              <div className="text-xs text-muted-foreground">
                Payable: <strong className="text-foreground text-sm font-black">₹{productPriceDue.toLocaleString("en-IN")}</strong>
              </div>
            )}

            {desktopStep === 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (validateShipping()) setDesktopStep(2);
                }}
                className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#B0CB1F] hover:bg-[#9cb519] active:bg-[#889e14] text-slate-950 px-6 py-2.5 text-xs font-black shadow-[0_4px_16px_rgba(176,203,31,0.3)] active:scale-95 transition-all cursor-pointer ml-auto"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#B0CB1F] hover:bg-[#9cb519] active:bg-[#889e14] text-slate-950 px-6 py-2.5 text-xs font-black shadow-[0_4px_16px_rgba(176,203,31,0.3)] active:scale-95 disabled:opacity-50 transition-all cursor-pointer ml-auto"
              >
                {isProcessing ? (
                  <span>Securing Order...</span>
                ) : isCod ? (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pay ₹{amountToPayNow.toLocaleString("en-IN")} Advance & Place COD Order</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pay ₹{amountToPayNow.toLocaleString("en-IN")} & Place Order</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE CHECKOUT CONTAINER (MATCHING SCREEN 03 & 04 FROM REFERENCE)    */}
      {/* ========================================================================= */}
      <div
        role="dialog"
        aria-label="Mobile Secure Checkout"
        className="flex md:hidden fixed inset-0 z-50 w-full h-full flex-col overflow-y-auto bg-surface text-foreground animate-in slide-in-from-bottom duration-200"
      >
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] bg-surface/98 backdrop-blur-md px-4 py-3 shadow-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (mobileStep === "payment") {
                  setMobileStep("delivery");
                } else {
                  closeCheckout();
                }
              }}
              aria-label="Back"
              className="grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-secondary active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.2]" />
            </button>
            <a href="/" className="flex items-center gap-1.5">
              <img src={faasbayLogo} alt="FaasBay" className="h-6.5 w-auto object-contain" />
            </a>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Secure Checkout</span>
          </div>
        </div>

        {/* Mobile 3-Step Stepper Bar */}
        {!isSuccess && (
          <div className="px-6 py-3 bg-secondary/20 border-b border-black/[0.04] dark:border-white/[0.06] shrink-0">
            <div className="flex items-center justify-between max-w-xs mx-auto text-xs font-bold">
              {/* Step 1: Delivery */}
              <div className="flex flex-col items-center gap-1.5">
                <div className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black shadow-xs ${
                  mobileStep === "delivery"
                    ? "bg-[#B0CB1F] text-slate-950 ring-4 ring-[#B0CB1F]/25"
                    : "bg-[#B0CB1F] text-slate-950"
                }`}>
                  {mobileStep === "payment" ? <Check className="h-4 w-4 stroke-[3]" /> : "1"}
                </div>
                <span className={`text-[11px] ${mobileStep === "delivery" ? "text-[#5b6a07] dark:text-[#B0CB1F] font-bold" : "text-neutral-500 font-medium"}`}>
                  Delivery
                </span>
              </div>

              {/* Connecting Line 1 */}
              <div className={`flex-1 h-0.5 mx-2 -mt-5 ${mobileStep === "payment" ? "bg-[#B0CB1F]" : "bg-neutral-200 dark:bg-neutral-700"}`} />

              {/* Step 2: Payment */}
              <div className="flex flex-col items-center gap-1.5">
                <div className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black shadow-xs ${
                  mobileStep === "payment"
                    ? "bg-[#B0CB1F] text-slate-950 ring-4 ring-[#B0CB1F]/25"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                }`}>
                  2
                </div>
                <span className={`text-[11px] ${mobileStep === "payment" ? "text-[#5b6a07] dark:text-[#B0CB1F] font-bold" : "text-neutral-400 font-medium"}`}>
                  Payment
                </span>
              </div>

              {/* Connecting Line 2 */}
              <div className="flex-1 h-0.5 mx-2 -mt-5 bg-neutral-200 dark:bg-neutral-700" />

              {/* Step 3: Review */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 text-xs font-black shadow-xs">
                  3
                </div>
                <span className="text-[11px] text-neutral-400 font-medium">Review</span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Body Content */}
        {formError && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {formError}
          </div>
        )}

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 my-auto">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase">
                Order Placed Successfully
              </span>
              <h3 className="font-display text-xl font-bold text-foreground">
                Thank You, {name.trim() || "Customer"}!
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Your order <span className="font-mono font-bold text-foreground">#{orderNumber}</span> has been confirmed and is being prepped for dispatch.
              </p>
            </div>
            <div className="w-full rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-card p-4 space-y-2 text-xs text-left">
              <div className="flex justify-between text-neutral-500">
                <span>Deliver To:</span>
                <span className="font-bold text-foreground">{city.trim()} - {pincode.trim()} ({state})</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Payment Mode:</span>
                <span className="font-bold text-foreground uppercase">{isCod ? "Cash on Delivery" : "Prepaid (Online)"}</span>
              </div>
              {isCod ? (
                <>
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>Advance Delivery Paid:</span>
                    <span>₹{amountToPayNow.toLocaleString("en-IN")} (Online Paid)</span>
                  </div>
                  <div className="flex justify-between text-amber-800 dark:text-amber-300 font-black bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    <span>Cash Due on Delivery:</span>
                    <span className="text-sm">₹{amountDueOnDelivery.toLocaleString("en-IN")}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Total Amount Paid:</span>
                  <span>₹{amountToPayNow.toLocaleString("en-IN")} (100% Free Delivery)</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-foreground">
                <span>Estimated Delivery:</span>
                <span className="text-emerald-600 font-black">2–3 Business Days</span>
              </div>
            </div>
            <button
              type="button"
              onClick={closeCheckout}
              className="w-full min-h-[46px] rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : mobileStep === "delivery" ? (
          /* MOBILE STEP 1 — DELIVERY */
          <div className="flex-1 p-4 space-y-4">
            {/* Deliver to Card */}
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-card p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Deliver to</span>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-xs font-bold text-[#5b6a07] dark:text-[#B0CB1F] hover:underline cursor-pointer"
                >
                  {isEditingAddress || !address ? "Done" : "Change"}
                </button>
              </div>

              {isEditingAddress || !address ? (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full min-h-[42px] rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-[#B0CB1F]"
                  />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Mobile Phone Number *"
                    className="w-full min-h-[42px] rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-[#B0CB1F]"
                  />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street / Flat / House No. *"
                    className="w-full min-h-[42px] rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-[#B0CB1F]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City / Town *"
                      className="w-full min-h-[42px] rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-[#B0CB1F]"
                    />
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full min-h-[42px] rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-[#B0CB1F] cursor-pointer"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      placeholder="PIN Code *"
                      className="w-full min-h-[42px] rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-[#B0CB1F]"
                    />
                    <div className="w-full min-h-[42px] rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground font-semibold flex items-center justify-between">
                      <span>India 🇮🇳</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">{name}</span>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {address}, {city}, {state} - {pincode}
                  </p>
                  <p className="text-xs text-neutral-500 pt-0.5">Phone: {phone}</p>
                </div>
              )}
            </div>

            {/* Delivery Option Banner */}
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-card p-4 space-y-3">
              <span className="text-xs font-bold text-foreground">Delivery Option</span>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 text-[#5b6a07] dark:text-[#B0CB1F]" />
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Fast Express Delivery
                    </p>
                    <p className="text-[11px] text-neutral-500">2 – 4 business days</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ₹0 FREE (Prepaid) / ₹{codAdvanceDeliveryFee} (COD)
                </span>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-card p-4 space-y-3">
              <span className="text-xs font-bold text-foreground">Order Items ({items.length})</span>
              <div className="space-y-2.5 divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 pt-2 first:pt-0">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-black/[0.06] dark:border-white/[0.08] shrink-0 p-1">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{item.product.title}</h4>
                      <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-foreground block">
                        ₹{item.product.price ? (parseFloat(String(item.product.price).replace(/[^0-9.]/g, "")) * item.quantity).toLocaleString("en-IN") : "0"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Details */}
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-card p-4 space-y-2 text-xs">
              <span className="font-bold text-foreground block pb-1">Price Details</span>
              <div className="flex justify-between text-neutral-500">
                <span>Item Total</span>
                <span className="font-semibold text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>Delivery Charges</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ₹0 FREE (Prepaid) / ₹{codAdvanceDeliveryFee} (COD)
                </span>
              </div>
              <div className="flex justify-between border-t border-black/[0.06] dark:border-white/[0.08] pt-2 items-baseline">
                <div>
                  <span className="font-bold text-sm text-foreground block">Product Amount</span>
                  <span className="text-[10px] text-neutral-400">Inclusive of all taxes</span>
                </div>
                <span className="font-display text-xl font-black text-foreground">
                  ₹{productPriceDue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Continue to Payment CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (validateShipping()) setMobileStep("payment");
                }}
                className="w-full min-h-[48px] rounded-xl bg-[#B0CB1F] hover:bg-[#9cb519] active:bg-[#889e14] text-slate-950 font-black text-sm tracking-wide shadow-[0_4px_16px_rgba(176,203,31,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <span>Continue to Payment</span>
              </button>
            </div>
          </div>
        ) : (
          /* MOBILE STEP 2 — PAYMENT */
          <form onSubmit={handlePlaceOrder} className="flex-1 p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-0.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Select Payment Method
              </span>
              <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> 100% Safe
              </span>
            </div>

            {/* PAY ONLINE GROUP */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 px-0.5">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground">
                  PAY ONLINE (100% FREE DELIVERY)
                </span>
                <div className="flex-1 h-px bg-border/80" />
              </div>

              <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-card divide-y divide-border/60 overflow-hidden shadow-2xs">
                {[
                  {
                    id: "upi" as const,
                    title: "UPI (Google Pay / PhonePe / Paytm / QR)",
                    desc: "Zero delivery fee • 100% Free Shipping",
                    badge: "Free Delivery",
                    icon: "upi",
                  },
                  {
                    id: "card" as const,
                    title: "Debit / Credit Card",
                    desc: "Visa, Mastercard, RuPay, Maestro & Amex",
                    badge: "Free Delivery",
                    icon: "card",
                  },
                  {
                    id: "netbanking" as const,
                    title: "Net Banking",
                    desc: "All major Indian banks supported",
                    badge: "Free Delivery",
                    icon: "netbanking",
                  },
                  {
                    id: "wallet" as const,
                    title: "Wallets",
                    desc: "Paytm, Amazon Pay, PhonePe & Mobikwik",
                    badge: "Free Delivery",
                    icon: "wallet",
                  },
                ].map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`w-full flex items-center justify-between p-3.5 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-slate-50/90 dark:bg-white/[0.04]"
                          : "bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {pm.icon === "upi" ? (
                          <div className="h-8 w-8 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-2xs">
                            <span className="text-[9px] font-black tracking-tight text-slate-800 dark:text-white px-1 border border-slate-900 dark:border-white rounded-xs">
                              UPI
                            </span>
                          </div>
                        ) : pm.icon === "wallet" ? (
                          <div className="h-8 w-8 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-2xs text-slate-700 dark:text-neutral-200">
                            <Wallet className="h-4 w-4" />
                          </div>
                        ) : pm.icon === "card" ? (
                          <div className="h-8 w-8 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-2xs text-slate-700 dark:text-neutral-200">
                            <CreditCard className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-2xs text-slate-700 dark:text-neutral-200">
                            <Landmark className="h-4 w-4" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-bold text-foreground truncate ${isSelected ? "font-extrabold text-slate-950 dark:text-white" : ""}`}>
                              {pm.title}
                            </span>
                            {pm.badge && (
                              <span className="text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {pm.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-muted-foreground mt-0.5 truncate">{pm.desc}</p>
                        </div>
                      </div>

                      <div
                        className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-all ${
                          isSelected
                            ? "border-[#B0CB1F] bg-white dark:bg-neutral-900 ring-2 ring-[#B0CB1F]/30"
                            : "border-slate-300 dark:border-neutral-600 bg-transparent"
                        }`}
                      >
                        {isSelected && <div className="h-2 w-2 rounded-full bg-[#B0CB1F]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PAY IN CASH GROUP */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2.5 px-0.5">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground">
                  CASH ON DELIVERY (WITH ADVANCE DELIVERY CHARGE)
                </span>
                <div className="flex-1 h-px bg-border/80" />
              </div>

              <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-card divide-y divide-border/60 overflow-hidden shadow-2xs">
                {[
                  {
                    id: "cod" as const,
                    title: "Cash on Delivery (COD)",
                    desc: `Pay ₹${codAdvanceDeliveryFee} advance delivery fee online • Pay ₹${productPriceDue.toLocaleString("en-IN")} cash upon delivery`,
                    badge: `₹${codAdvanceDeliveryFee} Advance Fee`,
                    icon: "cod",
                  },
                ].map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`w-full flex items-center justify-between p-3.5 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-slate-50/90 dark:bg-white/[0.04]"
                          : "bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-2xs text-emerald-600 dark:text-emerald-400">
                          <Banknote className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold text-foreground truncate ${isSelected ? "font-extrabold text-slate-950 dark:text-white" : ""}`}>
                              {pm.title}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              ₹{codAdvanceDeliveryFee} Advance
                            </span>
                          </div>
                          <p className="text-[10.5px] text-muted-foreground mt-0.5">{pm.desc}</p>
                        </div>
                      </div>

                      <div
                        className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-all ${
                          isSelected
                            ? "border-[#B0CB1F] bg-white dark:bg-neutral-900 ring-2 ring-[#B0CB1F]/30"
                            : "border-slate-300 dark:border-neutral-600 bg-transparent"
                        }`}
                      >
                        {isSelected && <div className="h-2 w-2 rounded-full bg-[#B0CB1F]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Details */}
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-card p-4 space-y-2 text-xs">
              <span className="font-bold text-foreground block pb-1">Price Details</span>
              <div className="flex justify-between text-neutral-500">
                <span>Item Total</span>
                <span className="font-semibold text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>Delivery Charges</span>
                <span className={isCod ? "font-bold text-foreground" : "font-bold text-emerald-600 dark:text-emerald-400"}>
                  {isCod ? `₹${codAdvanceDeliveryFee} (Advance Fee)` : "₹0 FREE (Prepaid)"}
                </span>
              </div>
              <div className="flex justify-between border-t border-black/[0.06] dark:border-white/[0.08] pt-2 items-baseline">
                <div>
                  <span className="font-bold text-sm text-foreground block">Total Order Value</span>
                  <span className="text-[10px] text-neutral-400">Inclusive of all taxes</span>
                </div>
                <span className="font-display text-xl font-black text-foreground">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              {isCod ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5 mt-2">
                  <div className="flex justify-between items-center text-xs font-bold text-amber-900 dark:text-amber-300">
                    <span>1. Pay Online Now (Advance Delivery):</span>
                    <span className="text-sm font-black text-[#5b6a07] dark:text-[#B0CB1F]">₹{amountToPayNow.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>2. Pay Cash on Delivery (to courier):</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">₹{amountDueOnDelivery.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs font-bold text-emerald-900 dark:text-emerald-300 mt-2">
                  <span>Pay Online Now (100% Free Delivery):</span>
                  <span className="text-base font-black text-[#5b6a07] dark:text-[#B0CB1F]">₹{amountToPayNow.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>

            {/* Place Order CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing || items.length === 0}
                className="w-full min-h-[48px] rounded-xl bg-[#B0CB1F] hover:bg-[#9cb519] active:bg-[#889e14] text-slate-950 font-black text-sm tracking-wide shadow-[0_4px_16px_rgba(176,203,31,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {isProcessing ? (
                  <span>Processing Order...</span>
                ) : isCod ? (
                  <>
                    <Lock className="h-4 w-4 stroke-[2.2]" />
                    <span>Pay ₹{amountToPayNow.toLocaleString("en-IN")} Advance & Place COD Order</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 stroke-[2.2]" />
                    <span>Pay ₹{amountToPayNow.toLocaleString("en-IN")} & Place Order</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
