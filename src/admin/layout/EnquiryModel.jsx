import { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  MessageSquare,
  Tag,
  Star,
  StarOff,
  Send,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Archive,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Light yellow + black theme for status
const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-yellow-100 text-black' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-200 text-black' },
  { value: 'responded', label: 'Responded', color: 'bg-yellow-50 text-black' },
  { value: 'converted', label: 'Converted', color: 'bg-yellow-300 text-black' },
  { value: 'closed', label: 'Closed', color: 'bg-black/5 text-black/70' },
  { value: 'spam', label: 'Spam', color: 'bg-red-100 text-red-800' },
];

// Light yellow + black theme for priority
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-black/5 text-black/70' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-black' },
  { value: 'high', label: 'High', color: 'bg-yellow-200 text-black' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

const RESPONSE_TYPES = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { value: 'meeting', label: 'Meeting', icon: Calendar },
  { value: 'other', label: 'Other', icon: FileText },
];

export default function EnquiryModal({
  enquiry,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onToggleStar,
  onArchive,
  loading = false,
}) {
  const [activeTab, setActiveTab] = useState('details');
  const [note, setNote] = useState('');
  const [response, setResponse] = useState({ type: 'email', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset state when enquiry changes
  useEffect(() => {
    if (enquiry) {
      setActiveTab('details');
      setNote('');
      setResponse({ type: 'email', content: '' });
      setShowDeleteConfirm(false);
    }
  }, [enquiry?._id]);

  if (!isOpen || !enquiry) return null;

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get time ago
  const getTimeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return formatDate(date);
  };

  // Copy to clipboard
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Handle status change
  const handleStatusChange = async (status) => {
    try {
      await onUpdate(enquiry._id, { status });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handle priority change
  const handlePriorityChange = async (priority) => {
    try {
      await onUpdate(enquiry._id, { priority });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handle add note
  const handleAddNote = async () => {
    if (!note.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(enquiry._id, { note: note.trim() });
      setNote('');
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle add response
  const handleAddResponse = async () => {
    if (!response.content.trim()) {
      toast.error('Please enter response details');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(enquiry._id, {
        response: {
          type: response.type,
          content: response.content.trim(),
        },
      });
      setResponse({ type: 'email', content: '' });
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete(enquiry._id);
      onClose();
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Send WhatsApp
  const sendWhatsApp = () => {
    if (!enquiry.phone) return;
    const message = `Hi ${enquiry.name},\n\nThank you for your enquiry regarding "${enquiry.subject}".\n\nWe have received your message and will get back to you shortly.\n\nBest regards,\nYash Engineering`;
    window.open(
      `https://wa.me/${enquiry.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
        message
      )}`,
      '_blank'
    );
  };

  // Send Email
  const sendEmail = () => {
    if (!enquiry.email) return;
    const subject = `Re: ${enquiry.subject}`;
    const body = `Dear ${enquiry.name},\n\nThank you for contacting us.\n\n`;
    window.open(
      `mailto:${enquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`,
      '_blank'
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return option || STATUS_OPTIONS[0];
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const option = PRIORITY_OPTIONS.find((p) => p.value === priority);
    return option || PRIORITY_OPTIONS[1];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Centered Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-yellow-50 border border-yellow-200 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-200 bg-yellow-100/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                !enquiry.isRead ? 'bg-yellow-500' : 'bg-black/30'
              }`}
            />
            <h2 className="text-lg font-semibold text-black">
              Enquiry Details
            </h2>
            <span className="text-sm text-black/60">
              #{enquiry._id?.slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStar?.(enquiry._id)}
              className={`p-2 rounded-full border border-transparent transition-colors ${
                enquiry.isStarred
                  ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                  : 'text-black/40 hover:text-yellow-500 hover:bg-yellow-100'
              }`}
            >
              {enquiry.isStarred ? (
                <Star className="w-5 h-5 fill-current" />
              ) : (
                <StarOff className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => onArchive?.(enquiry._id)}
              className="p-2 text-black/50 hover:text-black hover:bg-yellow-100 rounded-full transition-colors"
              title="Archive"
            >
              <Archive className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-black/50 hover:text-black hover:bg-yellow-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-yellow-50/80 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-yellow-200 bg-yellow-50 px-6">
          {['details', 'notes', 'responses', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-yellow-500 text-black'
                  : 'border-transparent text-black/60 hover:text-black'
              }`}
            >
              {tab}
              {tab === 'notes' && enquiry.notes?.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-black/70 text-xs rounded">
                  {enquiry.notes.length}
                </span>
              )}
              {tab === 'responses' && enquiry.responseHistory?.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-black/70 text-xs rounded">
                  {enquiry.responseHistory.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-0 text-black">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Status & Priority */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-xs font-medium text-black/60 mb-1">
                    Status
                  </label>
                  <select
                    value={enquiry.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${getStatusBadge(enquiry.status).color}`}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-black/60 mb-1">
                    Priority
                  </label>
                  <select
                    value={enquiry.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${getPriorityBadge(enquiry.priority).color}`}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-black/60 mb-1">
                    Source
                  </label>
                  <span className="px-3 py-1.5 bg-yellow-100 text-black rounded-lg text-sm inline-block">
                    {enquiry.source || 'Website'}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-yellow-50 rounded-xl p-4 space-y-3 border border-yellow-200">
                <h3 className="font-semibold text-black flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contact Information
                </h3>

                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Name */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-yellow-100">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-black/40" />
                      <span className="text-black">{enquiry.name}</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-yellow-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 text-black/40 flex-shrink-0" />
                      <a
                        href={`mailto:${enquiry.email}`}
                        className="text-black hover:underline truncate"
                      >
                        {enquiry.email}
                      </a>
                    </div>
                    <button
                      onClick={() => copyToClipboard(enquiry.email, 'email')}
                      className="p-1 text-black/40 hover:text-black/70"
                    >
                      {copiedField === 'email' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-yellow-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-black/40" />
                      <a
                        href={`tel:${enquiry.phone}`}
                        className="text-black hover:underline"
                      >
                        {enquiry.phone}
                      </a>
                    </div>
                    <button
                      onClick={() => copyToClipboard(enquiry.phone, 'phone')}
                      className="p-1 text-black/40 hover:text-black/70"
                    >
                      {copiedField === 'phone' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Company */}
                  {enquiry.company && (
                    <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-yellow-100">
                      <Building className="w-4 h-4 text-black/40" />
                      <span className="text-black">{enquiry.company}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject & Message */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-black/60 mb-1">
                    Subject
                  </label>
                  <p className="text-black font-medium">{enquiry.subject}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-black/60 mb-1">
                    Message
                  </label>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-black/80 whitespace-pre-wrap">
                      {enquiry.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="flex flex-wrap gap-4 text-sm text-black/60">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Received: {formatDate(enquiry.createdAt)}
                </div>
                {enquiry.firstResponseAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    First Response: {formatDate(enquiry.firstResponseAt)}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-yellow-200">
                {enquiry.phone && (
                  <button
                    onClick={sendWhatsApp}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    WhatsApp
                  </button>
                )}
                {enquiry.email && (
                  <button
                    onClick={sendEmail}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-yellow-50 rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                )}
                {enquiry.phone && (
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-black rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note */}
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h3 className="font-semibold text-black mb-3">Add Note</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this enquiry..."
                  rows="3"
                  className="w-full px-3 py-2 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none text-black"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddNote}
                    disabled={!note.trim() || isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Add Note
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {enquiry.notes?.length > 0 ? (
                  enquiry.notes
                    .slice()
                    .reverse()
                    .map((note, index) => (
                      <div
                        key={note._id || index}
                        className="bg-white border border-yellow-200 rounded-lg p-4"
                      >
                        <p className="text-black/80">{note.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-black/60">
                          <span>{note.addedBy?.name || 'Admin'}</span>
                          <span>•</span>
                          <span>{getTimeAgo(note.addedAt)}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-black/50">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No notes yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Responses Tab */}
          {activeTab === 'responses' && (
            <div className="space-y-4">
              {/* Add Response */}
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h3 className="font-semibold text-black mb-3">
                  Record Response
                </h3>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-black/70 mb-1">
                    Response Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {RESPONSE_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() =>
                          setResponse((prev) => ({
                            ...prev,
                            type: type.value,
                          }))
                        }
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          response.type === type.value
                            ? 'bg-yellow-500 text-black'
                            : 'bg-white border border-yellow-200 text-black/70 hover:bg-yellow-50'
                        }`}
                      >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={response.content}
                  onChange={(e) =>
                    setResponse((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Describe the response or conversation..."
                  rows="3"
                  className="w-full px-3 py-2 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none text-black"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddResponse}
                    disabled={!response.content.trim() || isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Record Response
                  </button>
                </div>
              </div>

              {/* Response History */}
              <div className="space-y-3">
                {enquiry.responseHistory?.length > 0 ? (
                  enquiry.responseHistory
                    .slice()
                    .reverse()
                    .map((resp, index) => {
                      const typeInfo =
                        RESPONSE_TYPES.find((t) => t.value === resp.type) ||
                        RESPONSE_TYPES[4];
                      return (
                        <div
                          key={resp._id || index}
                          className="bg-white border border-yellow-200 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <typeInfo.icon className="w-4 h-4 text-black/40" />
                            <span className="font-medium text-black">
                              {typeInfo.label}
                            </span>
                          </div>
                          <p className="text-black/80">{resp.content}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-black/60">
                            <span>{resp.respondedBy?.name || 'Admin'}</span>
                            <span>•</span>
                            <span>{getTimeAgo(resp.respondedAt)}</span>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-8 text-black/50">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No responses recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-center py-8 text-black/50">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Activity history coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-yellow-200 px-6 py-4 bg-yellow-100/70">
          <div className="flex items-center justify-between">
            <div className="text-sm text-black/60">
              {getTimeAgo(enquiry.createdAt)}
            </div>

            <div className="flex items-center gap-3">
              {showDeleteConfirm ? (
                <>
                  <span className="text-sm text-red-600">
                    Delete this enquiry?
                  </span>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 text-black/70 hover:bg-yellow-100 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Confirm
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-black text-yellow-50 rounded-lg hover:bg-gray-900 transition-colors text-sm"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.97);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}