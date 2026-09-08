import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon, CheckCircleOutlined } from "@mui/icons-material";

export const ContactSection: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setModalOpen(false);
        setFormData({ name: "", email: "", message: "" });
      }, 2000);
    }
  };

  return (
    <section id="contact" className="contact">
      <p className="section-label">Get in Touch</p>
      <h2>Visit Our Boutique</h2>
      <p className="contact-intro">
        Experience our collections in person. Our specialists are ready to help you find the perfect piece.
      </p>
      <div className="contact-grid">
        <div className="contact-item">
          <h4>Address</h4>
          <p>
            123 Elegance Avenue<br />
            New York, NY 10001
          </p>
        </div>
        <div className="contact-item">
          <h4>Hours</h4>
          <p>
            Mon - Sat: 10am - 7pm<br />
            Sunday: 12pm - 5pm
          </p>
        </div>
        <div className="contact-item">
          <h4>Contact</h4>
          <p>
            hello@dinorah.com<br />
            +1 (555) 123-4567
          </p>
        </div>
      </div>
      <a
        href="#contact"
        className="button button-gold"
        onClick={(e) => {
          e.preventDefault();
          setModalOpen(true);
        }}
      >
        Book an Appointment
      </a>

      {/* Appointment Consultation Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: "var(--background)",
              p: { xs: 2, sm: 3 },
              borderRadius: "12px",
            },
          },
        }}
      >
        <DialogTitle className="flex justify-between items-center pb-2">
          <div>
            <span className="font-serif text-2xl text-[#2E2420] block">
              Book a Private Appointment
            </span>
            <span className="text-xs text-[#8B7F76] font-sans uppercase tracking-wider">
              Consultation with our lead gemologist
            </span>
          </div>
          <IconButton onClick={() => setModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="pt-4">
          {submitted ? (
            <Alert
              icon={<CheckCircleOutlined fontSize="inherit" />}
              severity="success"
              sx={{
                bgcolor: "rgba(184, 147, 92, 0.12)",
                color: "#2E2420",
                border: "1px solid rgba(184, 147, 92, 0.3)",
                my: 2,
              }}
            >
              Thank you! Your appointment request has been confirmed. Our salon concierge will reach out to you.
            </Alert>
          ) : (
            <form id="appointment-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <TextField
                label="Your Full Name"
                required
                fullWidth
                size="small"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                label="Email Address"
                type="email"
                required
                fullWidth
                size="small"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <TextField
                label="Bespoke Request or Collection Inquiries"
                multiline
                rows={3}
                fullWidth
                size="small"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="e.g. Inquiring about custom engagement rings..."
              />
            </form>
          )}
        </DialogContent>

        <DialogActions className="p-4 pt-0">
          {!submitted && (
            <button
              type="submit"
              form="appointment-form"
              className="button button-gold w-full"
            >
              Confirm Appointment
            </button>
          )}
        </DialogActions>
      </Dialog>
    </section>
  );
};
