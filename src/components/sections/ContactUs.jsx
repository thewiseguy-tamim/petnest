import React, { useState } from 'react';
import { Mail, MapPin, Phone, PawPrint } from 'lucide-react';

const COLORS = {
  text: '#1a1a2e',
  background: '#fafaf5',
  primary: '#2bb673',
  secondary: '#f4ecd2',
  accent: '#5b4b8b',
};

const ContactUs = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [hovered, setHovered] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setForm({ name: '', email: '', phone: '', message: '' });
      alert('Message sent! 🐾');
    }, 1200);
  };

  const getInputStyle = (name) => ({
    width: '100%',
    padding: '14px 16px',
    marginTop: 8,
    marginBottom: 18,
    borderRadius: 12,
    border: `1.5px solid ${focusedField === name ? COLORS.primary : '#e9e9e9'}`,
    background: '#fff',
    fontSize: 16,
    color: COLORS.text,
    outline: 'none',
    boxShadow: focusedField === name ? '0 0 0 6px rgba(43,182,115,0.12)' : 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  });

  const labelStyle = {
    color: COLORS.text,
    fontWeight: 600,
    fontSize: 14,
    display: 'block',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, rgba(244,236,210,0.45) 0%, ${COLORS.background} 60%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: '65%',
          background: 'transparent',
          borderRadius: 28,
          boxShadow: '0 12px 48px rgba(26,26,46,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Left: Contact Info / Theme */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.secondary} 0%, #fff4d9 100%)`,
            padding: '56px 40px',
            width: '40%',
            minWidth: 300,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderTopLeftRadius: 28,
            borderBottomLeftRadius: 28,
            position: 'relative',
          }}
        >
          {/* Decorative paw badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: '#fff',
              color: COLORS.accent,
              borderRadius: 999,
              padding: '10px 14px',
              boxShadow: '0 8px 24px rgba(91,75,139,0.12)',
              marginBottom: 24,
              width: 'fit-content',
            }}
          >
            <PawPrint size={18} />
            <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.accent }}>Adopt Love</span>
          </div>

          <h2
            style={{
              color: COLORS.text,
              fontWeight: 800,
              fontSize: 28,
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Contact Us
          </h2>
          <p style={{ color: COLORS.text, opacity: 0.8, marginBottom: 28 }}>
            We’re here to help you find your new best friend. Reach out with any
            questions about adoption, fostering, or volunteering.
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
            <Mail size={22} style={{ color: COLORS.text }} />
            <div>
              <div style={{ fontWeight: 600, color: COLORS.text }}>Chat with us</div>
              <div style={{ fontSize: 15, color: COLORS.text, opacity: 0.8 }}>
                pawshelter@example.com
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
            <MapPin size={22} style={{ color: COLORS.text }} />
            <div>
              <div style={{ fontWeight: 600, color: COLORS.text }}>Shelter</div>
              <div style={{ fontSize: 15, color: COLORS.text, opacity: 0.8 }}>
                4517 Washington Ave. Manchester,<br />
                Kentucky 39495
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <Phone size={22} style={{ color: COLORS.text }} />
            <div>
              <div style={{ fontWeight: 600, color: COLORS.text }}>Phone</div>
              <div style={{ fontSize: 15, color: COLORS.text, opacity: 0.8 }}>
                (704) 555-0127
              </div>
            </div>
          </div>

          {/* subtle pawprint in corner */}
          <PawPrint
            size={120}
            style={{
              position: 'absolute',
              bottom: -10,
              right: -10,
              opacity: 0.06,
              color: COLORS.accent,
            }}
          />
        </div>

        {/* Right: Contact Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#ffffff',
            padding: '48px 40px',
            flex: 1,
            borderTopRightRadius: 28,
            borderBottomRightRadius: 28,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <PawPrint size={22} color={COLORS.primary} />
            <h2
              style={{
                color: COLORS.text,
                fontWeight: 800,
                fontSize: 28,
                margin: 0,
              }}
            >
              Get in Touch
            </h2>
          </div>
          <p
            style={{
              color: COLORS.text,
              opacity: 0.75,
              fontSize: 16,
              marginBottom: 24,
            }}
          >
            Questions about adoption or a specific pet? Send us a message and we’ll respond
            within 1–2 business days.
          </p>

          {/* Name */}
          <div>
            <label htmlFor="name" style={labelStyle}>
              Full Name <span style={{ color: COLORS.primary }}>*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="e.g., Alex Johnson"
              style={getInputStyle('name')}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" style={labelStyle}>
              Email Address <span style={{ color: COLORS.primary }}>*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="your@email.com"
              style={getInputStyle('email')}
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" style={labelStyle}>Phone Number</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              placeholder="(123) 456-7890"
              style={getInputStyle('phone')}
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" style={labelStyle}>
              Message <span style={{ color: COLORS.primary }}>*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              onFocus={() => setFocusedField('message')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="Tell us about the pet you’re interested in or how we can help."
              rows={5}
              style={{ ...getInputStyle('message'), resize: 'vertical', minHeight: 120 }}
            />
          </div>

          <small style={{ color: COLORS.text, opacity: 0.6, marginTop: -6, marginBottom: 10 }}>
            We’ll never share your information. Your privacy matters.
          </small>

          <button
            type="submit"
            disabled={isSubmitting}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              marginTop: 10,
              background: hovered ? '#26a667' : COLORS.primary,
              color: 'white',
              fontWeight: 700,
              letterSpacing: 0.3,
              fontSize: 17,
              border: 'none',
              borderRadius: 12,
              padding: '14px 16px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background 150ms ease, transform 80ms ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <PawPrint size={18} />
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;