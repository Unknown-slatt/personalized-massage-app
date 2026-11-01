import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle2, 
  ShieldCheck, Lock, Eye, EyeOff, Plus, Trash2, Edit3, Settings, 
  Users, DollarSign, Database, Copy, Check, Menu, X, ChevronRight, 
  Info, AlertTriangle, RefreshCw, Filter, Search, Award, HeartHandshake,
  CreditCard, Compass
} from 'lucide-react';

// Default initial state data for luxury experience
const INITIAL_SERVICES = [
  { id: 'srv-1', name: 'Deep Tissue Therapy', basePrice: 150, description: 'Intense pressure targets deep muscle layers to release chronic tension and tightness.', active: true, tag: 'Popular' },
  { id: 'srv-2', name: 'Hot Stone & Hot Tub Sessions', basePrice: 180, description: 'Soothing heated river stones combined with private luxury hydrotherapy relaxation.', active: true, tag: 'Luxury' },
  { id: 'srv-3', name: 'Relaxing Body Rubs', basePrice: 130, description: 'Gentle, full-body tactile touch using aromatic essential oils to melt stress away.', active: true, tag: 'Essential' },
  { id: 'srv-4', name: 'Specialty Nuru Massage', basePrice: 220, description: 'Sensual, frictionless full-body treatment utilizing warm sea-kelp gel.', active: true, tag: 'Exclusive' },
  { id: 'srv-5', name: 'Customized Treatments', basePrice: 170, description: 'Tailored blend of pressure techniques and trigger point focus designed for your body.', active: true, tag: 'Custom' },
  { id: 'srv-6', name: 'Happy Ending', basePrice: 250, description: 'Ultra-luxurious soothing session ending in deep sensory relaxation and peaceful relief.', active: true, tag: 'VIP' }
];

const INITIAL_MULTIPLIERS = {
  30: 0.6,
  60: 1.0,
  90: 1.4,
  120: 1.8
};

const INITIAL_THERAPISTS = [
  { id: 'th-1', name: 'Elena Rostova', phone: '+1 (555) 234-5678', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', bio: 'Master therapist specializing in intuitive deep tissue and sensory relaxation.', active: true },
  { id: 'th-2', name: 'Aria Montgomery', phone: '+1 (555) 876-5432', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', bio: 'Certified specialist in warm stone hydrotherapy and tactile bodywork.', active: true },
  { id: 'th-3', name: 'Sofia Vane', phone: '+1 (555) 432-1098', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400', bio: 'Expert in bespoke specialty sessions and holistic body harmony.', active: true }
];

const INITIAL_PAYMENT_METHODS = [
  { id: 'pay-1', name: 'Zelle', instructions: 'Send 50% deposit to: pay@luxuryexperience.com. Include your Name & Date in memo.', active: true },
  { id: 'pay-2', name: 'CashApp', instructions: 'Send 50% deposit to: $LuxuryExperience. Add your Booking ID to memo.', active: true },
  { id: 'pay-3', name: 'Cryptocurrency (USDT/BTC)', instructions: 'USDT (TRC20): T9xXYZ... or BTC: 1A1zP1... Contact concierge after transfer.', active: true },
  { id: 'pay-4', name: 'Discreet Bank Wire', instructions: 'Account details provided via encrypted SMS/Email after request submission.', active: true },
  { id: 'pay-5', name: 'Cash at Session (Full Deposit Still Required)', instructions: 'Initial 50% deposit must be made digitally to confirm appointment.', active: false }
];

const INITIAL_BOOKINGS = [
  {
    id: 'EXP-8921',
    customerName: 'Jonathan Hayes',
    phone: '+1 (555) 901-2345',
    email: 'j.hayes@example.com',
    address: '742 Evergreen Terrace, Suite 4B, New York, NY',
    serviceId: 'srv-4',
    serviceName: 'Specialty Nuru Massage',
    duration: 90,
    therapistId: 'th-1',
    therapistName: 'Elena Rostova',
    date: '2026-11-05',
    time: '18:00',
    totalAmount: 308,
    depositAmount: 154,
    paymentMethod: 'Zelle',
    depositAgreed: true,
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  // Application Views: 'home' | 'booking' | 'confirmation' | 'admin'
  const [currentView, setCurrentView] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State initialization with localStorage persistence fallback
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('exp_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [multipliers, setMultipliers] = useState(() => {
    const saved = localStorage.getItem('exp_multipliers');
    return saved ? JSON.parse(saved) : INITIAL_MULTIPLIERS;
  });

  const [therapists, setTherapists] = useState(() => {
    const saved = localStorage.getItem('exp_therapists');
    return saved ? JSON.parse(saved) : INITIAL_THERAPISTS;
  });

  const [paymentMethods, setPaymentMethods] = useState(() => {
    const saved = localStorage.getItem('exp_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('exp_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('exp_admin_pw') || 'admin1280';
  });

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Booking Form State
  const [selectedService, setSelectedService] = useState(services[0] || null);
  const [bookingData, setBookingData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    date: '',
    time: '14:00',
    duration: 60,
    therapistId: therapists[0]?.id || '',
    paymentMethodId: paymentMethods[0]?.id || '',
    depositAgreed: false
  });
  
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [latestBooking, setLatestBooking] = useState(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('exp_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('exp_multipliers', JSON.stringify(multipliers));
  }, [multipliers]);

  useEffect(() => {
    localStorage.setItem('exp_therapists', JSON.stringify(therapists));
  }, [therapists]);

  useEffect(() => {
    localStorage.setItem('exp_payments', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem('exp_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('exp_admin_pw', adminPassword);
  }, [adminPassword]);

  // Dynamic Cost Calculation
  const calculatedCost = useMemo(() => {
    if (!selectedService) return { total: 0, deposit: 0 };
    const base = selectedService.basePrice;
    const mult = multipliers[bookingData.duration] || 1.0;
    const total = Math.round(base * mult);
    const deposit = Math.round(total * 0.5);
    return { total, deposit };
  }, [selectedService, bookingData.duration, multipliers]);

  // Handle availability check simulation
  const checkAvailability = (date, time) => {
    if (!date || !time) return;
    setIsCheckingAvailability(true);
    setAvailabilityMessage('');
    setTimeout(() => {
      setIsCheckingAvailability(false);
      setAvailabilityMessage(' Slot is fully available for guaranteed private booking!');
    }, 600);
  };

  // Start booking for a specific service
  const handleSelectServiceToBook = (service) => {
    setSelectedService(service);
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Booking Submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingData.depositAgreed) {
      alert('Please accept the 50% deposit requirement to proceed.');
      return;
    }

    const assignedTherapist = therapists.find(t => t.id === bookingData.therapistId);
    const selectedPayMethod = paymentMethods.find(p => p.id === bookingData.paymentMethodId);

    const newBooking = {
      id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: bookingData.fullName,
      phone: bookingData.phone,
      email: bookingData.email,
      address: bookingData.address,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      duration: Number(bookingData.duration),
      therapistId: bookingData.therapistId,
      therapistName: assignedTherapist ? assignedTherapist.name : 'Any Available Specialist',
      date: bookingData.date,
      time: bookingData.time,
      totalAmount: calculatedCost.total,
      depositAmount: calculatedCost.deposit,
      paymentMethod: selectedPayMethod ? selectedPayMethod.name : 'Selected Method',
      paymentInstructions: selectedPayMethod ? selectedPayMethod.instructions : '',
      depositAgreed: true,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setBookings([newBooking, ...bookings]);
    setLatestBooking(newBooking);
    setCurrentView('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Auth Handler
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordInput === adminPassword) {
      setIsAdminAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('Invalid Master Password. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Ambient Glow Decorative Effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-amber-600/5 blur-[150px] pointer-events-none rounded-full" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo / Brand Name */}
          <div 
            onClick={() => setCurrentView('home')} 
            className="cursor-pointer flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 p-[1px] flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-medium block">Personalized Sanctuary</span>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 bg-clip-text text-transparent font-serif">
                THE EXPERIENCE
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setCurrentView('home')} 
              className={`text-sm font-medium tracking-wider uppercase transition-colors ${currentView === 'home' ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}
            >
              Services & Menu
            </button>
            <button 
              onClick={() => {
                if (!selectedService) setSelectedService(services[0]);
                setCurrentView('booking');
              }} 
              className={`text-sm font-medium tracking-wider uppercase transition-colors ${currentView === 'booking' ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}
            >
              Book Session
            </button>
            
            {/* Discreet Admin Lock Button */}
            <button 
              onClick={() => setCurrentView('admin')}
              className="p-2 text-slate-500 hover:text-amber-400 transition-colors rounded-full hover:bg-slate-900"
              title="Portal Access"
            >
              <Lock className="w-4 h-4" />
            </button>

            <button 
              onClick={() => {
                if (!selectedService) setSelectedService(services[0]);
                setCurrentView('booking');
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold rounded-full text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              Reserve Now
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-3">
            <button 
              onClick={() => setCurrentView('admin')}
              className="p-2 text-slate-400 hover:text-amber-400"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-amber-500/20 px-4 py-6 space-y-4">
            <button 
              onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }} 
              className="block w-full text-left py-2 text-slate-200 font-medium"
            >
              Services & Treatments
            </button>
            <button 
              onClick={() => { 
                if (!selectedService) setSelectedService(services[0]);
                setCurrentView('booking'); 
                setMobileMenuOpen(false); 
              }} 
              className="block w-full text-left py-2 text-slate-200 font-medium"
            >
              Book Private Session
            </button>
            <button 
              onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }} 
              className="block w-full text-left py-2 text-amber-400 font-medium flex items-center space-x-2"
            >
              <Lock className="w-4 h-4" /> <span>Owner Portal</span>
            </button>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER CONTENT VIEW SWITCHING */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* VIEW 1: HOME PAGE / SERVICE DISPLAY */}
        {currentView === 'home' && (
          <div className="space-y-16">
            
            {/* Hero Banner Section */}
            <div className="text-center max-w-3xl mx-auto space-y-6 pt-6">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs uppercase tracking-widest font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bespoke Wellness & Indulgence</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-serif tracking-tight text-slate-100 font-normal">
                WELCOME TO A <span className="italic font-light text-amber-300">PERSONALIZED</span> EXPERIENCE
              </h1>
              <p className="text-slate-400 text-base sm:text-lg font-light leading-relaxed">
                Step into an exclusive sanctuary designed for discerning clients seeking tailor-made tactile relaxation, deep muscular recovery, and absolute privacy.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => {
                    setSelectedService(services[0]);
                    setCurrentView('booking');
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-full text-sm uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-transform active:scale-95"
                >
                  Schedule Private Appointment
                </button>
                <a 
                  href="#services-list" 
                  className="w-full sm:w-auto px-8 py-4 border border-amber-500/30 hover:border-amber-500 text-amber-300 font-medium rounded-full text-sm tracking-wider transition-colors text-center"
                >
                  Explore Treatments
                </a>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="bg-slate-900/60 border border-amber-500/10 rounded-2xl p-6 text-center space-y-3 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-slate-200 font-serif text-lg font-medium">100% Discreet & Confidential</h3>
                <p className="text-slate-400 text-sm">Strict privacy guaranteed. High-profile, off-site, or in-studio private appointments.</p>
              </div>

              <div className="bg-slate-900/60 border border-amber-500/10 rounded-2xl p-6 text-center space-y-3 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-slate-200 font-serif text-lg font-medium">Elite Practitioners</h3>
                <p className="text-slate-400 text-sm">Vetted, highly skilled bodywork specialists focused entirely on your individual desires.</p>
              </div>

              <div className="bg-slate-900/60 border border-amber-500/10 rounded-2xl p-6 text-center space-y-3 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-slate-200 font-serif text-lg font-medium">Tailored Modalities</h3>
                <p className="text-slate-400 text-sm">Custom combinations of pressure, warm oils, hot stone hydrotherapy, and sensory soothing.</p>
              </div>
            </div>

            {/* SERVICES OFFERED MENU SECTION */}
            <div id="services-list" className="space-y-8 pt-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-serif text-amber-200">Signature Treatments & Rates</h2>
                <p className="text-slate-400 text-sm">Select a treatment below to calculate pricing and schedule your session</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.filter(s => s.active).map((service) => (
                  <div 
                    key={service.id} 
                    className="bg-slate-900/80 border border-amber-500/20 hover:border-amber-500/60 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                          {service.tag || 'Specialty'}
                        </span>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Starting at</span>
                          <span className="text-2xl font-bold font-serif text-amber-300">${service.basePrice}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-serif text-slate-100 group-hover:text-amber-200 transition-colors">{service.name}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{service.description}</p>
                    </div>

                    <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Flexible 30m - 120m sessions</span>
                      <button 
                        onClick={() => handleSelectServiceToBook(service)}
                        className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 font-semibold text-xs rounded-lg transition-all flex items-center space-x-1"
                      >
                        <span>Book Session</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OUR THERAPISTS PREVIEW */}
            <div className="space-y-8 pt-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-serif text-amber-200">Featured Specialists</h2>
                <p className="text-slate-400 text-sm">Professionalism, grace, and unmatched personal attention</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {therapists.filter(t => t.active).map((therapist) => (
                  <div key={therapist.id} className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-6 text-center space-y-4">
                    <img 
                      src={therapist.avatar} 
                      alt={therapist.name} 
                      className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-amber-500/40 shadow-lg shadow-amber-500/10"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'; }}
                    />
                    <div>
                      <h4 className="text-lg font-serif text-slate-100 font-medium">{therapist.name}</h4>
                      <p className="text-xs text-amber-400 mt-0.5">Senior Practitioner</p>
                    </div>
                    <p className="text-slate-400 text-xs italic leading-relaxed">"{therapist.bio}"</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: CUSTOMER BOOKING FLOW */}
        {currentView === 'booking' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Private Reservation</span>
              <h1 className="text-3xl sm:text-4xl font-serif text-slate-100">Configure Your Experience</h1>
              <p className="text-slate-400 text-sm">Fill in your preferred details below to check availability and lock in your session.</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Client & Appointment Inputs */}
              <div className="lg:col-span-7 bg-slate-900/80 border border-amber-500/20 rounded-2xl p-6 sm:p-8 space-y-6">
                
                <h3 className="text-lg font-serif text-amber-300 border-b border-slate-800 pb-3 flex items-center space-x-2">
                  <User className="w-5 h-5 text-amber-400" />
                  <span>1. Personal & Location Details</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={bookingData.fullName}
                      onChange={(e) => setBookingData({...bookingData, fullName: e.target.value})}
                      placeholder="e.g. Harrison Ford"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Phone Number *</label>
                      <input 
                        type="tel" 
                        required 
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Email Address *</label>
                      <input 
                        type="email" 
                        required 
                        value={bookingData.email}
                        onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                        placeholder="client@domain.com"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Outcall Address / Incall Request Location *</label>
                    <textarea 
                      required 
                      rows={2}
                      value={bookingData.address}
                      onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                      placeholder="Street name, Hotel room # or Suite details..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-serif text-amber-300 border-b border-slate-800 pb-3 pt-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <span>2. Schedule & Therapist Selection</span>
                </h3>

                <div className="space-y-4">
                  {/* Service Selection */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Selected Treatment *</label>
                    <select 
                      value={selectedService?.id || ''}
                      onChange={(e) => {
                        const s = services.find(x => x.id === e.target.value);
                        setSelectedService(s);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-amber-200 font-serif focus:outline-none"
                    >
                      {services.filter(s => s.active).map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} (Base: ${service.basePrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Selection */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">Duration (Minutes) *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[30, 60, 90, 120].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setBookingData({...bookingData, duration: mins})}
                          className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                            bookingData.duration === mins 
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20' 
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {mins} Mins
                          <span className="block text-[10px] font-normal opacity-75">({multipliers[mins]}x)</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date & Time Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Date *</label>
                      <input 
                        type="date" 
                        required 
                        value={bookingData.date}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBookingData({...bookingData, date: val});
                          checkAvailability(val, bookingData.time);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Time Slot *</label>
                      <select 
                        value={bookingData.time}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBookingData({...bookingData, time: val});
                          checkAvailability(bookingData.date, val);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                      >
                        {['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'].map(t => (
                          <option key={t} value={t}>{t} HRS</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Real-time availability indicator */}
                  {(isCheckingAvailability || availabilityMessage) && (
                    <div className="text-xs p-3 rounded-lg bg-slate-950 border border-amber-500/20 flex items-center space-x-2">
                      {isCheckingAvailability ? (
                        <>
                          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                          <span className="text-slate-400">Verifying live schedule availability...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-emerald-300 font-medium">{availabilityMessage}</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Preferred Therapist */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Preferred Therapist *</label>
                    <select 
                      value={bookingData.therapistId}
                      onChange={(e) => setBookingData({...bookingData, therapistId: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                    >
                      {therapists.filter(t => t.active).map((therapist) => (
                        <option key={therapist.id} value={therapist.id}>
                          {therapist.name} - Specialist
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h3 className="text-lg font-serif text-amber-300 border-b border-slate-800 pb-3 pt-4 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>3. Payment Method</span>
                </h3>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Select Payment Option *</label>
                  <select 
                    value={bookingData.paymentMethodId}
                    onChange={(e) => setBookingData({...bookingData, paymentMethodId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  >
                    {paymentMethods.filter(p => p.active).map((pm) => (
                      <option key={pm.id} value={pm.id}>{pm.name}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Right Column: Dynamic Price Summary & Deposit Agreement */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl sticky top-28">
                  <h3 className="text-xl font-serif text-amber-200 border-b border-amber-500/20 pb-4">
                    Booking Summary
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Treatment:</span>
                      <span className="font-semibold text-slate-100">{selectedService?.name}</span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Base Rate:</span>
                      <span>${selectedService?.basePrice}</span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Selected Duration:</span>
                      <span>{bookingData.duration} Mins ({multipliers[bookingData.duration]}x)</span>
                    </div>

                    <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                      <span className="text-slate-300 font-medium">Total Session Fee:</span>
                      <span className="text-2xl font-bold font-serif text-slate-100">${calculatedCost.total}</span>
                    </div>

                    {/* Deposit Highlight Box */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mt-4 space-y-1">
                      <div className="flex justify-between items-center text-amber-300 font-semibold">
                        <span>Required 50% Deposit:</span>
                        <span className="text-xl font-bold">${calculatedCost.deposit}</span>
                      </div>
                      <p className="text-[11px] text-amber-200/70">
                        Required to reserve therapist time slot exclusively for you. Balance due upon appointment arrival.
                      </p>
                    </div>
                  </div>

                  {/* Deposit Checkbox Agreement */}
                  <div className="pt-2">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        required
                        checked={bookingData.depositAgreed}
                        onChange={(e) => setBookingData({...bookingData, depositAgreed: e.target.checked})}
                        className="mt-1 h-4 h-4 rounded border-amber-500 text-amber-500 focus:ring-amber-400 bg-slate-950"
                      />
                      <span className="text-xs text-slate-300 leading-relaxed group-hover:text-amber-200">
                        I understand and agree to pay the mandatory <strong className="text-amber-300">50% deposit (${calculatedCost.deposit})</strong> using my selected payment method to lock in this private reservation.
                      </span>
                    </label>
                  </div>

                  {/* Submission Button */}
                  <button 
                    type="submit"
                    disabled={!bookingData.depositAgreed}
                    className={`w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${
                      bookingData.depositAgreed 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-98' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Confirm & Proceed To Deposit
                  </button>

                  <div className="text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Encrypted & 100% Private Concierge Booking</span>
                  </div>

                </div>

              </div>

            </form>
          </div>
        )}

        {/* VIEW 3: CONFIRMATION SCREEN */}
        {currentView === 'confirmation' && latestBooking && (
          <div className="max-w-2xl mx-auto space-y-8 py-6">
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-10 space-y-6 text-center shadow-2xl relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Reservation Received</span>
                <h1 className="text-3xl font-serif text-slate-100">Booking #{latestBooking.id}</h1>
                <p className="text-slate-400 text-sm">
                  Thank you, <span className="text-slate-200 font-semibold">{latestBooking.customerName}</span>. Your reservation is pending deposit validation.
                </p>
              </div>

              {/* Payment Instructions Box */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-6 text-left space-y-4">
                <h3 className="text-amber-300 font-serif font-medium text-base flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>50% Deposit Instructions ({latestBooking.paymentMethod})</span>
                </h3>

                <div className="text-2xl font-bold font-serif text-slate-100">
                  Amount Due Now: <span className="text-amber-300">${latestBooking.depositAmount}</span>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-amber-100 font-mono leading-relaxed">
                  {latestBooking.paymentInstructions || 'Please proceed with deposit transfer to finalize slot.'}
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  * Once sent, screenshot your receipt and send to your therapist or concierge phone number upon confirmation contact.
                </p>
              </div>

              {/* Summary details list */}
              <div className="border-t border-slate-800 pt-6 text-left text-xs space-y-2 text-slate-300">
                <div className="grid grid-cols-2 gap-2">
                  <div><strong className="text-slate-400">Therapist:</strong> {latestBooking.therapistName}</div>
                  <div><strong className="text-slate-400">Service:</strong> {latestBooking.serviceName}</div>
                  <div><strong className="text-slate-400">Date & Time:</strong> {latestBooking.date} at {latestBooking.time}</div>
                  <div><strong className="text-slate-400">Duration:</strong> {latestBooking.duration} Mins</div>
                  <div><strong className="text-slate-400">Total Price:</strong> ${latestBooking.totalAmount}</div>
                  <div><strong className="text-slate-400">Location:</strong> {latestBooking.address}</div>
                </div>
              </div>

              <div className="pt-4 flex justify-center space-x-4">
                <button 
                  onClick={() => setCurrentView('home')}
                  className="px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-full text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors"
                >
                  Return To Homepage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: DISCREET OWNER ADMIN PANEL */}
        {currentView === 'admin' && (
          <div className="space-y-8">
            
            {!isAdminAuthenticated ? (
              /* Password Protection Modal / Card */
              <div className="max-w-md mx-auto bg-slate-900 border border-amber-500/30 rounded-3xl p-8 space-y-6 shadow-2xl">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-serif text-slate-100">Owner Sanctuary Portal</h2>
                  <p className="text-slate-400 text-xs">Enter your master security key to manage bookings and system settings.</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter Admin Password"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-amber-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {authError && (
                    <div className="text-xs text-rose-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition-colors"
                  >
                    Authenticate
                  </button>

                  {/* Password Emergency Reset Helper */}
                  <div className="text-center pt-2">
                    <button 
                      type="button"
                      onClick={() => {
                        if (window.confirm("Reset admin password back to default ('admin1280')?")) {
                          setAdminPassword('admin1280');
                          alert("Password reset to 'admin1280'");
                        }
                      }}
                      className="text-[11px] text-slate-500 hover:text-amber-400 underline"
                    >
                      Emergency Reset Password
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Authenticated Dashboard Interface */
              <AdminDashboard 
                bookings={bookings}
                setBookings={setBookings}
                therapists={therapists}
                setTherapists={setTherapists}
                services={services}
                setServices={setServices}
                multipliers={multipliers}
                setMultipliers={setMultipliers}
                paymentMethods={paymentMethods}
                setPaymentMethods={setPaymentMethods}
                adminPassword={adminPassword}
                setAdminPassword={setAdminPassword}
                onLogout={() => setIsAdminAuthenticated(false)}
              />
            )}

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-amber-500/10 py-10 bg-slate-950/90 text-center text-xs text-slate-500 space-y-3">
        <p className="tracking-widest uppercase text-amber-400/80 font-serif">Welcome To A Personalized Experience</p>
        <p>&copy; {new Date().getFullYear()} All rights reserved. Strict discretion and bespoke bodywork wellness.</p>
        <p className="text-[10px] text-slate-600">Private Client Access Only</p>
      </footer>

    </div>
  );
}

/* ==========================================================================
   ADMIN DASHBOARD COMPONENT WITH FULL CONTROL TABS & NETLIFY/SUPABASE GUIDE
   ========================================================================== */
function AdminDashboard({
  bookings, setBookings,
  therapists, setTherapists,
  services, setServices,
  multipliers, setMultipliers,
  paymentMethods, setPaymentMethods,
  adminPassword, setAdminPassword,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [pwSuccessMsg, setPwSuccessMsg] = useState('');

  // Booking Search Filter State
  const [bookingFilter, setBookingFilter] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');

  // Therapist Edit Modal / Add State
  const [editingTherapist, setEditingTherapist] = useState(null);
  const [newTherapist, setNewTherapist] = useState({ name: '', phone: '', avatar: '', bio: '', active: true });

  // Payment Method Edit Modal
  const [newPayment, setNewPayment] = useState({ name: '', instructions: '', active: true });

  // Filtered Bookings memo
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesFilter = bookingFilter === 'All' || b.status === bookingFilter;
      const matchesSearch = b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                            b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                            b.phone.includes(bookingSearch);
      return matchesFilter && matchesSearch;
    });
  }, [bookings, bookingFilter, bookingSearch]);

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      alert("Password must be at least 4 characters.");
      return;
    }
    setAdminPassword(newPassword);
    setPwSuccessMsg("Master password updated successfully!");
    setNewPassword('');
    setTimeout(() => setPwSuccessMsg(''), 3000);
  };

  const handleAddTherapist = (e) => {
    e.preventDefault();
    if (!newTherapist.name) return;
    const added = {
      ...newTherapist,
      id: `th-${Date.now()}`,
      avatar: newTherapist.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    };
    setTherapists([...therapists, added]);
    setNewTherapist({ name: '', phone: '', avatar: '', bio: '', active: true });
  };

  const handleDeleteTherapist = (id) => {
    if (window.confirm("Remove this therapist from portal?")) {
      setTherapists(therapists.filter(t => t.id !== id));
    }
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!newPayment.name) return;
    const added = { ...newPayment, id: `pay-${Date.now()}` };
    setPaymentMethods([...paymentMethods, added]);
    setNewPayment({ name: '', instructions: '', active: true });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-amber-500/20 rounded-2xl p-6">
        <div>
          <h2 className="text-2xl font-serif text-slate-100 flex items-center space-x-2">
            <span>Owner Control Panel</span>
            <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Discreet Mode
            </span>
          </h2>
          <p className="text-xs text-slate-400">Manage bookings, rates, staff, and system setup</p>
        </div>

        <button 
          onClick={onLogout}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
        >
          Lock & Exit Portal
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'bookings', label: 'Booking Tracker', icon: Calendar },
          { id: 'therapists', label: 'Therapists', icon: Users },
          { id: 'rates', label: 'Prices & Rates', icon: DollarSign },
          { id: 'payments', label: 'Payment Methods', icon: CreditCard },
          { id: 'security', label: 'Security & PW', icon: Lock },
          { id: 'deployment', label: 'Netlify & Database Guide', icon: Database }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id 
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                  : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BOOKING TRACKER */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input 
                type="text" 
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search name, ID or phone..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-1">
              {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBookingFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    bookingFilter === st 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List Table */}
          <div className="bg-slate-900 border border-amber-500/10 rounded-2xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer Info</th>
                  <th className="p-4">Service & Therapist</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Total / Deposit</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                      No bookings found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-850/50">
                      <td className="p-4 font-mono font-bold text-amber-300">{b.id}</td>
                      <td className="p-4 space-y-0.5">
                        <div className="font-semibold text-slate-100">{b.customerName}</div>
                        <div className="text-[11px] text-slate-400">{b.phone}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">{b.address}</div>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="font-medium text-slate-200">{b.serviceName}</div>
                        <div className="text-[11px] text-amber-400/80">With: {b.therapistName} ({b.duration} mins)</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-200">{b.date}</div>
                        <div className="text-[11px] text-slate-400">{b.time} HRS</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-100">${b.totalAmount}</div>
                        <div className="text-[11px] text-amber-300">Deposit: ${b.depositAmount}</div>
                      </td>
                      <td className="p-4">
                        <select 
                          value={b.status}
                          onChange={(e) => {
                            const updated = bookings.map(item => item.id === b.id ? { ...item, status: e.target.value } : item);
                            setBookings(updated);
                          }}
                          className={`px-2 py-1 rounded text-xs font-semibold focus:outline-none bg-slate-950 border border-slate-700 ${
                            b.status === 'Confirmed' ? 'text-emerald-400 border-emerald-500/40' :
                            b.status === 'Pending' ? 'text-amber-400 border-amber-500/40' :
                            b.status === 'Completed' ? 'text-blue-400 border-blue-500/40' : 'text-rose-400 border-rose-500/40'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => {
                            if (window.confirm(`Delete booking ${b.id}?`)) {
                              setBookings(bookings.filter(x => x.id !== b.id));
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: THERAPIST MANAGEMENT */}
      {activeTab === 'therapists' && (
        <div className="space-y-8">
          
          {/* Add New Therapist Form */}
          <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-serif text-amber-300 flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add New Therapist / Specialist</span>
            </h3>

            <form onSubmit={handleAddTherapist} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                value={newTherapist.name}
                onChange={(e) => setNewTherapist({...newTherapist, name: e.target.value})}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
              />
              <input 
                type="text" 
                placeholder="Phone Number" 
                value={newTherapist.phone}
                onChange={(e) => setNewTherapist({...newTherapist, phone: e.target.value})}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
              />
              <input 
                type="url" 
                placeholder="Avatar Image URL (Optional)" 
                value={newTherapist.avatar}
                onChange={(e) => setNewTherapist({...newTherapist, avatar: e.target.value})}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
              />
              <input 
                type="text" 
                placeholder="Short Bio / Expertise" 
                value={newTherapist.bio}
                onChange={(e) => setNewTherapist({...newTherapist, bio: e.target.value})}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
              />
              <div className="sm:col-span-2">
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-amber-400"
                >
                  Save Therapist
                </button>
              </div>
            </form>
          </div>

          {/* Current Therapists Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {therapists.map((t) => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start space-x-4">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-16 h-16 rounded-full object-cover border border-amber-500/30 flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'; }}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-slate-100 text-base">{t.name}</h4>
                    <button 
                      onClick={() => handleDeleteTherapist(t.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-amber-400">{t.phone || 'No direct phone listed'}</p>
                  <p className="text-xs text-slate-400">{t.bio}</p>
                  
                  <div className="pt-2 flex items-center space-x-2">
                    <label className="text-xs text-slate-400 flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={t.active}
                        onChange={(e) => {
                          const updated = therapists.map(item => item.id === t.id ? { ...item, active: e.target.checked } : item);
                          setTherapists(updated);
                        }}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span>Active for bookings</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: PRICE & RATES CONTROL */}
      {activeTab === 'rates' && (
        <div className="space-y-8">
          
          {/* Service Base Prices */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-serif text-amber-300">Base Service Rates ($ USD)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((srv) => (
                <div key={srv.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-serif font-semibold text-slate-200 block">{srv.name}</span>
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest">{srv.tag}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">$</span>
                    <input 
                      type="number" 
                      value={srv.basePrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setServices(services.map(s => s.id === srv.id ? { ...s, basePrice: val } : s));
                      }}
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duration Multipliers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-serif text-amber-300">Duration Multipliers</h3>
            <p className="text-xs text-slate-400">Total Price = Base Price × Duration Multiplier</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[30, 60, 90, 120].map((mins) => (
                <div key={mins} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-center">
                  <span className="text-xs font-bold text-slate-300 block">{mins} Minutes</span>
                  <input 
                    type="number" 
                    step="0.1"
                    value={multipliers[mins]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 1.0;
                      setMultipliers({...multipliers, [mins]: val});
                    }}
                    className="w-full text-center bg-slate-900 border border-slate-700 rounded-lg py-1 text-sm font-bold text-amber-300 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block">Multiplier</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: PAYMENT METHOD MANAGEMENT */}
      {activeTab === 'payments' && (
        <div className="space-y-8">
          
          {/* Add Payment Method */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-serif text-amber-300 flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Custom Payment Option</span>
            </h3>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <input 
                type="text" 
                placeholder="Method Name (e.g. Venmo, USDT, Wire)" 
                required
                value={newPayment.name}
                onChange={(e) => setNewPayment({...newPayment, name: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
              />
              <textarea 
                placeholder="Checkout payment instructions for client..."
                rows={2}
                value={newPayment.instructions}
                onChange={(e) => setNewPayment({...newPayment, instructions: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
              />
              <button 
                type="submit"
                className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-amber-400"
              >
                Add Payment Option
              </button>
            </form>
          </div>

          {/* Active Payment Methods List */}
          <div className="space-y-4">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-slate-100 text-base">{pm.name}</span>
                  <div className="flex items-center space-x-3">
                    <label className="text-xs text-slate-400 flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={pm.active}
                        onChange={(e) => {
                          setPaymentMethods(paymentMethods.map(p => p.id === pm.id ? { ...p, active: e.target.checked } : p));
                        }}
                        className="rounded border-slate-700 text-amber-500"
                      />
                      <span>Enabled</span>
                    </label>
                    <button 
                      onClick={() => setPaymentMethods(paymentMethods.filter(p => p.id !== pm.id))}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Instructions Shown To Client:</label>
                  <textarea 
                    value={pm.instructions}
                    onChange={(e) => {
                      setPaymentMethods(paymentMethods.map(p => p.id === pm.id ? { ...p, instructions: e.target.value } : p));
                    }}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-amber-200 font-mono focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 5: SECURITY & PASSWORD CONTROL */}
      {activeTab === 'security' && (
        <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-6 sm:p-8 space-y-6 max-w-xl mx-auto">
          <h3 className="text-xl font-serif text-amber-300 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <span>Master Password Security</span>
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">New Master Password</label>
              <input 
                type="text" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {pwSuccessMsg && (
              <div className="text-xs text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{pwSuccessMsg}</span>
              </div>
            )}

            <button 
              type="submit"
              className="px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: NETLIFY & SUPABASE DEPLOYMENT GUIDE */}
      {activeTab === 'deployment' && (
        <DeploymentGuide />
      )}

    </div>
  );
}

/* ==========================================================================
   NETLIFY & SUPABASE DEPLOYMENT GUIDE INSTRUCTION COMPONENT
   ========================================================================== */
function DeploymentGuide() {
  const [copiedSql, setCopiedSql] = useState(false);

  const sqlSchema = `-- ==========================================
-- SUPABASE DATABASE SETUP SCRIPT FOR SPA BOOKING
-- ==========================================

-- 1. Create Therapists Table
CREATE TABLE public.therapists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    bio TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Services Table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    base_price NUMERIC NOT NULL,
    description TEXT,
    tag TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Payment Methods Table
CREATE TABLE public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    instructions TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Bookings Table
CREATE TABLE public.bookings (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    service_name TEXT NOT NULL,
    duration INTEGER NOT NULL,
    therapist_name TEXT,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    deposit_amount NUMERIC NOT NULL,
    payment_method TEXT,
    deposit_agreed BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for privacy
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-6 sm:p-8 space-y-8">
      
      <div>
        <h3 className="text-2xl font-serif text-amber-200 flex items-center space-x-2">
          <Database className="w-6 h-6 text-amber-400" />
          <span>Publishing & Free Cloud Database Guide</span>
        </h3>
        <p className="text-slate-400 text-xs mt-1">
          Follow these step-by-step instructions to host this application for free on Netlify and connect a free Supabase cloud PostgreSQL database.
        </p>
      </div>

      {/* Step 1: Netlify Deployment */}
      <div className="space-y-3 border-l-2 border-amber-500/40 pl-4">
        <h4 className="text-lg font-serif text-slate-100 font-medium">Step 1: Host Website For Free on Netlify</h4>
        <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
          <li>Create a free account at <a href="https://netlify.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">Netlify.com</a>.</li>
          <li>If using GitHub/GitLab, push this code repository and click <strong>"Import from Git"</strong> on Netlify.</li>
          <li>Alternatively, build the React project locally (`npm run build`) and drag-and-drop the generated <code>dist</code> or <code>build</code> folder into Netlify Drop.</li>
          <li>Your site will instantly receive a custom <code>.netlify.app</code> URL with free HTTPS SSL encryption.</li>
        </ol>
      </div>

      {/* Step 2: Supabase Setup */}
      <div className="space-y-3 border-l-2 border-amber-500/40 pl-4">
        <h4 className="text-lg font-serif text-slate-100 font-medium">Step 2: Connect Free Supabase Database</h4>
        <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
          <li>Create a free cloud account at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">Supabase.com</a> and click <strong>"New Project"</strong>.</li>
          <li>Once created, navigate to the <strong>SQL Editor</strong> tab on the left menu.</li>
          <li>Copy the setup SQL script below, paste it into the editor, and click <strong>Run</strong>.</li>
        </ol>
      </div>

      {/* SQL Script Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-amber-300">Supabase SQL Table Schema Script</span>
          <button 
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded text-xs transition-colors"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied!' : 'Copy Script'}</span>
          </button>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] text-amber-100 font-mono overflow-x-auto leading-relaxed">
          {sqlSchema}
        </pre>
      </div>

    </div>
  );
}
