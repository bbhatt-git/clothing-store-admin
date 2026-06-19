'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('success');
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => {
      setStatus('idle');
    }, 4000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />

      <main className="flex-grow py-16 px-6 md:px-10">
        <div className="max-w-[1560px] mx-auto">
          
          {/* Header - Same as privacy/terms */}
          <div className="max-w-2xl mx-auto mb-16 text-center animate-on-scroll">
            <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">
              THE STYLE ZONE • CONTACT
            </p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#121212] font-display leading-[1.1]">
              Get in <span className="text-[#FE5733]">Touch.</span>
            </h1>
            <p className="text-sm opacity-70 mt-4 leading-relaxed font-sans">
              Visit our boutique in Mahendranagar or reach out online. We're here to help you find your perfect style.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* Contact Info Card */}
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-8 animate-on-scroll">
              <h3 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-6">
                Contact Information
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F5F5F0] rounded-[4px] flex items-center justify-center shrink-0">
                    <MapPin className="text-[#121212] w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#121212] mb-1">Address</h4>
                    <p className="text-sm text-[#121212]/70 leading-relaxed">
                      The Style Zone<br />
                      Street No. 2, Bhimdatta-4<br />
                      Mahendranagar, Kanchanpur, Nepal
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F5F5F0] rounded-[4px] flex items-center justify-center shrink-0">
                    <Phone className="text-[#121212] w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#121212] mb-1">Phone</h4>
                    <p className="text-sm text-[#121212]/70 font-mono">+977 984-8123456</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F5F5F0] rounded-[4px] flex items-center justify-center shrink-0">
                    <Mail className="text-[#121212] w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#121212] mb-1">Email</h4>
                    <p className="text-sm text-[#121212]/70 font-mono">contact@thestylezone.com.np</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F5F5F0] rounded-[4px] flex items-center justify-center shrink-0">
                    <Clock className="text-[#121212] w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#121212] mb-1">Hours</h4>
                    <p className="text-sm text-[#121212]/70 leading-relaxed">
                      Sunday - Friday: 10:00 AM - 8:30 PM<br />
                      Saturday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-8 animate-on-scroll">
              <h3 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-6">
                Send us a message
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#121212]/50 block">Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name" 
                    className="w-full text-xs h-10 border border-stone-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 bg-[#F5F5F0]/20 rounded-[4px] px-3 font-bold text-[#121212] placeholder:text-stone-400 outline-none transition-all duration-200 ease-in-out" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#121212]/50 block">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" 
                    className="w-full text-xs h-10 border border-stone-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 bg-[#F5F5F0]/20 rounded-[4px] px-3 font-bold text-[#121212] placeholder:text-stone-400 outline-none transition-all duration-200 ease-in-out" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#121212]/50 block">Message</label>
                  <textarea 
                    required 
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?" 
                    className="w-full text-xs border border-stone-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 bg-[#F5F5F0]/20 rounded-[4px] p-3 font-bold text-[#121212] placeholder:text-stone-400 outline-none resize-none transition-all duration-200 ease-in-out" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full h-12 bg-[#FE5733] hover:bg-[#121212] text-white rounded-[4px] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>

              </form>

              {status === 'success' && (
                <div className="mt-4 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest p-4 rounded-[4px] flex items-center gap-3 border-l-4 border-green-500">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}

            </div>

          </div>

          {/* Map Section */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-[#121212]/5 rounded-[4px] overflow-hidden pointer-events-none">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.1234567890123!2d80.12345678901234!3d28.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDAnNDQuNCJOIDgwwrA3JzI0LjQiIkU!5e0!3m2!1sen!2snp!4v1234567890123"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full pointer-events-auto"
              />
            </div>
            <div className="text-center mt-4">
              <a 
                href="https://maps.app.goo.gl/wnT364rpT3dJE1gu7"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#121212]/70 hover:text-[#FE5733] font-bold uppercase tracking-widest transition-colors"
              >
                Open in Google Maps
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
