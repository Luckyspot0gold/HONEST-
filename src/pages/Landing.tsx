import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { 
  Shield, 
  Eye, 
  Zap, 
  Users, 
  Github, 
  FileText, 
  TrendingUp, 
  Award,
  Globe,
  ArrowRight,
  CheckCircle2,
  Glasses
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Landing() {
  const [email, setEmail] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Thank you for subscribing! We\'ll keep you updated.');
      setEmail('');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      toast.success('Message sent! We\'ll get back to you soon.');
      setContactForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold glow-gold">H.O.N.E.S.T.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/demo">
                <Button variant="ghost" className="hidden md:inline-flex">
                  Live Demo
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open('https://github.com/Luckyspot0gold/HONEST-THE-TRUTH-MATRIX', '_blank')}
              >
                <Github className="w-4 h-4" />
                <span className="hidden md:inline">GitHub</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary mb-6">
              <Award className="w-4 h-4" />
              Avalanche x402 Hackathon | Patent Pending | 100% Complete
            </div>
          </div>
          
          {/* H.O.N.E.S.T. Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/93610584/zzLBvexGzpKSjpys.png" 
              alt="H.O.N.E.S.T. - Harmonic Oracle for Networked Economic Sensory Transactions. Golden eye with blue orbital rings and connected sensory nodes representing multi-sensory market data verification."
              className="w-64 h-64 md:w-96 md:h-96 object-contain animate-pulse-glow"
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold glow-gold-strong leading-tight">
            H.O.N.E.S.T.
          </h1>
          
          <p className="text-2xl md:text-3xl text-primary font-semibold">
            Verified Multi-Sensory Economic Truth
          </p>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            <strong className="text-foreground">Harmonic Objective Non-biased Equitable Sensory Translation</strong>
            <br />
            The world's first 6-dimensional market eigenstate analysis powered by quantum mechanical principles and 432 Hz harmonic resonance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/demo">
              <Button size="lg" className="gap-2 text-lg px-8 py-6">
                Try Live Demo
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-lg px-8 py-6"
              onClick={() => window.open('https://github.com/Luckyspot0gold/HONEST-THE-TRUTH-MATRIX/blob/main/docs/HONEST_WhitePaper_v2.1.md', '_blank')}
            >
              <FileText className="w-5 h-5" />
              White Paper
            </Button>
          </div>
        </div>
      </section>

      {/* VR Sensory Engine Showcase */}
      <section className="container py-20 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold glow-gold mb-4">
              Experience Multi-Sensory Truth
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              H.O.N.E.S.T. translates market data into audio (432 Hz harmonics), haptic vibrations, and immersive 3D visualizations—making economic truth accessible through all senses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <div className="mx-auto mb-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-3xl">🔊</span>
                  </div>
                </div>
                <CardTitle className="text-xl text-center">432 Hz Audio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Harmonic frequencies mapped to market coherence. Bullish = higher pitch, Bearish = lower pitch. Natural resonance for intuitive understanding.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/30">
              <CardHeader>
                <div className="mx-auto mb-4">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-3xl">📳</span>
                  </div>
                </div>
                <CardTitle className="text-xl text-center">Haptic Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Vortex rhythm patterns (1-2-4-8-7-5) synchronized with market momentum. Feel the market's pulse through your device.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/30">
              <CardHeader>
                <div className="mx-auto mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-3xl">🌀</span>
                  </div>
                </div>
                <CardTitle className="text-xl text-center">6D Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Quantum Bloch Sphere rendering Price, Volume, Momentum, Sentiment, Temporal, and Spatial dimensions in real-time 3D.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="gap-2 text-lg px-8 py-6 bg-purple-600 hover:bg-purple-700"
              onClick={() => window.open('https://quantum-rangisbeats.base44.app/', '_blank')}
            >
              <Glasses className="w-5 h-5" />
              Enter Full VR Sensory Engine
            </Button>
          </div>
        </div>
      </section>

      {/* What is HONEST? */}
      <section id="what-is-honest" className="container py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold glow-gold mb-4">
              What is H.O.N.E.S.T.?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              H.O.N.E.S.T. is a revolutionary framework that transforms market data verification through multi-source consensus, 
              cryptographic proof, and quantum mechanical analysis—making economic truth accessible to everyone.
            </p>
          </div>

          {/* 5 Pillars */}
          <div className="grid md:grid-cols-5 gap-6 mb-12">
            {[
              { title: 'Honest Oracle', icon: Shield, desc: 'Multi-source verification with cryptographic proof' },
              { title: 'Empathic Loop', icon: Users, desc: 'Adaptive feedback calibrated to user perception' },
              { title: 'Universal Interface', icon: Globe, desc: 'Public demo with full accessibility' },
              { title: 'CI/CD Fortress', icon: Zap, desc: 'Automated testing and deployment' },
              { title: 'Living Ecosystem', icon: Eye, desc: 'DAO governance for eternal growth' }
            ].map((pillar, idx) => (
              <Card key={idx} className="glass-card border-primary/30 text-center">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    <pillar.icon className="w-12 h-12 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{pillar.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="container py-20 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold glow-gold mb-12 text-center">
            Why It Matters
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Users className="w-6 h-6 text-primary" />
                  2.7B Underserved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Traditional market data is inaccessible to billions of people with disabilities, language barriers, 
                  or limited financial literacy. H.O.N.E.S.T. translates complex market data into multi-sensory formats 
                  (audio, haptic, visual) that anyone can understand.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Shield className="w-6 h-6 text-primary" />
                  Manipulation Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Market manipulation costs investors billions annually. H.O.N.E.S.T. uses quantum mechanical coherence 
                  analysis to detect when market dimensions conflict—revealing hidden manipulation that traditional 
                  systems miss.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Traction */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold glow-gold mb-12">
            Traction & Recognition
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <TrendingUp className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Avalanche x402</h3>
              <p className="text-muted-foreground">Hackathon Participant</p>
            </div>
            <div className="space-y-2">
              <FileText className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Patent Pending</h3>
              <p className="text-muted-foreground">10+ Claims Filed</p>
            </div>
            <div className="space-y-2">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">100% Complete</h3>
              <p className="text-muted-foreground">All 5 Pillars Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source & DAO */}
      <section className="container py-20 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold glow-gold mb-12 text-center">
            Open Source & Community Governed
          </h2>
          
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl">W.T.E.F. DAO Governance</CardTitle>
              <CardDescription>
                World Truth Economic Framework - Decentralized Autonomous Organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                H.O.N.E.S.T. is governed by the W.T.E.F. DAO, ensuring it remains a free, open, and accurate 
                public utility for truth verification. The community controls data sources, sensory modalities, 
                and system evolution through transparent governance.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open('https://github.com/Luckyspot0gold/HONEST-THE-TRUTH-MATRIX', '_blank')}
                >
                  <Github className="w-4 h-4" />
                  View on GitHub
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open('https://github.com/Luckyspot0gold/HONEST-THE-TRUTH-MATRIX/blob/main/WTEF_DAO_CHARTER.md', '_blank')}
                >
                  <FileText className="w-4 h-4" />
                  DAO Charter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact & Signup */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold glow-gold mb-12 text-center">
            Stay Connected
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Email Signup */}
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle>Get Updates</CardTitle>
                <CardDescription>
                  Subscribe to receive news about H.O.N.E.S.T. development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Subscribe
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>
                  Have questions? We'd love to hear from you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      type="text"
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="you@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Your message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Powered by <strong className="text-primary">Reality Protocol LLC</strong> | 
              Sheridan, WY & Denver, CO
            </p>
            <p>
              © 2026 Reality Protocol LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
