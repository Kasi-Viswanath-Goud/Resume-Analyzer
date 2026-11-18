import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { useStorage, type KVItem } from "~/lib/storage";
import ResumeCard from "~/components/ResumeCard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResuScore - AI-Powered ATS Resume Checker & Optimizer" },
    { name: "description", content: "Scan your resume against ATS systems. Get instant AI-powered feedback, keyword optimization, and actionable tips to land more interviews. Free ATS resume checker - no login required." },
    { property: "og:title", content: "ResuScore - AI-Powered ATS Resume Checker" },
    { property: "og:description", content: "Get your resume past ATS filters and into recruiters' hands. Instant AI analysis, keyword matching, and personalized improvements. No account needed." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "ResuScore - AI-Powered ATS Resume Checker" },
    { name: "twitter:description", content: "Scan your resume against ATS systems. Get instant AI-powered feedback and land more interviews. Free, no login required." },
  ];
}

const TrustBadges = () => (
  <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 opacity-60 hover:opacity-100 transition-opacity">
    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Trusted by job seekers at</span>
    <div className="flex items-center gap-4 md:gap-6">
      {["Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix"].map((company) => (
        <span key={company} className="font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors text-sm">
          {company}
        </span>
      ))}
    </div>
  </div>
);

const Hero = () => (
  <section className="relative pt-20 md:pt-28 lg:pt-36 pb-16 md:pb-24 overflow-hidden">
    <div className="container mx-auto px-4 md:px-8 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] text-sm font-medium mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute top-0 left-0 h-full w-full rounded-full bg-[var(--color-brand-500)]"></span>
            <span className="relative h-full w-full rounded-full bg-[var(--color-brand-500)]"></span>
          </span>
          New: AI Resume Grader with Job Match Analysis
        </div>

        {/* Headline */}
        <h1 className="text-gradient-hero mb-4 animate-slide-up stagger-1">
          Get Past ATS Filters &<br />
          <span className="text-gradient-brand">Land More Interviews</span>
        </h1>

        {/* Hero Sub-headline */}
        <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)] mb-6 animate-slide-up stagger-2 max-w-2xl mx-auto">
          Missing Keywords Costing You Interviews? Find Out in 30 Seconds
        </h2>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 animate-slide-up stagger-3">
          Upload your resume and job description. Our AI simulates real ATS scans, identifies missing keywords,
          and gives you a personalized roadmap to optimize your resume for every application.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up stagger-4">
          <Link to="/upload" className="btn-primary btn-lg w-full sm:w-auto group">
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            Scan My Resume Free
          </Link>
          <Link to="#how-it-works" className="btn-outline btn-lg w-full sm:w-auto">
            How It Works
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm animate-fade-in stagger-5">
          <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
            <svg className="w-4 h-4 text-[var(--color-accent-500)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
            <svg className="w-4 h-4 text-[var(--color-accent-500)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Results in 30 seconds</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
            <svg className="w-4 h-4 text-[var(--color-accent-500)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>No account needed</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
            <svg className="w-4 h-4 text-[var(--color-accent-500)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Private & secure</span>
          </div>
        </div>
      </div>

      {/* Hero Visual */}
      <div className="mt-16 relative animate-fade-in stagger-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-[var(--color-border-light)] overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-shrink-0 w-40 h-40 md:w-48 md:h-48 relative mx-auto lg:mx-0">
                  <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                    <defs>
                      <linearGradient id="heroScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#eef2ff" strokeWidth="8"/>
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="url(#heroScoreGradient)"
                      strokeWidth="8"
                      strokeDasharray="339.3"
                      strokeDashoffset="50.9"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl md:text-5xl font-display font-bold text-[var(--color-text-primary)]">87</span>
                    <span className="text-sm font-medium text-[var(--color-text-tertiary)]">/100</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">ATS Compatibility Breakdown</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Keyword Match", score: 92, color: "accent" },
                      { label: "Format & Structure", score: 88, color: "brand" },
                      { label: "Section Completeness", score: 85, color: "brand" },
                      { label: "Readability", score: 83, color: "warning" },
                    ].map((item) => (
                      <div key={item.label} className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[var(--color-text-secondary)]">{item.label}</span>
                          <span className="text-lg font-bold text-[var(--color-text-primary)]">{item.score}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill bg-[var(--color-brand-500)]" style={{ width: `${item.score}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-[var(--color-border-light)]">
                <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4">Top Improvements</h4>
                <div className="space-y-3">
                  {[
                    { type: "good", text: "Strong action verbs throughout experience section" },
                    { type: "improve", text: "Add 3-5 more job-specific keywords from the description" },
                    { type: "improve", text: "Quantify achievements with metrics (%, $, time saved)" },
                    { type: "good", text: "Clean, ATS-friendly single-column format" },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                      <svg className={`w-5 h-5 mt-0.5 shrink-0 ${tip.type === "good" ? "text-[var(--color-accent-500)]" : "text-[var(--color-warning-500)]"}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        {tip.type === "good" ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        ) : (
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        )}
                      </svg>
                      <p className="text-sm text-[var(--color-text-secondary)]">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-brand-100)] rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--color-accent-100)] rounded-full blur-3xl opacity-50 animate-pulse-soft" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[var(--color-brand-100)] to-[var(--color-accent-100)] rounded-full blur-3xl opacity-20"></div>
    </div>
  </section>
);

const Features = () => (
  <section id="features" className="section bg-[var(--color-bg-secondary)]">
    <div className="container mx-auto px-4 md:px-8">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h2 className="mb-4">Everything You Need to Optimize Your Resume</h2>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Powerful AI tools designed to help you pass ATS scans and impress recruiters.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            ),
            title: "ATS Simulation",
            description: "Our AI mimics how real Applicant Tracking Systems parse and score your resume, checking format, keywords, and structure.",
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            ),
            title: "Instant Keyword Analysis",
            description: "Compare your resume against any job description. Get a detailed match score and see exactly which keywords you're missing.",
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            ),
            title: "Detailed Score Breakdown",
            description: "See individual scores for Content, Structure, Skills, Tone & Style, and ATS Compatibility with specific improvement tips.",
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
            ),
            title: "Resume Upload & Parsing",
            description: "Drag & drop your PDF. We extract text, preserve formatting for preview, and analyze content instantly.",
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            ),
            title: "Actionable Recommendations",
            description: "Get prioritized, specific fixes with explanations. Know exactly what to change and why it matters for ATS.",
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            ),
            title: "Secure & Private",
            description: "Your resume data stays in your browser. No server uploads, no accounts, no tracking.",
          },
        ].map((feature, index) => (
          <article key={index} className="card p-6 md:p-8 group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-600)] flex items-center justify-center mb-6 group-hover:bg-[var(--color-brand-600)] group-hover:text-white transition-all duration-300">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">{feature.title}</h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">{feature.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section id="how-it-works" className="section">
    <div className="container mx-auto px-4 md:px-8">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h2 className="mb-4">How It Works</h2>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Get actionable resume feedback in three simple steps.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[
          {
            step: "01",
            title: "Upload & Target",
            description: "Drop your PDF resume and paste the job description you're targeting. Our AI extracts and analyzes your content instantly.",
            visual: (
              <div className="relative aspect-square bg-[var(--color-bg-secondary)] rounded-2xl flex items-center justify-center">
                <svg className="w-20 h-20 text-[var(--color-brand-300)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
              </div>
            ),
          },
          {
            step: "02",
            title: "AI Analysis",
            description: "Our engine simulates ATS parsing, checks keyword alignment, evaluates structure, and scores every critical dimension.",
            visual: (
              <div className="relative aspect-square bg-[var(--color-bg-secondary)] rounded-2xl flex items-center justify-center">
                <svg className="w-20 h-20 text-[var(--color-brand-300)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
            ),
          },
          {
            step: "03",
            title: "Optimize & Apply",
            description: "Receive a detailed report with scores, missing keywords, and prioritized fixes. Update your resume and apply with confidence.",
            visual: (
              <div className="relative aspect-square bg-[var(--color-bg-secondary)] rounded-2xl flex items-center justify-center">
                <svg className="w-20 h-20 text-[var(--color-brand-300)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            ),
          },
        ].map((step, index) => (
          <div key={index} className="relative text-center animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
            {index < 2 && (
              <div className="absolute top-[60px] left-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-[var(--color-brand-300)] to-transparent md:left-full z-0 hidden md:block" aria-hidden="true" />
            )}

            <div className="relative z-10">
              <span className="inline-block w-12 h-12 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-600)] font-display font-bold text-xl flex items-center justify-center mx-auto mb-6">
                {step.step}
              </span>
              {step.visual}
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mt-6 mb-3">{step.title}</h3>
              <p className="text-[var(--color-text-secondary)]">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-16 animate-fade-in stagger-4">
        <Link to="/upload" className="btn-primary btn-xl inline-flex">
          Start My Free Resume Scan
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </Link>
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section className="section bg-[var(--color-bg-secondary)]">
    <div className="container mx-auto px-4 md:px-8">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h2 className="mb-4">Trusted by Thousands of Job Seekers</h2>
        <p className="text-[var(--color-text-secondary)] text-lg">
          See how ResuScore helped real people land interviews at top companies.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {[
          {
            quote: "ResuScore caught 12 missing keywords from the job description that I never would have noticed. My ATS score jumped from 64 to 91, and I got the interview at Stripe.",
            author: "Sarah Chen",
            role: "Frontend Engineer",
            company: "Stripe",
            score: "91/100",
          },
          {
            quote: "The structure analysis showed me my resume had the right experience but in the wrong format. After reorganizing sections, I got 3 interviews in 2 weeks.",
            author: "Marcus Johnson",
            role: "Product Manager",
            company: "Airbnb",
            score: "88/100",
          },
          {
            quote: "As a career switcher, I didn't know which keywords mattered. ResuScore's skill gap analysis was exactly what I needed to translate my experience.",
            author: "Emily Rodriguez",
            role: "Data Analyst",
            company: "Shopify",
            score: "85/100",
          },
        ].map((testimonial, index) => (
          <article key={index} className="card-elevated p-8 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center gap-1 mb-6" aria-label="Rating: 5 out of 5 stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-[var(--color-warning-400)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">"{testimonial.quote}"</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-accent-400)] flex items-center justify-center text-white font-semibold text-lg">
                {testimonial.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">{testimonial.author}</p>
                <p className="text-sm text-[var(--color-text-tertiary)]">{testimonial.role} at {testimonial.company}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--color-border-light)]">
              <span className="badge-success">Final Score: {testimonial.score}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const Pricing = () => (
  <section id="pricing" className="section">
    <div className="container mx-auto px-4 md:px-8">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h2 className="mb-4">Completely Free</h2>
        <p className="text-[var(--color-text-secondary)] text-lg">
          No hidden fees, no subscriptions, no limits. Just powerful AI resume analysis.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="card-elevated p-8 md:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-100)] text-[var(--color-accent-600)] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-[var(--color-text-primary)] mb-4">Free Forever</h3>
          <p className="text-[var(--color-text-secondary)] text-lg mb-8">
            Unlimited resume scans, detailed feedback, and keyword analysis — all at no cost.
          </p>
          <ul className="space-y-3 mb-8 text-left max-w-md mx-auto" role="list">
            {[
              "Unlimited resume scans per month",
              "ATS compatibility scoring",
              "Keyword gap analysis",
              "Detailed section breakdowns",
              "Actionable improvement tips",
              "PDF upload support (up to 20MB)",
              "No account required",
              "Data stays in your browser",
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <svg className="w-5 h-5 text-[var(--color-accent-500)] shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <Link to="/upload" className="btn-primary btn-xl inline-flex w-full sm:w-auto">
            Start Free Scan
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const FAQ = () => (
  <section id="faq" className="section bg-[var(--color-bg-secondary)]">
    <div className="container mx-auto px-4 md:px-8">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h2 className="mb-4">Frequently Asked Questions</h2>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Everything you need to know about ResuScore.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <dl className="space-y-4">
          {[
            {
              question: "How does the ATS simulation work?",
              answer: "Our AI models how real Applicant Tracking Systems parse resumes — checking file format compatibility, keyword density, section headers, date formatting, and structural hierarchy. We then score your resume against the specific job description you provide.",
            },
            {
              question: "Do I need to create an account?",
              answer: "No! ResuScore works completely without an account. Just upload your resume and job description to get instant feedback. Your data stays in your browser's local storage.",
            },
            {
              question: "Is my resume data private and secure?",
              answer: "Yes. Your resume never leaves your browser. All processing happens locally using Web APIs. We don't upload, store, or see your resume content. You own your data completely.",
            },
            {
              question: "What file formats are supported?",
              answer: "Currently we support PDF files up to 20MB. PDF is the most ATS-friendly format and preserves your formatting for accurate analysis.",
            },
            {
              question: "How accurate is the keyword matching?",
              answer: "Our analysis uses advanced NLP to identify both exact keyword matches and semantic equivalents. We detect required skills, certifications, tools, and experience patterns from the job description and check for their presence in your resume.",
            },
            {
              question: "Can I use this for multiple job applications?",
              answer: "Absolutely. Each scan is tied to a specific job description. You can scan the same resume against different job postings to tailor it for each application. No limits on scans.",
            },
            {
              question: "What makes ResuScore different from other resume checkers?",
              answer: "Most tools only check formatting. ResuScore combines ATS simulation + semantic keyword analysis + section-by-section scoring + personalized explanations. We tell you not just what's wrong, but why it matters and how to fix it.",
            },
          ].map((faq, index) => (
            <div key={index} className="card overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:ring-0"
                aria-expanded="false"
              >
                <span className="font-medium text-[var(--color-text-primary)]">{faq.question}</span>
                <svg className="w-5 h-5 text-[var(--color-text-tertiary)] shrink-0 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <dd className="px-6 pb-4 text-[var(--color-text-secondary)] border-t border-[var(--color-border-light)]">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="section relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-600)] via-[var(--color-brand-700)] to-[var(--color-brand-800)]" aria-hidden="true"/>
    <div className="absolute inset-0 bg-[url('/images/bg-main.svg')] bg-cover opacity-10" aria-hidden="true"/>

    <div className="container mx-auto px-4 md:px-8 relative z-10">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-white mb-6">Ready to Optimize Your Resume?</h2>
        <p className="text-[var(--color-brand-100)] text-lg mb-8 max-w-xl mx-auto">
          Join thousands of job seekers who've improved their ATS scores and landed interviews at top companies.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/upload" className="btn-lg px-10 py-4 bg-white text-[var(--color-brand-600)] hover:bg-[var(--color-neutral-100)] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
            Scan My Resume Free
          </Link>
          <Link to="#features" className="btn-lg px-10 py-4 border-2 border-[var(--color-brand-200)] text-white hover:bg-[var(--color-brand-500)/10] font-semibold rounded-xl transition-all">
            Learn More
          </Link>
        </div>
        <p className="mt-6 text-[var(--color-brand-200)] text-sm">
          No credit card required · Results in 30 seconds · No account needed · Private & secure
        </p>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[var(--color-neutral-900)] text-[var(--color-neutral-300)]">
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
      <div className="grid md:grid-cols-4 gap-8 md:gap-12 mb-12">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-[var(--color-brand-300)] transition-colors mb-4" aria-label="ResuScore Home">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="currentColor"/>
              <path d="M8 12h16M8 16h12M8 20h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="font-display font-bold text-xl">ResuScore</span>
          </Link>
          <p className="max-w-xs text-[var(--color-neutral-400)] mb-6">
            AI-powered ATS resume checker helping job seekers get past automated filters and land more interviews.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[var(--color-neutral-400)] hover:text-white transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
            </a>
            <a href="#" className="text-[var(--color-neutral-400)] hover:text-white transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"/></svg>
            </a>
            <a href="#" className="text-[var(--color-neutral-400)] hover:text-white transition-colors" aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Product</h4>
          <nav aria-label="Product links">
            <ul className="space-y-2">
              {["ATS Resume Checker", "Keyword Analysis", "Resume Scoring", "How It Works", "FAQ"].map((item) => (
                <li key={item}><Link to="#" className="text-[var(--color-neutral-400)] hover:text-white transition-colors text-sm">{item}</Link></li>
              ))}
            </ul>
          </nav>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Resources</h4>
          <nav aria-label="Resource links">
            <ul className="space-y-2">
              {["Resume Guides", "ATS Tips", "Career Advice", "Interview Prep", "Salary Negotiation"].map((item) => (
                <li key={item}><Link to="#" className="text-[var(--color-neutral-400)] hover:text-white transition-colors text-sm">{item}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-[var(--color-neutral-800)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[var(--color-neutral-500)] text-sm">
          © {new Date().getFullYear()} ResuScore. All rights reserved.
        </p>
        <nav aria-label="Legal links" className="flex items-center gap-6">
          {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
            <Link key={item} to="#" className="text-[var(--color-neutral-500)] hover:text-white transition-colors text-sm">{item}</Link>
          ))}
        </nav>
      </div>
    </div>
  </footer>
);

export default function Home() {
  const { kv } = useStorage();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  // Load resumes from localStorage on mount
  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      try {
        const items = (await kv.list('resume:*', true)) as KVItem[] | undefined;
        if (!items || !Array.isArray(items)) {
          setResumes([]);
          setLoadingResumes(false);
          return;
        }

        const parsedResumes = items
          .map((item) => {
            try {
              return typeof item.value === 'string'
                ? (JSON.parse(item.value) as Resume)
                : (item.value as Resume);
            } catch (e) {
              console.error('Failed to parse resume item:', e);
              return null;
            }
          })
          .filter((r): r is Resume => Boolean(r && r.id));

        setResumes(parsedResumes);
      } catch (err) {
        console.error('Failed to load resumes:', err);
      } finally {
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, [kv]);

  const showLoading = loadingResumes;

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      <Navbar />
      <Hero />
      <TrustBadges />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </main>
  );
}
