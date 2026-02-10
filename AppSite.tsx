
import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Rocket, ShieldCheck, ArrowRight, BarChart3, Users2, Globe, Linkedin, Instagram, Facebook, Mail, Zap, CheckCircle2, ExternalLink, Cpu
} from 'lucide-react';

const Navbar = ({ onEnterPortal }: { onEnterPortal?: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass-nav py-4">
    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-black">S</div>
        <span className="font-grotesk font-bold text-xl tracking-tight">Synckraft.</span>
      </div>
      <div className="hidden md:flex items-center gap-10">
        <a href="#ventures" className="text-sm font-semibold hover:text-brand-blue transition-colors">Our Ventures</a>
        <a href="#pillars" className="text-sm font-semibold hover:text-brand-blue transition-colors">Pillars</a>
        <a href="#about" className="text-sm font-semibold hover:text-brand-blue transition-colors">About</a>
        <button onClick={onEnterPortal} className="bg-brand-blue text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-brand-dark transition-all">Portal Access</button>
      </div>
    </div>
  </nav>
);

export default function SynckraftSite({ onEnterPortal }: { onEnterPortal?: () => void }) {
  return (
    <div className="font-inter bg-white selection:bg-brand-blue/10">
      <Navbar onEnterPortal={onEnterPortal} />
      
      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 -skew-x-12 translate-x-32 hidden lg:block" />
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-brand-blue px-4 py-2 rounded-full mb-8">
              <Zap size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Building Scalable Futures</span>
            </div>
            <h1 className="font-grotesk text-6xl md:text-8xl font-bold leading-[1.1] mb-8">
              Digital <br /><span className="text-brand-blue">Ventures.</span>
            </h1>
            <p className="text-lg text-brand-muted mb-10 max-w-xl leading-relaxed">
              Synckraft Technologies is a parent brand and venture studio dedicated to engineering scalable platforms that solve real-world complexities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={onEnterPortal} className="bg-brand-blue text-white px-10 py-5 rounded-full font-bold shadow-2xl shadow-brand-blue/30 flex items-center justify-center gap-3">
                Enter Network Portal <ArrowRight size={20} />
              </button>
            </div>
          </div>
          <div className="hidden lg:block animate-float">
             <div className="bg-white p-4 rounded-[3rem] shadow-2xl border border-slate-100">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" className="rounded-[2.5rem]" alt="Hero" />
             </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brand-dark text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white text-brand-dark rounded-xl flex items-center justify-center font-black">S</div>
              <span className="font-grotesk font-bold text-xl">Synckraft</span>
            </div>
            <p className="text-blue-100/60 text-sm max-w-sm">Building independent digital entities with a unified core methodology.</p>
            <div className="pt-6">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Leadership</p>
              <p className="text-xs font-bold">Founder: Talal Mohammad Adeel — Amravati</p>
              <p className="text-xs font-bold">Co-Founder: Asiya Shaikh — Amravati</p>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-6">
            <h4 className="font-black text-[10px] uppercase tracking-widest opacity-40">Contact Network</h4>
            <a href="mailto:synckraft.me@gmail.com" className="text-2xl font-bold hover:text-brand-accent transition-colors">synckraft.me@gmail.com</a>
            <div className="flex gap-4">
              <Linkedin className="opacity-60 hover:opacity-100 cursor-pointer" />
              <Instagram className="opacity-60 hover:opacity-100 cursor-pointer" />
              <Facebook className="opacity-60 hover:opacity-100 cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
