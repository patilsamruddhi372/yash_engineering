import { useState, useCallback, useMemo } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  User,
  Building,
  Loader2,
  FileText
} from 'lucide-react';
import { enquiryAPI } from '../api/axios';
import { toast } from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});

  const contactInfo = useMemo(() => [
    { 
      icon: MapPin, 
      title: 'Visit Us', 
      details: ['Kupwad MIDC, Sangli', 'Maharashtra, India - 416436'] 
    },
    { 
      icon: Phone, 
      title: 'Call Us', 
      details: ['+91 9518764038', '+91 9325987121'] 
    },
    { 
      icon: Mail, 
      title: 'Email Us', 
      details: ['info@yashengineering.com', 'sales@yashengineering.com'] 
    },
    { 
      icon: Clock, 
      title: 'Working Hours', 
      details: ['Mon - Sat: 9:00 AM - 6:00 PM', 'Sunday: Closed'] 
    },
  ], []);

  const formFields = useMemo(() => [
    { 
      name: 'name', 
      label: 'Full Name', 
      type: 'text', 
      placeholder: 'John Doe', 
      icon: User, 
      required: true 
    },
    { 
      name: 'phone', 
      label: 'Phone Number', 
      type: 'tel', 
      placeholder: '+91 9518764038', 
      icon: Phone, 
      required: true 
    },
    { 
      name: 'email', 
      label: 'Email Address', 
      type: 'email', 
      placeholder: 'john@example.com', 
      icon: Mail, 
      required: true 
    },
    { 
      name: 'company', 
      label: 'Company Name', 
      type: 'text', 
      placeholder: 'Your Company (Optional)', 
      icon: Building, 
      required: false 
    },
  ], []);

  const phoneNumber = '+91 9518764038';
  const telNumber   = '+919518764038';

  // Validate form - memoized to avoid recalculations
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Pre-compute WhatsApp message template
  const getWhatsAppMessage = useCallback(() => {
    return `
🔔 *New Contact Enquiry*

👤 *Name:* ${formData.name}
📞 *Phone:* ${formData.phone}
📧 *Email:* ${formData.email}
🏢 *Company:* ${formData.company || "Not specified"}
📋 *Subject:* ${formData.subject}

💬 *Message:*
${formData.message || "No message provided"}

---
Sent from Yash Engineering Website
    `.trim();
  }, [formData]);

  // Send to WhatsApp - optimized
  const sendToWhatsApp = useCallback(() => {
    const number = '919518764038';
    const message = getWhatsAppMessage();
    
    // Use setTimeout to make this async so it doesn't block UI
    setTimeout(() => {
      window.open(
        `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
        '_blank'
      );
    }, 100);
  }, [getWhatsAppMessage]);

  // Optimized form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    // Validate
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Create submission data with default message
      const submissionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        subject: formData.subject,
        message: formData.message.trim() || "No additional details provided",
        source: 'Website Form',
      };

      // Submit to backend API
      const response = await enquiryAPI.createEnquiry(submissionData);

      if (response.success) {
        setSubmitStatus('success');
        toast.success('Thank you! Your enquiry has been submitted successfully.');

        // Send to WhatsApp asynchronously
        sendToWhatsApp();

        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          company: '',
          subject: '',
          message: '',
        });

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
      toast.error(error.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, validateForm, sendToWhatsApp]);

  // Optimized input change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  // Optimized focus handler
  const handleFocus = useCallback((fieldName) => {
    setFocusedField(fieldName);
  }, []);

  // Optimized blur handler
  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  // Optimized call now handler
  const handleCallNowClick = useCallback(() => {
    const confirmed = window.confirm(`Do you want to call ${phoneNumber}?`);
    if (confirmed) {
      window.location.href = `tel:${telNumber}`;
    }
  }, [phoneNumber, telNumber]);

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full text-sm font-semibold tracking-wide uppercase mb-4">
            <MessageSquare className="w-4 h-4" />
            Get In Touch
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a project in mind? We'd love to hear from you.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, i) => (
            <div 
              key={i} 
              className="group bg-white p-6 rounded-xl shadow-sm border-2 border-gray-200 hover:shadow-lg hover:border-yellow-400 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4 bg-yellow-50 text-yellow-600 group-hover:bg-gray-900 group-hover:text-yellow-500 transition-all duration-300">
                <info.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
              {info.details.map((d, j) => (
                <p key={j} className="text-gray-600 text-sm">{d}</p>
              ))}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-5 gap-12">

          {/* Map & Call to Action */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
              <div className="aspect-[4/3] relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30543.931498582955!2d74.61063848316932!3d16.876318121252556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc122dba88f97d3%3A0x363b3473824a0f15!2sMIDC%20Kupwad%2C%20Maharashtra%2C%20India!5e0!3m2!1sen!2sus!4v1766638038139!5m2!1sen!2sus"
                  className="absolute inset-0 pointer-events-none"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Location Map"
                />
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Our Location</h3>
                <p className="text-sm text-gray-600">Kupwad MIDC, Sangli</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 text-white border-2 border-yellow-500">
              <h3 className="text-xl font-bold mb-4">Need Immediate Assistance?</h3>
              <p className="text-gray-300 mb-6">
                Our team is available during business hours to help you.
              </p>

              {/* Call Now with confirmation */}
              <button
                type="button"
                onClick={handleCallNowClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-white transition duration-300"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-600" />
                Response Time
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                We typically respond to all enquiries within <strong>24-48 hours</strong>. 
                Your enquiry will be stored in our system and assigned to the relevant team member.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8 md:p-10 relative z-10">

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-start gap-3 animate-fadeIn">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Success!</h4>
                    <p className="text-green-700 text-sm">
                      Your enquiry has been submitted and will appear in our admin dashboard. 
                      We'll get back to you soon!
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3 animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                    <p className="text-red-700 text-sm">
                      Something went wrong. Please try again or contact us directly.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Name, Phone, Email, Company */}
                <div className="grid md:grid-cols-2 gap-6">
                  {formFields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      <div className="relative">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                          focusedField === field.name ? 'text-yellow-600' : 'text-gray-400'
                        }`}>
                          <field.icon className="w-5 h-5" />
                        </div>

                        <input
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          value={formData[field.name]}
                          required={field.required}
                          onFocus={() => handleFocus(field.name)}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition-all ${
                            errors[field.name]
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-gray-200 focus:border-yellow-400'
                          }`}
                        />
                      </div>

                      {errors[field.name] && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors[field.name]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'subject' ? 'text-yellow-600' : 'text-gray-400'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>

                    <input
                      type="text"
                      name="subject"
                      placeholder="e.g., Control Panel Quote Request"
                      value={formData.subject}
                      required
                      onFocus={() => handleFocus('subject')}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition-all ${
                        errors.subject
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-gray-200 focus:border-yellow-400'
                      }`}
                    />
                  </div>

                  {errors.subject && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message - Optional */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Message <span className="text-gray-400">(Optional)</span>
                  </label>

                  <div className="relative">
                    <div className={`absolute left-4 top-4 transition-colors ${
                      focusedField === 'message' ? 'text-yellow-600' : 'text-gray-400'
                    }`}>
                      <MessageSquare className="w-5 h-5" />
                    </div>

                    <textarea
                      name="message"
                      rows="5"
                      placeholder="Tell us about your project requirements (optional)..."
                      value={formData.message}
                      onFocus={() => handleFocus('message')}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none resize-none transition-all ${
                        errors.message
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-gray-200 focus:border-yellow-400'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-end mt-2">
                    <p className="text-sm text-gray-400">
                      {formData.message.length} / 5000
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> 
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> 
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Your enquiry will be saved in our system and sent to our team via WhatsApp
                </p>

              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}