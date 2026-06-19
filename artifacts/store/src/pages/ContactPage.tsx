import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileDock from '@/components/MobileDock';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('success');
    setName(''); setEmail(''); setMessage('');
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <main className="flex-grow py-16 px-6 md:px-10">
        <div className="max-w-[1560px] mx-auto">
          <div className="max-w-2xl mx-auto mb-16 text-center">
            <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">THE STYLE ZONE • CONTACT</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#121212] font-display leading-[1.1]">
              Get in <span className="text-[#FE5733]">Touch.</span>
            </h1>
            <p className="text-sm opacity-70 mt-4 leading-relaxed font-sans">
              Visit our boutique in Mahendranagar or reach out online. We're here to help you find your perfect style.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-8">
              <h3 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-6">Contact Information</h3>
              <div className="space-y-6">
                {[
                  { icon: <MapPin className="w-5 h-5" />, title: 'Address', content: 'The Style Zone\nStreet No. 2, Bhimdatta-4\nMahendranagar, Kanchanpur, Nepal' },
                  { icon: <Phone className="w-5 h-5" />, title: 'Phone', content: '+977 984-8123456' },
                  { icon: <Mail className="w-5 h-5" />, title: 'Email', content: 'info@thestylezone.com.np' },
                  { icon: <Clock className="w-5 h-5" />, title: 'Hours', content: 'Sun–Fri: 9:00 AM – 7:00 PM\nSaturday: Closed' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#F5F5F0] rounded-[4px] flex items-center justify-center shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#121212] mb-1">{item.title}</h4>
                      <p className="text-sm text-[#121212]/70 leading-relaxed whitespace-pre-line">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-8">
              <h3 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-6">Send a Message</h3>
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                  <p className="text-sm font-bold text-[#121212] text-center">Thanks! We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Your Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full h-11 border border-stone-200 rounded-[4px] px-4 text-sm focus:outline-none focus:border-[#121212]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Email Address</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full h-11 border border-stone-200 rounded-[4px] px-4 text-sm focus:outline-none focus:border-[#121212]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Message</label>
                    <textarea required rows={5} value={message} onChange={e => setMessage(e.target.value)} className="w-full border border-stone-200 rounded-[4px] p-4 text-sm focus:outline-none focus:border-[#121212] resize-none" />
                  </div>
                  <button type="submit" className="w-full h-12 bg-[#121212] text-white rounded-[4px] font-bold uppercase tracking-widest text-xs hover:bg-[#FE5733] transition-colors flex items-center justify-center gap-2">
                    Send Message <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileDock />
    </div>
  );
}
