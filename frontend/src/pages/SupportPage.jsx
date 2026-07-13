import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getTickets, createTicket } from '../services/api';
import {
  HiOutlineMail,
  HiOutlineBookOpen,
  HiOutlineChatAlt2,
  HiOutlineQuestionMarkCircle,
  HiOutlineTicket,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlinePlus,
} from 'react-icons/hi';

const SupportPage = () => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('technical');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await getTickets();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      toast.error('Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: 'How can I improve OCR extraction accuracy?',
      a: 'Ensure that the uploaded files are sharp and have a resolution of at least 150 DPI. Avoid crumples, shadow projections, or cutting off margins in photos. Uploading native digital PDF exports instead of scans/photos provides near 100% extraction accuracy.',
    },
    {
      q: 'My batch zip upload failed to process. Why?',
      a: 'Zip archives must contain only supported image formats (JPG, PNG, WEBP, TIFF) or PDF files. Ensure that the total zip archive size is under 50MB and that the zip file is not password-protected.',
    },
    {
      q: 'Can I integrate Escannora with my existing ERP?',
      a: 'Yes, Enterprise plan users have access to our REST API and outbound webhooks. You can set up endpoints to receive parsed JSON payloads instantly whenever a document status transitions to "completed".',
    },
    {
      q: 'How do I resolve duplicate invoice alerts?',
      a: 'If our pipeline parses an invoice with an invoice number and vendor combination that already exists in your workspace database, it flags it as a "Duplicate Alert" to prevent double-counting. You can manually delete the file if it is an accidental duplicate, or click edit to manually adjust the values.',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Please enter a subject and describe your issue.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await createTicket({
        subject,
        category,
        priority,
        message,
      });

      if (data.success) {
        setTickets([data.data, ...tickets]);
        toast.success('Support ticket submitted successfully! Check status below.');
        
        // Reset form
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to submit ticket. Please try again.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };



  const getPriorityBadge = (p) => {
    const cls =
      p === 'high'
        ? 'bg-red-50 text-red-700 border-red-200'
        : p === 'medium'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-50 text-slate-700 border-slate-200';
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize ${cls}`}>
        {p}
      </span>
    );
  };

  const getStatusBadge = (s) => {
    const cls =
      s === 'open'
        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize ${cls}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Support & Help Center</h2>
        <p className="text-sm text-slate-500 mt-1">
          Open a support ticket, browse documentation, or find solutions in our knowledge base.
        </p>
      </div>

      {/* Grid: Help Channels & Submit Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Channels & FAQs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Channels */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">Quick Channels</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  title: 'Email Support',
                  desc: 'support@escannora.com',
                  icon: HiOutlineMail,
                  color: 'text-indigo-600',
                  bg: 'bg-indigo-50',
                  action: () => window.open('mailto:support@escannora.com'),
                },
                {
                  title: 'API Reference',
                  desc: 'Read developer integration docs',
                  icon: HiOutlineBookOpen,
                  color: 'text-sky-600',
                  bg: 'bg-sky-50',
                  action: () => toast.success('Redirecting to API docs...'),
                },
                {
                  title: 'Live Chat',
                  desc: 'Average response time: 5 mins',
                  icon: HiOutlineChatAlt2,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                  action: () => toast.success('Connecting to support assistant...'),
                },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.title}
                    onClick={c.action}
                    className="glass-card p-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex items-center gap-3.5 cursor-pointer hover:-translate-y-0.5 active:scale-98 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${c.color}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800">{c.title}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5 truncate">{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Help Articles Accordion */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">Help Articles</h3>
            <div className="glass-card bg-white border border-slate-200 rounded-2xl p-4 divide-y divide-slate-100">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left font-bold text-slate-800 hover:text-indigo-600 text-xs transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <HiOutlineQuestionMarkCircle className="w-4 h-4 text-slate-400 shrink-0" />
                        {faq.q}
                      </span>
                      <span className="text-slate-400 font-bold ml-2">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="text-slate-500 text-[11px] mt-2 leading-relaxed pl-6">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Submission Form */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">Submit a Ticket</h3>
          <div className="glass-card bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Subject / Short Issue Summary
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Billing checkout error or low accuracy scan"
                    className="input-field"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="billing">Billing & Subscription</option>
                    <option value="technical">Technical Issue</option>
                    <option value="ocr_accuracy">OCR Accuracy</option>
                    <option value="api_integration">API & Integration</option>
                    <option value="feature_request">Feature Request</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="input-field"
                  >
                    <option value="low">Low - General query</option>
                    <option value="medium">Medium - Normal workflow error</option>
                    <option value="high">High - Production blocker</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Description of Issue
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail. If OCR related, please include the invoice reference number or upload details."
                  rows={5}
                  className="input-field resize-none"
                  required
                />
              </div>

              {/* Action */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <HiOutlinePlus className="w-5 h-5" /> Submit Support Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active tickets list */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <HiOutlineTicket className="w-5 h-5 text-indigo-600" />
          Active Support Tickets
        </h3>
        <div className="glass-card bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="table-container border-0 rounded-none">
            <table>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last Update</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-xs text-slate-400 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                        Loading tickets...
                      </div>
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-xs text-slate-400 font-semibold">
                      No active tickets found. Your support history is clear.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr
                      key={t.id}
                      className="transition-colors"
                    >
                      <td className="font-mono text-xs font-bold text-slate-800">{t.id}</td>
                      <td className="text-xs font-bold text-slate-700 max-w-sm truncate" title={t.subject}>
                        {t.subject}
                      </td>
                      <td className="text-xs text-slate-500 font-medium capitalize">{t.category}</td>
                      <td>{getPriorityBadge(t.priority)}</td>
                      <td>{getStatusBadge(t.status)}</td>
                      <td className="text-xs text-slate-400 whitespace-nowrap font-medium">{t.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
