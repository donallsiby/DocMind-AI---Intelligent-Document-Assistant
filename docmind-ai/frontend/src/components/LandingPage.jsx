import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiHelpCircle } from 'react-icons/fi';
import { FaChartBar, FaChartLine, FaRobot, FaRegFileAlt } from 'react-icons/fa';

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | 'contact' | null

  return (
    <div className="min-h-screen bg-background text-text-primary transition-all duration-300">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer onOpenModal={setActiveModal} />

      <AnimatePresence>
        {activeModal && (
          <InfoModal 
            type={activeModal} 
            onClose={() => setActiveModal(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const PRESETS = [
  {
    question: "What was the Q3 revenue growth?",
    answer: "Based on the uploaded financial report, Q3 revenue grew by 18% year-over-year, reaching $4.2M compared to $3.5M in Q2.",
    source: "Financial Report Q3, Page 12"
  },
  {
    question: "Are there any risk factors mentioned?",
    answer: "Yes, the document outlines three primary risk factors: supply chain bottlenecks due to global inflation, cybersecurity vulnerability assessments (Page 8), and talent acquisition constraints in core engineering teams (Page 14).",
    source: "Annual Strategy Doc, Page 8, 14"
  },
  {
    question: "Summarize the next steps in section 4.",
    answer: "The immediate next steps are: 1) Roll out beta access to tier-1 enterprise customers by mid-September, 2) Transition primary databases to the staging region (Page 19), and 3) Kickoff the Q4 marketing review.",
    source: "Implementation Roadmap, Page 19"
  }
];

function InteractiveChatPreview() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [chatState, setChatState] = useState('idle'); // idle, thinking, answered
  const [typedText, setTypedText] = useState('');

  const handleAsk = () => {
    setChatState('thinking');
    setTypedText('');
    
    setTimeout(() => {
      setChatState('answered');
    }, 1200);
  };

  useEffect(() => {
    if (chatState === 'answered') {
      const fullText = PRESETS[activeIdx].answer;
      let currentLength = 0;
      setTypedText('');
      
      const interval = setInterval(() => {
        if (currentLength < fullText.length) {
          setTypedText(fullText.substring(0, currentLength + 1));
          currentLength++;
        } else {
          clearInterval(interval);
        }
      }, 15);
      
      return () => clearInterval(interval);
    }
  }, [chatState, activeIdx]);

  const handleCycleQuestion = (idx) => {
    setActiveIdx(idx);
    setChatState('idle');
    setTypedText('');
  };

  return (
    <div className="w-full max-w-md bg-card/85 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-xl transition-all duration-300">
      {/* File Tag */}
      <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
        <div className="flex items-center space-x-2 text-text-secondary text-sm">
          <FaRegFileAlt className="text-accent-teal h-4 w-4" />
          <span className="font-medium">demo_document.pdf</span>
        </div>
        <span className="text-xs bg-accent-teal/15 text-accent-teal px-2 py-0.5 rounded-full font-semibold">Active</span>
      </div>

      {/* Preset Selectors */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleCycleQuestion(idx)}
            className={`text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
              activeIdx === idx 
                ? 'bg-accent-teal text-background font-semibold shadow-md' 
                : 'bg-border/30 text-text-secondary hover:bg-border/55'
            }`}
          >
            Q{idx + 1}
          </button>
        ))}
      </div>

      {/* Chat Display Area */}
      <div className="space-y-4 min-h-[220px] flex flex-col justify-between">
        {/* User Question */}
        <div className="flex justify-end">
          <div className="bg-border/40 text-text-primary rounded-xl px-4 py-2.5 max-w-[85%] text-sm font-medium">
            {PRESETS[activeIdx].question}
          </div>
        </div>

        {/* Action Button / Answer Area */}
        <div className="flex-1 flex flex-col justify-center">
          {chatState === 'idle' && (
            <div className="text-center py-4">
              <button 
                onClick={handleAsk}
                className="btn-primary text-xs px-4 py-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
              >
                Click to Ask AI
              </button>
            </div>
          )}

          {chatState === 'thinking' && (
            <div className="flex items-center space-x-3 text-text-secondary text-sm py-4">
              <div className="h-5 w-5 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
              <span>DocMind AI is analyzing context...</span>
            </div>
          )}

          {chatState === 'answered' && (
            <div className="flex items-start space-x-3 text-sm">
              <div className="flex-shrink-0 h-8 w-8 bg-accent-teal/10 rounded-lg flex items-center justify-center border border-accent-teal/20">
                <FaRobot className="text-accent-teal h-4 w-4" />
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-text-primary leading-relaxed">{typedText}</p>
                {typedText.length === PRESETS[activeIdx].answer.length && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-accent-blue font-semibold flex items-center gap-1.5"
                  >
                    <span>Source:</span>
                    <span className="bg-accent-blue/10 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono">{PRESETS[activeIdx].source}</span>
                  </motion.p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-20 pb-32 bg-background overflow-hidden border-b border-border/10">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-teal/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Title & CTA */}
          <div className="text-left space-y-8 max-w-2xl">
            <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl lg:text-6xl tracking-tight leading-tight">
              Chat With Your <span className="text-accent-teal">Documents</span> Using AI
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary leading-relaxed">
              Upload your PDF, DOCX, or TXT documents and get instant, cited answers powered by advanced RAG technology. No more scrolling through pages - just ask and find insights instantly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/app" className="btn-primary flex items-center justify-center">
                Get Started Free
              </Link>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} 
                className="btn-secondary"
              >
                Learn More
              </button>
            </div>
          </div>
          
          {/* Right Column: Interactive Chat Preview */}
          <div className="relative flex justify-center lg:justify-end">
            <InteractiveChatPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background border-b border-border/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Streamlined RAG Features
          </h2>
          <p className="mt-4 text-text-secondary">
            Gain immediate command over your files with advanced processing and real-time insights.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<FiTrendingUp className="h-6 w-6 text-accent-teal" />}
            title="Instant Answers"
            description="Get instant answers from your documents using natural language. No more manual searching."
          />
          <FeatureCard
            icon={<FaChartLine className="h-6 w-6 text-accent-teal" />}
            title="Document Insights"
            description="Extract key insights, trends and patterns from complex documents automatically."
          />
          <FeatureCard
            icon={<FiUsers className="h-6 w-6 text-accent-teal" />}
            title="Team Collaboration"
            description="Share document insights with your team and collaborate in real-time."
          />
          <FeatureCard
            icon={<FaChartBar className="h-6 w-6 text-accent-teal" />}
            title="Secure & Private"
            description="Your documents are processed locally and never shared with third parties."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card p-6 border border-border/30 hover:border-accent-teal/40 transition-all duration-300 shadow-md bg-card"
    >
      <div className="flex items-center mb-4">
        <div className="p-2 bg-accent-teal/10 rounded-lg">
          {icon}
        </div>
        <h3 className="ml-3 text-lg font-semibold text-text-primary">{title}</h3>
      </div>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Simple 3-Step Integration
          </h2>
          <p className="mt-4 text-text-secondary">
            Process documents and query them inside our secure pipeline in seconds.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <StepCard
            number="1"
            title="Upload Your Document"
            description="Drag and drop your PDF, DOCX, or TXT file. Our AI processes and indexes the content."
            icon={<FaChartLine className="h-5 w-5 text-accent-teal" />}
          />
          <StepCard
            number="2"
            title="Ask Your Question"
            description="Ask any question about your document in plain English. Our RAG engine finds relevant context."
            icon={<FiHelpCircle className="h-5 w-5 text-accent-teal" />}
          />
          <StepCard
            number="3"
            title="Get Instant Answer"
            description="Receive accurate answers with source citations directly from your document."
            icon={<FaRobot className="h-5 w-5 text-accent-teal" />}
          />
        </div>
      </div>
    </section>
  );
}

function StepCard({ number, title, description, icon }) {
  return (
    <div className="glass-card p-6 border border-border/30 hover:border-accent-teal/20 transition-all duration-300 bg-card">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 h-10 w-10 bg-accent-teal/15 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <span className="ml-3 text-xs bg-border/50 text-text-secondary px-2 py-0.5 rounded-full font-bold">Step {number}</span>
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Footer({ onOpenModal }) {
  return (
    <footer className="py-12 bg-card/40 border-t border-border/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-6 sm:mb-0">
            <p className="text-text-secondary text-sm">
              © 2024 DocMind AI. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6 text-sm">
            <button 
              onClick={() => onOpenModal('privacy')}
              className="text-text-secondary hover:text-accent-teal transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => onOpenModal('terms')}
              className="text-text-secondary hover:text-accent-teal transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => onOpenModal('contact')}
              className="text-text-secondary hover:text-accent-teal transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InfoModal({ type, onClose }) {
  const content = {
    privacy: {
      title: "Privacy Policy",
      text: "At DocMind AI, your privacy is our top priority. We implement high-grade encryption and secure access controls. All uploaded documents are processed securely and stored temporarily only to generate embeddings in your isolated vector database. Your raw data and query histories are never shared with third parties or used to train public LLMs. You retain complete ownership and control over your uploaded resources, and you can permanently delete them at any time."
    },
    terms: {
      title: "Terms of Service",
      text: "Welcome to DocMind AI. By accessing or using our document chat and analysis platform, you agree to comply with our conditions of use. You are responsible for ensuring that the files you upload do not violate copywritten materials, intellectual property rights, or privacy regulations. DocMind AI reserves the right to modify services, restrict usage rates, and clean up inactive document records to maintain server stability. The service is provided 'as is' without warranties of any kind."
    },
    contact: {
      title: "Contact Support",
      text: "Have questions, suggestions, or technical inquiries? Our support team is here to help! You can reach us directly via support@docmind.ai or through our technical helpdesk. We welcome community feedback, integration requests, and security disclosures. Feedback is processed within 24-48 business hours."
    }
  }[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card max-w-lg w-full p-6 md:p-8 relative shadow-2xl bg-card border border-border"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-xl font-bold p-1 hover:bg-border/30 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold text-accent-teal mb-4">{content.title}</h3>
        <p className="text-text-secondary leading-relaxed text-sm md:text-base mb-6">
          {content.text}
        </p>
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="btn-primary text-xs px-5 py-2.5"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}