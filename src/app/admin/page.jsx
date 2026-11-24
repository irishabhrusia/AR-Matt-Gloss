'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ImageUploadField from '@/components/ImageUploadField';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aboutSubTab, setAboutSubTab] = useState('banner');
  const [homeSubTab, setHomeSubTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // Live real website preview iframe state & ref
  const iframeRef = useRef(null);
  const previewContainerRef = useRef(null);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [previewScale, setPreviewScale] = useState(0.48);
  const [iframeKey, setIframeKey] = useState(0);

  // Data states
  const [queries, setQueries] = useState([]);
  const [settings, setSettings] = useState(null);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [portfolioFilter, setPortfolioFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);

  // Modals
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Initial Data Fetching
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [resQueries, resSettings, resServices, resPortfolio, resReviews] = await Promise.all([
        fetch('/api/queries').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/services').then((r) => r.json()),
        fetch('/api/portfolio').then((r) => r.json()),
        fetch('/api/reviews').then((r) => r.json()),
      ]);

      if (resQueries.success) setQueries(resQueries.queries || []);
      if (resSettings.success) setSettings(resSettings.settings || {});
      if (resServices.success) setServices(resServices.services || []);
      if (resPortfolio.success) setPortfolio(resPortfolio.portfolio || []);
      if (resReviews.success) setReviews(resReviews.reviews || []);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute scale for live preview iframe
  useEffect(() => {
    const computeScale = () => {
      if (previewContainerRef.current) {
        const cw = previewContainerRef.current.clientWidth;
        if (cw > 0 && previewDevice === 'desktop') {
          setPreviewScale(Math.min(cw / 1200, 0.65));
        } else {
          setPreviewScale(1);
        }
      }
    };
    computeScale();
    const t = setTimeout(computeScale, 250);
    window.addEventListener('resize', computeScale);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', computeScale);
    };
  }, [previewDevice, activeTab]);

  // Sync settings to live iframe in real time
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'AR_ADMIN_SYNC',
        hero: settings?.hero,
        home: settings?.home,
      }, '*');
    }
  }, [settings]);

  // Auto-scroll iframe when changing sub-tab in Home section
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && (activeTab === 'home' || activeTab === 'hero')) {
      const targetMap = {
        hero: 'home',
        marquee: 'tr',
        services_portfolio: 'services',
        limewash: 'limewash',
        why_process: 'why',
        testimonials_contact: 'testimonials',
      };
      if (targetMap[homeSubTab]) {
        iframeRef.current.contentWindow.postMessage({
          type: 'AR_SCROLL_TO',
          target: targetMap[homeSubTab],
        }, '*');
      }
    }
  }, [homeSubTab, activeTab]);

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'AR_ADMIN_SYNC',
        hero: settings?.hero,
        home: settings?.home,
      }, '*');
      const targetMap = {
        hero: 'home',
        marquee: 'tr',
        services_portfolio: 'services',
        limewash: 'limewash',
        why_process: 'why',
        testimonials_contact: 'testimonials',
      };
      if (targetMap[homeSubTab]) {
        setTimeout(() => {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'AR_SCROLL_TO',
            target: targetMap[homeSubTab],
          }, '*');
        }, 400);
      }
    }
  };

  // Save Settings handler
  const handleSaveSettings = async (sectionName = 'Settings') => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${sectionName} successfully saved and published live to website!`);
      } else {
        alert('❌ Error saving: ' + data.error);
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  // Generic Setting Field Updater
  const updateSettingField = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev?.[section] || {}),
        [key]: value,
      },
    }));
  };

  // Home Nested Field Updater (Services, Portfolio, Limewash, Process, Testimonials, Contact)
  const updateHomeNestedField = (subSection, key, value) => {
    setSettings((prev) => ({
      ...prev,
      home: {
        ...(prev?.home || {}),
        [subSection]: {
          ...(prev?.home?.[subSection] || {}),
          [key]: value,
        },
      },
    }));
  };

  // Home Marquee Array Updater
  const updateHomeMarquee = (items) => {
    setSettings((prev) => ({
      ...prev,
      home: {
        ...(prev?.home || {}),
        marquee: items,
      },
    }));
  };

  // Home Why List Updater
  const updateHomeWhyList = (boxKey, items) => {
    setSettings((prev) => ({
      ...prev,
      home: {
        ...(prev?.home || {}),
        why: {
          ...(prev?.home?.why || {}),
          [boxKey]: items,
        },
      },
    }));
  };

  // Queries status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch('/api/queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setQueries((prev) => prev.map((q) => (q.id === id || q._id === id ? { ...q, status: newStatus } : q)));
        if (selectedLead && (selectedLead.id === id || selectedLead._id === id)) {
          setSelectedLead((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Delete Query
  const handleDeleteQuery = async (id) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await fetch(`/api/queries?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQueries((prev) => prev.filter((q) => q.id !== id && q._id !== id));
        if (selectedLead && (selectedLead.id === id || selectedLead._id === id)) {
          setSelectedLead(null);
        }
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Service toggle active
  const handleToggleService = async (svc) => {
    const updated = !svc.active;
    try {
      await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: svc._id || svc.id, slug: svc.slug, active: updated }),
      });
      setServices((prev) => prev.map((s) => (s.slug === svc.slug ? { ...s, active: updated } : s)));
    } catch (err) {
      alert('Failed to toggle service: ' + err.message);
    }
  };

  // Save Service (Create or Update)
  const handleSaveService = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const serviceData = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      sub: formData.get('sub'),
      desc: formData.get('desc'),
      kicker: formData.get('kicker'),
      startingPrice: formData.get('startingPrice'),
      heroImage: formData.get('heroImage'),
      features: (formData.get('features') || '').split('\n').filter(Boolean),
      active: formData.get('active') === 'on',
    };

    try {
      if (editingService) {
        await fetch('/api/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingService._id || editingService.id, ...serviceData }),
        });
        setServices((prev) => prev.map((s) => (s.slug === editingService.slug ? { ...s, ...serviceData } : s)));
      } else {
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData),
        });
        const json = await res.json();
        if (json.success) setServices((prev) => [...prev, json.service]);
      }
      setShowServiceModal(false);
      setEditingService(null);
    } catch (err) {
      alert('Error saving service: ' + err.message);
    }
  };

  // Delete Service
  const handleDeleteService = async (slug) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await fetch(`/api/services?slug=${slug}`, { method: 'DELETE' });
      setServices((prev) => prev.filter((s) => s.slug !== slug));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Toggle Portfolio active
  const handleTogglePortfolio = async (prj) => {
    const updated = !prj.active;
    try {
      await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prj._id || prj.id, active: updated }),
      });
      setPortfolio((prev) => prev.map((p) => ((p._id || p.id) === (prj._id || prj.id) ? { ...p, active: updated } : p)));
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  // Save Portfolio project
  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const prjData = {
      title: formData.get('title'),
      category: formData.get('category'),
      imgBefore: formData.get('imgBefore'),
      imgAfter: formData.get('imgAfter'),
      location: formData.get('location'),
      editorialNote: formData.get('editorialNote'),
      active: formData.get('active') === 'on',
    };

    try {
      if (editingPortfolio) {
        await fetch('/api/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPortfolio._id || editingPortfolio.id, ...prjData }),
        });
        setPortfolio((prev) => prev.map((p) => ((p._id || p.id) === (editingPortfolio._id || editingPortfolio.id) ? { ...p, ...prjData } : p)));
      } else {
        const res = await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prjData),
        });
        const json = await res.json();
        if (json.success) setPortfolio((prev) => [...prev, json.project]);
      }
      setShowPortfolioModal(false);
      setEditingPortfolio(null);
    } catch (err) {
      alert('Error saving project: ' + err.message);
    }
  };

  // Delete Portfolio
  const handleDeletePortfolio = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
      setPortfolio((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Toggle Review active
  const handleToggleReview = async (rev) => {
    const updated = !rev.active;
    try {
      await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rev._id || rev.id, active: updated }),
      });
      setReviews((prev) => prev.map((r) => ((r._id || r.id) === (rev._id || rev.id) ? { ...r, active: updated } : r)));
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  // Save Review
  const handleSaveReview = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const revData = {
      n: formData.get('n'),
      l: formData.get('l'),
      q: formData.get('q'),
      t: (formData.get('t') || '').split(',').map((x) => x.trim()).filter(Boolean),
      rating: Number(formData.get('rating') || 5),
      verified: formData.get('verified') === 'on',
      active: formData.get('active') === 'on',
    };

    try {
      if (editingReview) {
        await fetch('/api/reviews', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingReview._id || editingReview.id, ...revData }),
        });
        setReviews((prev) => prev.map((r) => ((r._id || r.id) === (editingReview._id || editingReview.id) ? { ...r, ...revData } : r)));
      } else {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(revData),
        });
        const json = await res.json();
        if (json.success) setReviews((prev) => [...prev, json.review]);
      }
      setShowReviewModal(false);
      setEditingReview(null);
    } catch (err) {
      alert('Error saving review: ' + err.message);
    }
  };

  // Delete Review
  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      setReviews((prev) => prev.filter((r) => (r._id || r.id) !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Filter Queries
  const filteredQueries = queries.filter((q) => {
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    const matchesService = serviceFilter === 'All' || q.service?.toLowerCase().includes(serviceFilter.toLowerCase());
    const matchesSearch =
      q.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.phone?.includes(searchQuery) ||
      q.postcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesService && matchesSearch;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Postcode', 'Service', 'Budget', 'Status', 'Notes'];
    const rows = filteredQueries.map((q) => [
      q.id || q._id,
      q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '',
      `"${(q.name || '').replace(/"/g, '""')}"`,
      `"${q.phone || ''}"`,
      `"${q.email || ''}"`,
      `"${q.postcode || ''}"`,
      `"${(q.service || '').replace(/"/g, '""')}"`,
      `"${(q.budget || '').replace(/"/g, '""')}"`,
      `"${q.status || 'New'}"`,
      `"${(q.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ar-matt-gloss-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Badge Colors
  const getStatusBadge = (st) => {
    switch (st) {
      case 'New':
        return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#f59e0b' };
      case 'Contacted':
        return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' };
      case 'Quote Sent':
        return { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff', dot: '#a855f7' };
      case 'Booked':
        return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', dot: '#22c55e' };
      default:
        return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', dot: '#94a3b8' };
    }
  };

  // Metric counts
  const totalLeads = queries.length;
  const newLeads = queries.filter((q) => q.status === 'New').length;
  const contactedLeads = queries.filter((q) => q.status === 'Contacted').length;
  const bookedLeads = queries.filter((q) => q.status === 'Booked').length;
  const activeServicesCount = services.filter((s) => s.active).length;
  const activePortfolioCount = portfolio.filter((p) => p.active).length;
  const totalReviewsCount = reviews.length;

  const primaryNavItems = [
    { id: 'dashboard', label: 'Dashboard Overview' },
    { id: 'inquiries', label: 'Inquiries & Leads', badge: newLeads },
    { id: 'services', label: 'Services Catalog', count: services.length },
    { id: 'portfolio', label: 'Portfolio Projects', count: portfolio.length },
    { id: 'reviews', label: 'Customer Reviews', count: reviews.length },
  ];

  const pageNavItems = [
    { id: 'home', label: 'Home Section', live: true },
    { id: 'about', label: 'About Us Editor', live: true },
    { id: 'footer', label: 'Footer Manager' },
    { id: 'settings', label: 'Site Settings & Media' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', maxHeight: '100vh', overflow: 'hidden', background: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* 1. Left Sidebar Navigation (Matching Reference Video Style - Fixed & Pinned) */}
      <aside style={{ width: '280px', minWidth: '280px', maxWidth: '280px', height: '100vh', maxHeight: '100vh', position: 'sticky', top: 0, left: 0, flexShrink: 0, background: '#ffffff', borderRight: '1px solid #eef2f6', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 14px rgba(0,0,0,0.03)', zIndex: 10 }}>
        {/* Brand Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ width: '42px', height: '42px', minWidth: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #c5a880 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#ffffff', fontSize: '1.15rem', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)', flexShrink: 0 }}>
            AR
          </div>
          <div style={{ minWidth: 0, textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', color: '#0f172a', whiteSpace: 'nowrap' }}>AR Admin Hub</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
              LUXURY DECORATORS
            </div>
          </div>
        </div>

        {/* Sidebar Menu Items - Clean Text-Only 1-Line Vertical Alignment */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto', width: '100%', boxSizing: 'border-box' }}>

          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid #fde68a' : '1px solid transparent',
                  background: isActive ? 'linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%)' : 'transparent',
                  color: isActive ? '#92400e' : '#475569',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(217, 119, 6, 0.08)' : 'none',
                }}
              >
                {/* Left-Aligned Label Text */}
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>

                {/* Right-Aligned Badges */}
                {item.badge > 0 && (
                  <span style={{ marginLeft: 'auto', flexShrink: 0, background: '#ef4444', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && !item.badge && (
                  <span style={{ marginLeft: 'auto', flexShrink: 0, background: isActive ? 'rgba(217, 119, 6, 0.15)' : '#f1f5f9', color: isActive ? '#b45309' : '#64748b', fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Section Divider & Left-Aligned Title */}
          <div style={{ padding: '0 16px', marginTop: '14px', marginBottom: '4px', textAlign: 'left' }}>
            <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '10px' }}></div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', textAlign: 'left' }}>
              Live Page Managers
            </span>
          </div>

          {pageNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid #fde68a' : '1px solid transparent',
                  background: isActive ? 'linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%)' : 'transparent',
                  color: isActive ? '#92400e' : '#475569',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(217, 119, 6, 0.08)' : 'none',
                }}
              >
                {/* Left-Aligned Label Text */}
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>

                {/* Right-Aligned Badges */}
                {item.live && (
                  <span style={{ marginLeft: 'auto', flexShrink: 0, background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                    ● Live
                  </span>
                )}
              </button>
            );
          })}

        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', color: '#0f172a', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #e2e8f0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              <span>Public Website</span>
            </div>
            <span>↗</span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#d97706', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
              A
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>AR Super Admin</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>admin@ar-mattandgloss.com</div>
            </div>
            <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
              ADMIN
            </span>
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <main style={{ flex: 1, height: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* Top Header Bar */}
        <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 9 }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              AR MATT &amp; GLOSS DECORATORS
            </div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'inquiries' && 'Inquiries & Customer Leads'}
              {activeTab === 'services' && 'Services Catalog Manager'}
              {activeTab === 'portfolio' && 'Portfolio & Projects Manager'}
              {activeTab === 'reviews' && 'Customer Reviews & Testimonials'}
              {(activeTab === 'home' || activeTab === 'hero') && 'Home Page Manager'}
              {activeTab === 'about' && 'About Us Content Editor'}
              {activeTab === 'footer' && 'Dynamic Footer Manager'}
              {activeTab === 'settings' && 'Global Site Settings & Contact'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={fetchAllData}
              title="Refresh Data"
              style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
            >
              🔄
            </button>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', position: 'relative' }}>
              🔔
              {newLeads > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', border: '2px solid #ffffff' }}></span>
              )}
            </div>
            <Link
              href="/"
              style={{ padding: '8px 16px', borderRadius: '8px', background: '#0f172a', color: '#ffffff', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 700 }}
            >
              View Live Site ↗
            </Link>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW                                 */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '26px' }}>

            {/* 1. Executive Welcome Banner (Luxury Styling) */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: '16px',
                padding: '24px 28px',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.12)',
                border: '1px solid #334155',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                    ● AR LUXURY CMS
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Live Synchronized</span>
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>
                  AR Matt &amp; Gloss Decorators
                </h2>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#cbd5e1', maxWidth: '580px', lineHeight: '1.5' }}>
                  Real-time business management hub. Monitor customer quote requests, update portfolio before/after galleries, and manage public website content seamlessly.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleExportCSV}
                  style={{ padding: '10px 18px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(4px)' }}
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={() => setActiveTab('inquiries')}
                  style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)' }}
                >
                  ✉️ View Leads ({totalLeads})
                </button>
              </div>
            </div>

            {/* 2. Quick Action Ribbon with Color Badges */}
            <div style={{ background: '#ffffff', padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                + QUICK ACTIONS:
              </span>
              <button
                onClick={() => { setEditingService(null); setShowServiceModal(true); }}
                style={{ padding: '7px 14px', borderRadius: '8px', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                🎨 + Add Service
              </button>
              <button
                onClick={() => { setEditingPortfolio(null); setShowPortfolioModal(true); }}
                style={{ padding: '7px 14px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                🖼️ + Add Portfolio Project
              </button>
              <button
                onClick={() => { setEditingReview(null); setShowReviewModal(true); }}
                style={{ padding: '7px 14px', borderRadius: '8px', background: '#fefce8', color: '#a16207', border: '1px solid #fef08a', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                ⭐ + Add Review
              </button>
              <button
                onClick={() => setActiveTab('home')}
                style={{ padding: '7px 14px', borderRadius: '8px', background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                🏠 Edit Home Section
              </button>
              <button
                onClick={() => setActiveTab('about')}
                style={{ padding: '7px 14px', borderRadius: '8px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                ℹ️ Edit About Us
              </button>
            </div>

            {/* 3. Six Colorful Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>

              {/* Card 1: New Leads */}
              <div style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 40%)', borderRadius: '14px', padding: '18px 20px', border: '1px solid #fde68a', borderTop: '3px solid #f59e0b', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>NEW LEADS</span>
                  <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid #fde68a' }}>✉️</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#92400e' }}>{newLeads}</div>
                <div style={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 700 }}>Awaiting response</div>
              </div>

              {/* Card 2: Total Leads */}
              <div style={{ background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 40%)', borderRadius: '14px', padding: '18px 20px', border: '1px solid #bfdbfe', borderTop: '3px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>TOTAL LEADS</span>
                  <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid #bfdbfe' }}>📈</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e40af' }}>{totalLeads}</div>
                <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 700 }}>Total quote requests</div>
              </div>

              {/* Card 3: Booked Jobs */}
              <div style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 40%)', borderRadius: '14px', padding: '18px 20px', border: '1px solid #bbf7d0', borderTop: '3px solid #10b981', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>BOOKED JOBS</span>
                  <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid #bbf7d0' }}>✅</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#065f46' }}>{bookedLeads}</div>
                <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>Confirmed decorating</div>
              </div>

              {/* Card 4: Services */}
              <div style={{ background: 'linear-gradient(180deg, #f5f3ff 0%, #ffffff 40%)', borderRadius: '14px', padding: '18px 20px', border: '1px solid #ddd6fe', borderTop: '3px solid #8b5cf6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#5b21b6', textTransform: 'uppercase' }}>SERVICES</span>
                  <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid #ddd6fe' }}>🎨</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#5b21b6' }}>{activeServicesCount}</div>
                <div style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 700 }}>Live on website</div>
              </div>

              {/* Card 5: Portfolio */}
              <div style={{ background: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 40%)', borderRadius: '14px', padding: '18px 20px', border: '1px solid #fecdd3', borderTop: '3px solid #f43f5e', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9f1239', textTransform: 'uppercase' }}>PORTFOLIO</span>
                  <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid #fecdd3' }}>🖼️</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#9f1239' }}>{activePortfolioCount}</div>
                <div style={{ fontSize: '0.74rem', color: '#e11d48', fontWeight: 700 }}>Case studies live</div>
              </div>

              {/* Card 6: Rating */}
              <div style={{ background: 'linear-gradient(180deg, #fefce8 0%, #ffffff 40%)', borderRadius: '14px', padding: '18px 20px', border: '1px solid #fef08a', borderTop: '3px solid #eab308', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase' }}>RATING</span>
                  <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fefce8', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid #fef08a' }}>⭐</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#854d0e' }}>4.9/5</div>
                <div style={{ fontSize: '0.74rem', color: '#a16207', fontWeight: 700 }}>{totalReviewsCount} Client reviews</div>
              </div>

            </div>

            {/* 7-Day Inquiries Activity Chart (Video Match) */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '24px 28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    📊 7-Day Inquiries Activity
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Daily volume of decorating and painting inquiries received over the past week
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fda4af' }}></span> 0 (No Inquiries)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#d97706' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span> 1-2 (Low)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span> 3-4 (Moderate)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span> Peak / High
                  </span>
                </div>
              </div>

              {/* Day Bars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '14px', textAlign: 'center' }}>
                {['TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'MON'].map((day, idx) => {
                  const heights = [45, 60, 35, 75, 90, 40, 65];
                  const counts = [1, 2, 1, 3, 4, 1, 2];
                  const h = heights[idx];
                  const c = counts[idx];
                  return (
                    <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ height: '110px', width: '100%', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '6px' }}>
                        <div
                          style={{
                            width: '80%',
                            height: `${h}%`,
                            background: c >= 4 ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)' : c >= 3 ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                          }}
                        >
                          {c}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Inquiries Table (Video Match) */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 2px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Recent Inquiries (Leads)</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Latest inquiries received directly from website forms</p>
                </div>
                <button
                  onClick={() => setActiveTab('inquiries')}
                  style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  View All Leads ↗
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      <th style={{ padding: '14px 20px' }}>Customer</th>
                      <th style={{ padding: '14px 16px' }}>Contact</th>
                      <th style={{ padding: '14px 16px' }}>Service / Location</th>
                      <th style={{ padding: '14px 16px' }}>Source</th>
                      <th style={{ padding: '14px 16px' }}>Status</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queries.slice(0, 5).map((q) => {
                      const badge = getStatusBadge(q.status);
                      return (
                        <tr key={q.id || q._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem' }}>
                                {(q.name || 'C')[0]}
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a' }}>{q.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                  {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Recent'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 16px', color: '#475569', fontSize: '0.82rem' }}>
                            <div>📞 {q.phone || '—'}</div>
                            <div style={{ color: '#94a3b8' }}>✉️ {q.email || '—'}</div>
                          </td>
                          <td style={{ padding: '16px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>{q.service || 'General Painting'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {q.postcode || 'Surrey / London'}</div>
                          </td>
                          <td style={{ padding: '16px 16px' }}>
                            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                              {q.source || 'Website'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, fontSize: '0.78rem', fontWeight: 800 }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: badge.dot }}></span>
                              {q.status || 'New'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedLead(q)}
                              style={{ padding: '6px 14px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                              👁️ View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: INQUIRIES & LEADS MANAGER                          */}
        {/* ========================================================= */}
        {activeTab === 'inquiries' && (
          <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Inquiries &amp; Customer Leads</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Total of {queries.length} inquiries captured. Manage follow-ups, statuses, and contact details.
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                style={{ padding: '10px 18px', borderRadius: '8px', background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                📥 Export Filtered CSV
              </button>
            </div>

            {/* Filter Pills (Matching Video) */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['All', 'New', 'Contacted', 'Quote Sent', 'Booked'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: statusFilter === st ? '#f59e0b' : '#e2e8f0',
                    background: statusFilter === st ? '#f59e0b' : '#ffffff',
                    color: statusFilter === st ? '#ffffff' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {st === 'All' ? 'All Inquiries' : st}
                </button>
              ))}
            </div>

            {/* Search Bar & Dropdown */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="🔍 Search by customer name, phone, email, or postcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, minWidth: '280px', padding: '11px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.88rem' }}
              />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                style={{ padding: '11px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}
              >
                <option value="All">All Services</option>
                <option value="Interior">Interior Painting</option>
                <option value="Exterior">Exterior Painting</option>
                <option value="Limewash">Limewash Specialist</option>
                <option value="Decorative">Decorative Finishes</option>
                <option value="Cabinet">Cabinet Refinishing</option>
                <option value="Commercial">Commercial Painting</option>
              </select>
            </div>

            {/* Inquiries Table */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 20px' }}>Customer</th>
                    <th style={{ padding: '14px 16px' }}>Phone</th>
                    <th style={{ padding: '14px 16px' }}>Service / Budget</th>
                    <th style={{ padding: '14px 16px' }}>Postcode</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueries.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        No inquiries match your current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredQueries.map((q) => {
                      const badge = getStatusBadge(q.status);
                      return (
                        <tr key={q.id || q._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{q.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{q.email || 'No email provided'}</div>
                          </td>
                          <td style={{ padding: '16px 16px', color: '#0f172a', fontWeight: 600 }}>
                            <a href={`tel:${q.phone}`} style={{ color: '#d97706', textDecoration: 'none' }}>
                              {q.phone}
                            </a>
                          </td>
                          <td style={{ padding: '16px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{q.service || 'Painting'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>{q.budget || 'Custom Quote'}</div>
                          </td>
                          <td style={{ padding: '16px 16px', color: '#475569', fontWeight: 600 }}>
                            {q.postcode || '—'}
                          </td>
                          <td style={{ padding: '16px 16px' }}>
                            <select
                              value={q.status || 'New'}
                              onChange={(e) => handleStatusChange(q.id || q._id, e.target.value)}
                              style={{ padding: '5px 10px', borderRadius: '8px', border: `1px solid ${badge.border}`, background: badge.bg, color: badge.text, fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                            >
                              <option value="New">● New</option>
                              <option value="Contacted">● Contacted</option>
                              <option value="Quote Sent">● Quote Sent</option>
                              <option value="Booked">● Booked</option>
                            </select>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={() => setSelectedLead(q)}
                                style={{ padding: '6px 12px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                              >
                                👁️ View
                              </button>
                              <button
                                onClick={() => handleDeleteQuery(q.id || q._id)}
                                style={{ padding: '6px 10px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SERVICES CATALOG MANAGER                           */}
        {/* ========================================================= */}
        {activeTab === 'services' && (
          <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Services Catalog</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Manage the 6 core decorating &amp; painting services, descriptions, pricing, and live site visibility.
                </p>
              </div>
              <button
                onClick={() => { setEditingService(null); setShowServiceModal(true); }}
                style={{ padding: '10px 20px', borderRadius: '8px', background: '#f59e0b', color: '#ffffff', border: 'none', fontSize: '0.86rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)' }}
              >
                + Add Service
              </button>
            </div>

            {/* Services Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {services.map((svc) => (
                <div
                  key={svc.slug}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: svc.active ? 1 : 0.65,
                  }}
                >
                  <div style={{ height: '140px', background: '#1e293b', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={svc.heroImage || 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/bfda9f33af15cb04141cba80a461381f.jpg'}
                      alt={svc.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/assets/graphics/brand-fallback.svg'; }}
                    />
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', background: svc.active ? '#16a34a' : '#64748b', color: '#ffffff', fontSize: '0.74rem', fontWeight: 800 }}>
                        {svc.active ? '● Live on Site' : 'Hidden'}
                      </span>
                    </div>
                    <div style={{ position: 'absolute', bottom: '10px', left: '14px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', padding: '3px 10px', borderRadius: '6px', color: '#fcd34d', fontSize: '0.75rem', fontWeight: 800 }}>
                      From {svc.startingPrice || '£450'}
                    </div>
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>{svc.kicker || 'SERVICE'}</div>
                      <h3 style={{ margin: '2px 0 4px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{svc.title}</h3>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{svc.sub}</div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: '1.5', flex: 1 }}>
                      {svc.desc}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {(svc.features || []).slice(0, 3).map((f, i) => (
                        <span key={i} style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          ✓ {f}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '8px' }}>
                      <button
                        onClick={() => handleToggleService(svc)}
                        style={{ padding: '6px 12px', borderRadius: '6px', background: svc.active ? '#fef3c7' : '#f1f5f9', color: svc.active ? '#92400e' : '#475569', border: 'none', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {svc.active ? 'Hide from Site' : 'Publish to Site'}
                      </button>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => { setEditingService(svc); setShowServiceModal(true); }}
                          style={{ padding: '6px 12px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(svc.slug)}
                          style={{ padding: '6px 10px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: PORTFOLIO & PROJECTS MANAGER                       */}
        {/* ========================================================= */}
        {activeTab === 'portfolio' && (
          <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Portfolio Projects Manager</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Manage completed decorating projects, before &amp; after photos, locations, and website showcase.
                </p>
              </div>
              <button
                onClick={() => { setEditingPortfolio(null); setShowPortfolioModal(true); }}
                style={{ padding: '10px 20px', borderRadius: '8px', background: '#f59e0b', color: '#ffffff', border: 'none', fontSize: '0.86rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)' }}
              >
                + Add Project
              </button>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {['All', 'Interior', 'Exterior'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPortfolioFilter(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: portfolioFilter === cat ? '#f59e0b' : '#e2e8f0',
                    background: portfolioFilter === cat ? '#f59e0b' : '#ffffff',
                    color: portfolioFilter === cat ? '#ffffff' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {cat} Projects
                </button>
              ))}
            </div>

            {/* Projects Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {portfolio
                .filter((p) => portfolioFilter === 'All' || p.category === portfolioFilter)
                .map((prj) => (
                  <div key={prj.id || prj._id} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '140px', background: '#0f172a' }}>
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <img src={prj.imgBefore || prj.imgAfter} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.7)', color: '#ffffff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                          BEFORE
                        </span>
                      </div>
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <img src={prj.imgAfter} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', bottom: '6px', left: '6px', background: '#16a34a', color: '#ffffff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                          FINISHED
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                          {prj.category}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 700 }}>
                          📍 {prj.location || 'Surrey / London'}
                        </span>
                      </div>
                      <h4 style={{ margin: '4px 0 2px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{prj.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                        &ldquo;{prj.editorialNote}&rdquo;
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '10px' }}>
                        <button
                          onClick={() => handleTogglePortfolio(prj)}
                          style={{ padding: '5px 10px', borderRadius: '6px', background: prj.active ? '#f0fdf4' : '#f1f5f9', color: prj.active ? '#15803d' : '#64748b', border: 'none', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          {prj.active ? '● Live' : 'Hidden'}
                        </button>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => { setEditingPortfolio(prj); setShowPortfolioModal(true); }}
                            style={{ padding: '5px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeletePortfolio(prj._id || prj.id)}
                            style={{ padding: '5px 8px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.78rem', cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CUSTOMER REVIEWS / TESTIMONIALS                    */}
        {/* ========================================================= */}
        {activeTab === 'reviews' && (
          <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Customer Reviews &amp; Testimonials</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Manage verified client feedback, ratings, and quotes showcased on the public website.
                </p>
              </div>
              <button
                onClick={() => { setEditingReview(null); setShowReviewModal(true); }}
                style={{ padding: '10px 20px', borderRadius: '8px', background: '#f59e0b', color: '#ffffff', border: 'none', fontSize: '0.86rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)' }}
              >
                + Add Review
              </button>
            </div>

            {/* Reviews List (Matching Video Table/Card Structure) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id || rev._id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '20px 24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '20px',
                    opacity: rev.active ? 1 : 0.65,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '2px' }}>★★★★★</span>
                      <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{rev.n}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {rev.l}</span>
                      <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        {(rev.t || []).join(', ')}
                      </span>
                      {rev.verified && (
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '0.7rem', padding: '1px 7px', borderRadius: '12px', fontWeight: 800 }}>
                          🛡️ Verified Client
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '12px 0 0', fontSize: '0.88rem', color: '#334155', lineHeight: '1.6' }}>
                      &ldquo;{rev.q}&rdquo;
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => handleToggleReview(rev)}
                      style={{ padding: '6px 12px', borderRadius: '6px', background: rev.active ? '#f0fdf4' : '#f1f5f9', color: rev.active ? '#15803d' : '#64748b', border: '1px solid', borderColor: rev.active ? '#bbf7d0' : '#e2e8f0', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      {rev.active ? '● Live' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => { setEditingReview(rev); setShowReviewModal(true); }}
                      style={{ padding: '6px 12px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(rev._id || rev.id)}
                      style={{ padding: '6px 10px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: HOME PAGE MANAGER (ALL 8 SECTIONS DYNAMIC HUB)     */}
        {/* ========================================================= */}
        {(activeTab === 'home' || activeTab === 'hero') && (
          <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* Top Action Ribbon */}
            <div style={{ background: '#ffffff', padding: '16px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  ← Back to Dashboard
                </button>
                <div style={{ height: '18px', width: '1px', background: '#e2e8f0' }}></div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Home Page Manager</h3>
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '12px' }}>
                  ● Live on Site
                </span>
                <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  (Dynamic Manager for All 8 Home Sections)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href="/#home"
                  target="_blank"
                  style={{ padding: '9px 16px', borderRadius: '8px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none' }}
                >
                  Live Site ↗
                </a>
                <button
                  onClick={() => handleSaveSettings('Home Page')}
                  style={{ padding: '9px 20px', borderRadius: '8px', background: '#f59e0b', color: '#ffffff', border: 'none', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
                >
                  🌐 Update Live Site
                </button>
              </div>
            </div>

            {/* Sub-Tabs: Filter / Jump between sections */}
            <div style={{ display: 'flex', gap: '8px', background: '#ffffff', padding: '10px 14px', borderRadius: '14px', border: '1px solid #e2e8f0', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginRight: '6px' }}>Filter Section:</span>
              {[
                { id: 'all', label: '🌟 All Sections' },
                { id: 'hero', label: '1️⃣ Hero Section' },
                { id: 'marquee', label: '2️⃣ Marquee Ticker' },
                { id: 'services_portfolio', label: '3️⃣ Services & Portfolio' },
                { id: 'limewash', label: '4️⃣ Limewash Spotlight' },
                { id: 'why_process', label: '5️⃣ Why Us & Process' },
                { id: 'testimonials_contact', label: '6️⃣ Testimonials & Contact' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setHomeSubTab(st.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: homeSubTab === st.id ? '#fef3c7' : 'transparent',
                    color: homeSubTab === st.id ? '#92400e' : '#475569',
                    fontSize: '0.83rem',
                    fontWeight: homeSubTab === st.id ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Split Screen Layout: Left Form Controls, Right Live Browser Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '24px', alignItems: 'start' }}>

              {/* LEFT SIDE: Section Form Editors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* 1. HERO SECTION */}
                {(homeSubTab === 'all' || homeSubTab === 'hero') && (
                  <>
                    <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>🎨</span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>1. HERO SECTION HEADLINES &amp; COPY</h4>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Main Headline *</label>
                        <input
                          type="text"
                          value={settings?.hero?.headline || ''}
                          onChange={(e) => updateSettingField('hero', 'headline', e.target.value)}
                          placeholder="Make your walls unforgettable."
                          style={{ width: '100%', marginTop: '6px', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700 }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Subheading / Roller Hint</label>
                        <input
                          type="text"
                          value={settings?.hero?.subheading || ''}
                          onChange={(e) => updateSettingField('hero', 'subheading', e.target.value)}
                          placeholder="Grab the roller. Paint this wall."
                          style={{ width: '100%', marginTop: '6px', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Description / Trust Paragraph</label>
                        <textarea
                          rows={3}
                          value={settings?.hero?.description || ''}
                          onChange={(e) => updateSettingField('hero', 'description', e.target.value)}
                          placeholder="28+ years. 1,247 happy clients. 4.9/5..."
                          style={{ width: '100%', marginTop: '6px', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.86rem', resize: 'vertical', lineHeight: '1.5' }}
                        />
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>🔘</span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>HERO BUTTONS &amp; PHONE BADGE</h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Primary Button Text</label>
                          <input
                            type="text"
                            value={settings?.hero?.primaryCtaText || ''}
                            onChange={(e) => updateSettingField('hero', 'primaryCtaText', e.target.value)}
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Primary Button Link</label>
                          <input
                            type="text"
                            value={settings?.hero?.primaryCtaLink || ''}
                            onChange={(e) => updateSettingField('hero', 'primaryCtaLink', e.target.value)}
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Secondary Button Text</label>
                          <input
                            type="text"
                            value={settings?.hero?.secondaryCtaText || ''}
                            onChange={(e) => updateSettingField('hero', 'secondaryCtaText', e.target.value)}
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Phone Badge</label>
                          <input
                            type="text"
                            value={settings?.hero?.phoneBadge || ''}
                            onChange={(e) => updateSettingField('hero', 'phoneBadge', e.target.value)}
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '6px' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Hero Years</label>
                          <input
                            type="text"
                            value={settings?.hero?.statsYears || ''}
                            onChange={(e) => updateSettingField('hero', 'statsYears', e.target.value)}
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Hero Clients</label>
                          <input
                            type="text"
                            value={settings?.hero?.statsClients || ''}
                            onChange={(e) => updateSettingField('hero', 'statsClients', e.target.value)}
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Hero Rating</label>
                          <input
                            type="text"
                            value={settings?.hero?.statsRating || ''}
                            onChange={(e) => updateSettingField('hero', 'statsRating', e.target.value)}
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. MARQUEE TICKER */}
                {(homeSubTab === 'all' || homeSubTab === 'marquee') && (
                  <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '1.1rem' }}>⚡</span>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>2. MARQUEE TICKER (MOVING WORDS)</h4>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Ticker Keywords (comma-separated)</label>
                      <textarea
                        rows={2}
                        value={(settings?.home?.marquee || ['Interior', 'Exterior', 'Limewash', 'Wallpaper', 'Feature walls', 'Spray painting']).join(', ')}
                        onChange={(e) => updateHomeMarquee(e.target.value.split(',').map((x) => x.trim()).filter(Boolean))}
                        style={{ width: '100%', marginTop: '6px', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                        placeholder="Interior, Exterior, Limewash, Wallpaper, Feature walls, Spray painting"
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Current Keywords Active in Ticker:</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {(settings?.home?.marquee || ['Interior', 'Exterior', 'Limewash', 'Wallpaper', 'Feature walls', 'Spray painting']).map((kw, idx) => (
                          <span key={idx} style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '14px', fontSize: '0.76rem', fontWeight: 700, border: '1px solid #fde68a' }}>
                            • {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SERVICES & PORTFOLIO */}
                {(homeSubTab === 'all' || homeSubTab === 'services_portfolio') && (
                  <>
                    <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>🎨</span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>3. SERVICES SHOWCASE INTRO</h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Eyebrow Kicker</label>
                          <input
                            type="text"
                            value={settings?.home?.servicesIntro?.eyebrow || ''}
                            onChange={(e) => updateHomeNestedField('servicesIntro', 'eyebrow', e.target.value)}
                            placeholder="Services · What we do best"
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Main Title</label>
                          <input
                            type="text"
                            value={settings?.home?.servicesIntro?.headline || ''}
                            onChange={(e) => updateHomeNestedField('servicesIntro', 'headline', e.target.value)}
                            placeholder="Every surface. One crew."
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Subtitle / Narrative Description</label>
                        <textarea
                          rows={2}
                          value={settings?.home?.servicesIntro?.subtitle || ''}
                          onChange={(e) => updateHomeNestedField('servicesIntro', 'subtitle', e.target.value)}
                          placeholder="Every home has a story. Choose what you’d like to transform..."
                          style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>🖼️</span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>4. PORTFOLIO SHOWCASE INTRO</h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Eyebrow Kicker</label>
                          <input
                            type="text"
                            value={settings?.home?.portfolioIntro?.eyebrow || ''}
                            onChange={(e) => updateHomeNestedField('portfolioIntro', 'eyebrow', e.target.value)}
                            placeholder="Recent projects"
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Main Title</label>
                          <input
                            type="text"
                            value={settings?.home?.portfolioIntro?.headline || ''}
                            onChange={(e) => updateHomeNestedField('portfolioIntro', 'headline', e.target.value)}
                            placeholder="The finish is everything."
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Lead Paragraph</label>
                        <textarea
                          rows={2}
                          value={settings?.home?.portfolioIntro?.lead || ''}
                          onChange={(e) => updateHomeNestedField('portfolioIntro', 'lead', e.target.value)}
                          placeholder="A curated look at completed projects..."
                          style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>CTA Button Text</label>
                          <input
                            type="text"
                            value={settings?.home?.portfolioIntro?.ctaText || ''}
                            onChange={(e) => updateHomeNestedField('portfolioIntro', 'ctaText', e.target.value)}
                            placeholder="View the full portfolio"
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>CTA Button Link</label>
                          <input
                            type="text"
                            value={settings?.home?.portfolioIntro?.ctaLink || ''}
                            onChange={(e) => updateHomeNestedField('portfolioIntro', 'ctaLink', e.target.value)}
                            placeholder="/portfolio"
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 4. LIMEWASH SPOTLIGHT */}
                {(homeSubTab === 'all' || homeSubTab === 'limewash') && (
                  <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '1.1rem' }}>🏛️</span>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>5. LIMEWASH SPOTLIGHT FEATURE</h4>
                    </div>

                    <ImageUploadField
                      label="Limewash Feature Artwork Image"
                      value={settings?.home?.limewash?.image || ''}
                      onChange={(url) => updateHomeNestedField('limewash', 'image', url)}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Badge Tag 1 (Left)</label>
                        <input
                          type="text"
                          value={settings?.home?.limewash?.matTag1 || ''}
                          onChange={(e) => updateHomeNestedField('limewash', 'matTag1', e.target.value)}
                          placeholder="THE NATURAL FINISH"
                          style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Badge Tag 2 (Right)</label>
                        <input
                          type="text"
                          value={settings?.home?.limewash?.matTag2 || ''}
                          onChange={(e) => updateHomeNestedField('limewash', 'matTag2', e.target.value)}
                          placeholder="SOFT DEPTH / QUIET CHARACTER"
                          style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Eyebrow Kicker</label>
                        <input
                          type="text"
                          value={settings?.home?.limewash?.eyebrow || ''}
                          onChange={(e) => updateHomeNestedField('limewash', 'eyebrow', e.target.value)}
                          placeholder="The beauty of limewash"
                          style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Main Headline</label>
                        <input
                          type="text"
                          value={settings?.home?.limewash?.headline || ''}
                          onChange={(e) => updateHomeNestedField('limewash', 'headline', e.target.value)}
                          placeholder="Walls with a little soul."
                          style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Lead Description Paragraph</label>
                      <textarea
                        rows={2}
                        value={settings?.home?.limewash?.lead || ''}
                        onChange={(e) => updateHomeNestedField('limewash', 'lead', e.target.value)}
                        placeholder="Not every wall needs to shout..."
                        style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                      />
                    </div>

                    {/* 3 Feature Bullets */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706' }}>FEATURE 1</label>
                        <input
                          type="text"
                          value={settings?.home?.limewash?.feature1Title || ''}
                          onChange={(e) => updateHomeNestedField('limewash', 'feature1Title', e.target.value)}
                          placeholder="Soft movement"
                          style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: 700 }}
                        />
                        <input
                          type="text"
                          value={settings?.home?.limewash?.feature1Desc || ''}
                          onChange={(e) => updateHomeNestedField('limewash', 'feature1Desc', e.target.value)}
                          placeholder="Subtle, naturally varied tones"
                          style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem' }}
                        />
                      </div>
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706' }}>FEATURE 2</label>
                        <input
                          type="text"
                          value={settings?.home?.limewash?.feature2Title || ''}
                          onChange={(e) => updateHomeNestedField('limewash', 'feature2Title', e.target.value)}
                          placeholder="Rich in character"
                          style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: 700 }}
                        />
                        <input
                          type="text"
                          value={settings?.home?.limewash?.feature2Desc || ''}
                          onChange={(e) => updateHomeNestedField('limewash', 'feature2Desc', e.target.value)}
                          placeholder="A finish that changes with the light"
                          style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem' }}
                        />
                      </div>
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706' }}>FEATURE 3</label>
                        <input
                          type="text"
                          value={settings?.home?.limewash?.feature3Title || ''}
                          onChange={(e) => updateHomeNestedField('limewash', 'feature3Title', e.target.value)}
                          placeholder="Made for your space"
                          style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: 700 }}
                        />
                        <input
                          type="text"
                          value={settings?.home?.limewash?.feature3Desc || ''}
                          onChange={(e) => updateHomeNestedField('limewash', 'feature3Desc', e.target.value)}
                          placeholder="Personalised colours and application"
                          style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>CTA Button Text</label>
                        <input
                          type="text"
                          value={settings?.home?.limewash?.ctaText || ''}
                          onChange={(e) => updateHomeNestedField('limewash', 'ctaText', e.target.value)}
                          placeholder="Discover limewash finishes"
                          style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>CTA Button Link</label>
                        <input
                          type="text"
                          value={settings?.home?.limewash?.ctaLink || ''}
                          onChange={(e) => updateHomeNestedField('limewash', 'ctaLink', e.target.value)}
                          placeholder="/services/limewash-specialist"
                          style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Footer Microcopy</label>
                      <input
                        type="text"
                        value={settings?.home?.limewash?.microCopy || ''}
                        onChange={(e) => updateHomeNestedField('limewash', 'microCopy', e.target.value)}
                        placeholder="Curious about the finish? Explore colours, textures and real transformations."
                        style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                      />
                    </div>
                  </div>
                )}

                {/* 5. WHY AR MATT & GLOSS & PROCESS */}
                {(homeSubTab === 'all' || homeSubTab === 'why_process') && (
                  <>
                    <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>🏆</span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>6. WHY AR MATT &amp; GLOSS (STANDARDS &amp; METRICS)</h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Section Eyebrow</label>
                          <input
                            type="text"
                            value={settings?.home?.why?.eyebrow || ''}
                            onChange={(e) => updateHomeNestedField('why', 'eyebrow', e.target.value)}
                            placeholder="Why AR Matt & Gloss"
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Main Headline</label>
                          <input
                            type="text"
                            value={settings?.home?.why?.headline || ''}
                            onChange={(e) => updateHomeNestedField('why', 'headline', e.target.value)}
                            placeholder="Quality you can see."
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>Box 1 Title</label>
                          <input
                            type="text"
                            value={settings?.home?.why?.box1Title || ''}
                            onChange={(e) => updateHomeNestedField('why', 'box1Title', e.target.value)}
                            placeholder="Work we do"
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                          />
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginTop: '6px', display: 'block' }}>Items (one per line):</label>
                          <textarea
                            rows={4}
                            value={(settings?.home?.why?.box1Items || [
                              'Interior painting (walls, ceilings, woodwork)',
                              'Exterior painting (houses, sheds, fences, roof tiles)',
                              'Limewash, wallpaper, feature walls',
                              'Surface preparation & repair',
                            ]).join('\n')}
                            onChange={(e) => updateHomeWhyList('box1Items', e.target.value.split('\n').map((x) => x.trim()).filter(Boolean))}
                            style={{ width: '100%', marginTop: '4px', padding: '8px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.8rem', lineHeight: '1.4' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>Box 2 Title</label>
                          <input
                            type="text"
                            value={settings?.home?.why?.box2Title || ''}
                            onChange={(e) => updateHomeNestedField('why', 'box2Title', e.target.value)}
                            placeholder="Attitude to work"
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                          />
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginTop: '6px', display: 'block' }}>Items (one per line):</label>
                          <textarea
                            rows={4}
                            value={(settings?.home?.why?.box2Items || [
                              'Professional and certified painters',
                              'High-quality materials and finishes',
                              'Fully insured and licensed',
                              'Clean and tidy. Satisfaction guaranteed',
                            ]).join('\n')}
                            onChange={(e) => updateHomeWhyList('box2Items', e.target.value.split('\n').map((x) => x.trim()).filter(Boolean))}
                            style={{ width: '100%', marginTop: '4px', padding: '8px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.8rem', lineHeight: '1.4' }}
                          />
                        </div>
                      </div>

                      {/* 4 Stats */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '6px' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>Years Exp</label>
                          <input
                            type="text"
                            value={settings?.home?.why?.statsYears || ''}
                            onChange={(e) => updateHomeNestedField('why', 'statsYears', e.target.value)}
                            placeholder="28+"
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>Clients</label>
                          <input
                            type="text"
                            value={settings?.home?.why?.statsClients || ''}
                            onChange={(e) => updateHomeNestedField('why', 'statsClients', e.target.value)}
                            placeholder="1247"
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>Projects</label>
                          <input
                            type="text"
                            value={settings?.home?.why?.statsProjects || ''}
                            onChange={(e) => updateHomeNestedField('why', 'statsProjects', e.target.value)}
                            placeholder="1500+"
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>Support</label>
                          <input
                            type="text"
                            value={settings?.home?.why?.statsSupport || ''}
                            onChange={(e) => updateHomeNestedField('why', 'statsSupport', e.target.value)}
                            placeholder="24/7"
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>🔄</span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>7. HOW WE WORK (4-STEP PROCESS)</h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706' }}>STEP 1</span>
                          <input
                            type="text"
                            value={settings?.home?.process?.step1Title || ''}
                            onChange={(e) => updateHomeNestedField('process', 'step1Title', e.target.value)}
                            placeholder="Request a quote"
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                          />
                          <input
                            type="text"
                            value={settings?.home?.process?.step1Desc || ''}
                            onChange={(e) => updateHomeNestedField('process', 'step1Desc', e.target.value)}
                            placeholder="Under a minute. No obligation."
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.76rem' }}
                          />
                        </div>
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706' }}>STEP 2</span>
                          <input
                            type="text"
                            value={settings?.home?.process?.step2Title || ''}
                            onChange={(e) => updateHomeNestedField('process', 'step2Title', e.target.value)}
                            placeholder="Free consultation"
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                          />
                          <input
                            type="text"
                            value={settings?.home?.process?.step2Desc || ''}
                            onChange={(e) => updateHomeNestedField('process', 'step2Desc', e.target.value)}
                            placeholder="Colour advice and a clear price."
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.76rem' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706' }}>STEP 3</span>
                          <input
                            type="text"
                            value={settings?.home?.process?.step3Title || ''}
                            onChange={(e) => updateHomeNestedField('process', 'step3Title', e.target.value)}
                            placeholder="Expert execution"
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                          />
                          <input
                            type="text"
                            value={settings?.home?.process?.step3Desc || ''}
                            onChange={(e) => updateHomeNestedField('process', 'step3Desc', e.target.value)}
                            placeholder="Careful prep, precise finish, spotless site."
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.76rem' }}
                          />
                        </div>
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706' }}>STEP 4</span>
                          <input
                            type="text"
                            value={settings?.home?.process?.step4Title || ''}
                            onChange={(e) => updateHomeNestedField('process', 'step4Title', e.target.value)}
                            placeholder="Final walk-through"
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                          />
                          <input
                            type="text"
                            value={settings?.home?.process?.step4Desc || ''}
                            onChange={(e) => updateHomeNestedField('process', 'step4Desc', e.target.value)}
                            placeholder="We finish when you’re happy."
                            style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.76rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 6. TESTIMONIALS & CONTACT */}
                {(homeSubTab === 'all' || homeSubTab === 'testimonials_contact') && (
                  <>
                    <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>⭐</span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>8. TESTIMONIALS SECTION INTRO</h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Section Eyebrow</label>
                          <input
                            type="text"
                            value={settings?.home?.testimonialsIntro?.eyebrow || ''}
                            onChange={(e) => updateHomeNestedField('testimonialsIntro', 'eyebrow', e.target.value)}
                            placeholder="What people say"
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Main Headline</label>
                          <input
                            type="text"
                            value={settings?.home?.testimonialsIntro?.headline || ''}
                            onChange={(e) => updateHomeNestedField('testimonialsIntro', 'headline', e.target.value)}
                            placeholder="Loved by the people we work with."
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Lead Paragraph</label>
                        <textarea
                          rows={2}
                          value={settings?.home?.testimonialsIntro?.lead || ''}
                          onChange={(e) => updateHomeNestedField('testimonialsIntro', 'lead', e.target.value)}
                          placeholder="Feedback published on AR Matt & Gloss Decorators’ existing Testimonials page."
                          style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>📬</span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>9. QUICK QUOTE &amp; CONTACT DETAILS</h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Eyebrow Kicker</label>
                          <input
                            type="text"
                            value={settings?.home?.contactIntro?.eyebrow || ''}
                            onChange={(e) => updateHomeNestedField('contactIntro', 'eyebrow', e.target.value)}
                            placeholder="Quick quote"
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Main Headline</label>
                          <input
                            type="text"
                            value={settings?.home?.contactIntro?.headline || ''}
                            onChange={(e) => updateHomeNestedField('contactIntro', 'headline', e.target.value)}
                            placeholder="Tell us about your walls."
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Lead Paragraph</label>
                        <textarea
                          rows={2}
                          value={settings?.home?.contactIntro?.lead || ''}
                          onChange={(e) => updateHomeNestedField('contactIntro', 'lead', e.target.value)}
                          placeholder="Send a few details and we’ll reply with clear guidance..."
                          style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Phone Number(s)</label>
                          <input
                            type="text"
                            value={settings?.home?.contactIntro?.phone || ''}
                            onChange={(e) => updateHomeNestedField('contactIntro', 'phone', e.target.value)}
                            placeholder="07309 092376 / 02034 880652"
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Email Address</label>
                          <input
                            type="text"
                            value={settings?.home?.contactIntro?.email || ''}
                            onChange={(e) => updateHomeNestedField('contactIntro', 'email', e.target.value)}
                            placeholder="contact@ar-mattandgloss-decorators.com"
                            style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Physical Studio Address</label>
                        <input
                          type="text"
                          value={settings?.home?.contactIntro?.address || ''}
                          onChange={(e) => updateHomeNestedField('contactIntro', 'address', e.target.value)}
                          placeholder="23 Church Road, Richmond, Surrey TW9 2QA"
                          style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* RIGHT SIDE: 1:1 Real Website Live Preview Mockup Frame */}
              <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Mockup Toolbar Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Real Website Live Preview</span>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>
                      1:1 ASALI PREVIEW
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Device View Toggle */}
                    <div style={{ display: 'flex', background: '#e2e8f0', padding: '2px', borderRadius: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          background: previewDevice === 'desktop' ? '#ffffff' : 'transparent',
                          color: previewDevice === 'desktop' ? '#0f172a' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: previewDevice === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                      >
                        🖥️ Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          background: previewDevice === 'mobile' ? '#ffffff' : 'transparent',
                          color: previewDevice === 'mobile' ? '#0f172a' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: previewDevice === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                      >
                        📱 Mobile
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIframeKey((k) => k + 1)}
                      title="Reload Preview Frame"
                      style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      🔄
                    </button>

                    <a
                      href="/"
                      target="_blank"
                      style={{ fontSize: '0.74rem', background: '#0f172a', color: '#ffffff', padding: '5px 12px', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}
                    >
                      ↗ Full Screen
                    </a>
                  </div>
                </div>

                {/* Real Browser Mockup Window */}
                <div style={{ background: '#0f172a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.22)', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                  {/* Browser Bar */}
                  <div style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #334155' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                    </div>
                    <div style={{ flex: 1, background: '#0f172a', borderRadius: '6px', padding: '4px 10px', fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🔒</span>
                      <span>https://ar-mattandgloss-decorators.com/</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>
                      {previewDevice === 'desktop' ? 'DESKTOP 1240px' : 'MOBILE 375px'}
                    </span>
                  </div>

                  {/* Browser Viewport Content - Real Asali Website */}
                  <div
                    ref={previewContainerRef}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '700px',
                      overflow: 'hidden',
                      background: previewDevice === 'desktop' ? '#ffffff' : '#0f172a',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: previewDevice === 'desktop' ? 'flex-start' : 'center',
                    }}
                  >
                    {previewDevice === 'desktop' ? (
                      <iframe
                        key={iframeKey}
                        ref={iframeRef}
                        src="/"
                        onLoad={handleIframeLoad}
                        title="Live Website Desktop Preview"
                        style={{
                          width: '1240px',
                          height: `${700 / (previewScale || 0.48)}px`,
                          border: 'none',
                          transform: `scale(${previewScale || 0.48})`,
                          transformOrigin: 'top left',
                          background: '#ffffff',
                        }}
                      />
                    ) : (
                      <div style={{ width: '375px', height: '650px', borderRadius: '36px', overflow: 'hidden', border: '8px solid #334155', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', background: '#ffffff', position: 'relative' }}>
                        <iframe
                          key={iframeKey}
                          ref={iframeRef}
                          src="/"
                          onLoad={handleIframeLoad}
                          title="Live Website Mobile Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            background: '#ffffff',
                          }}
                        />
                      </div>
                    )}
                  </div>

                </div>

                <button
                  onClick={() => handleSaveSettings('Home Page')}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#f59e0b', color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)' }}
                >
                  💾 Save &amp; Publish Home Page
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: ABOUT US CONTENT EDITOR (SUB-TABS & SPLIT SCREEN)  */}
        {/* ========================================================= */}
        {activeTab === 'about' && (
          <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* Top Action Ribbon */}
            <div style={{ background: '#ffffff', padding: '16px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  ← Back to Dashboard
                </button>
                <div style={{ height: '18px', width: '1px', background: '#e2e8f0' }}></div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>About Us Content Editor</h3>
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '12px' }}>
                  ● Live on Site
                </span>
              </div>
              <button
                onClick={() => handleSaveSettings('About Section')}
                style={{ padding: '9px 20px', borderRadius: '8px', background: '#f59e0b', color: '#ffffff', border: 'none', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
              >
                🌐 Update Live Site
              </button>
            </div>

            {/* Sub-Tabs (Matching Reference Video About Us Pills) */}
            <div style={{ display: 'flex', gap: '10px', background: '#ffffff', padding: '8px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              {[
                { id: 'banner', label: '🖼️ Hero Banner' },
                { id: 'stats', label: '📊 Stats Counters' },
                { id: 'story', label: '📖 Our Story & Craft' },
                { id: 'values', label: '✨ Core Values' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setAboutSubTab(st.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: aboutSubTab === st.id ? '#fef3c7' : 'transparent',
                    color: aboutSubTab === st.id ? '#92400e' : '#475569',
                    fontSize: '0.84rem',
                    fontWeight: aboutSubTab === st.id ? 800 : 600,
                    cursor: 'pointer',
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Split Screen Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.05fr', gap: '24px', alignItems: 'start' }}>

              {/* Left Form Controls */}
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {aboutSubTab === 'banner' && (
                  <>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>HERO HEADER BANNER</h4>
                    <div>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Top Tagline</label>
                      <input
                        type="text"
                        value={settings?.about?.tagline || ''}
                        onChange={(e) => updateSettingField('about', 'tagline', e.target.value)}
                        style={{ width: '100%', marginTop: '6px', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Main Heading *</label>
                      <input
                        type="text"
                        value={settings?.about?.headline || ''}
                        onChange={(e) => updateSettingField('about', 'headline', e.target.value)}
                        style={{ width: '100%', marginTop: '6px', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Subtitle / Mission Statement</label>
                      <textarea
                        rows={3}
                        value={settings?.about?.subtitle || ''}
                        onChange={(e) => updateSettingField('about', 'subtitle', e.target.value)}
                        style={{ width: '100%', marginTop: '6px', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.86rem', resize: 'vertical' }}
                      />
                    </div>
                    <ImageUploadField
                      label="Banner Background Photo"
                      value={settings?.about?.bgImage || ''}
                      onChange={(url) => updateSettingField('about', 'bgImage', url)}
                      helperText="Click to upload banner image directly from your device"
                    />
                  </>
                )}

                {aboutSubTab === 'stats' && (
                  <>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>NUMERICAL PROOF COUNTERS</h4>
                    {(settings?.about?.stats || []).map((st, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={st.number}
                          placeholder="Number"
                          onChange={(e) => {
                            const copy = [...(settings?.about?.stats || [])];
                            copy[idx].number = e.target.value;
                            updateSettingField('about', 'stats', copy);
                          }}
                          style={{ padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}
                        />
                        <input
                          type="text"
                          value={st.suffix}
                          placeholder="Suffix (+)"
                          onChange={(e) => {
                            const copy = [...(settings?.about?.stats || [])];
                            copy[idx].suffix = e.target.value;
                            updateSettingField('about', 'stats', copy);
                          }}
                          style={{ padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                        <input
                          type="text"
                          value={st.label}
                          placeholder="Metric Label"
                          onChange={(e) => {
                            const copy = [...(settings?.about?.stats || [])];
                            copy[idx].label = e.target.value;
                            updateSettingField('about', 'stats', copy);
                          }}
                          style={{ padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                      </div>
                    ))}
                  </>
                )}

                {aboutSubTab === 'story' && (
                  <>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>OUR STORY &amp; HERITAGE</h4>
                    <div>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Story Title</label>
                      <input
                        type="text"
                        value={settings?.about?.storyTitle || ''}
                        onChange={(e) => updateSettingField('about', 'storyTitle', e.target.value)}
                        style={{ width: '100%', marginTop: '6px', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Full Story Paragraph</label>
                      <textarea
                        rows={6}
                        value={settings?.about?.storyText || ''}
                        onChange={(e) => updateSettingField('about', 'storyText', e.target.value)}
                        style={{ width: '100%', marginTop: '6px', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.86rem', resize: 'vertical', lineHeight: '1.6' }}
                      />
                    </div>
                  </>
                )}

                {aboutSubTab === 'values' && (
                  <>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>CORE WORK VALUES</h4>
                    {(settings?.about?.values || []).map((val, idx) => (
                      <div key={idx} style={{ padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={val.icon}
                            style={{ width: '50px', textAlign: 'center', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            onChange={(e) => {
                              const copy = [...(settings?.about?.values || [])];
                              copy[idx].icon = e.target.value;
                              updateSettingField('about', 'values', copy);
                            }}
                          />
                          <input
                            type="text"
                            value={val.title}
                            placeholder="Value Title"
                            style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                            onChange={(e) => {
                              const copy = [...(settings?.about?.values || [])];
                              copy[idx].title = e.target.value;
                              updateSettingField('about', 'values', copy);
                            }}
                          />
                        </div>
                        <input
                          type="text"
                          value={val.desc}
                          placeholder="Description"
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                          onChange={(e) => {
                            const copy = [...(settings?.about?.values || [])];
                            copy[idx].desc = e.target.value;
                            updateSettingField('about', 'values', copy);
                          }}
                        />
                      </div>
                    ))}
                  </>
                )}

              </div>

              {/* Right Mockup Preview Frame */}
              <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#0f172a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 14px 40px rgba(0,0,0,0.25)', border: '1px solid #334155' }}>
                  <div style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #334155' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
                    </div>
                    <div style={{ flex: 1, background: '#0f172a', borderRadius: '6px', padding: '4px 10px', fontSize: '0.72rem', color: '#94a3b8' }}>
                      🔒 https://ar-mattandgloss-decorators.com/#why
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>LIVE SYNC</span>
                  </div>

                  <div style={{ background: '#ffffff', padding: '28px 24px', color: '#0f172a' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                      {settings?.about?.tagline || 'WHO WE ARE'}
                    </div>
                    <h3 style={{ margin: '4px 0 10px', fontSize: '1.3rem', fontWeight: 900 }}>
                      {settings?.about?.headline || 'Quality you can see.'}
                    </h3>
                    <p style={{ margin: '0 0 18px', color: '#475569', fontSize: '0.84rem', lineHeight: '1.6' }}>
                      {settings?.about?.subtitle || 'Passionate painters and decorators.'}
                    </p>

                    {/* Stats bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      {(settings?.about?.stats || []).map((s, i) => (
                        <div key={i}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{s.number}{s.suffix}</div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSaveSettings('About Section')}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#f59e0b', color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)' }}
                >
                  💾 Save &amp; Publish About Us Content
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: FOOTER MANAGER (SPLIT SCREEN LIVE PREVIEW)         */}
        {/* ========================================================= */}
        {activeTab === 'footer' && (
          <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            <div style={{ background: '#ffffff', padding: '16px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  ← Back to Dashboard
                </button>
                <div style={{ height: '18px', width: '1px', background: '#e2e8f0' }}></div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Dynamic Footer Manager</h3>
              </div>
              <button
                onClick={() => handleSaveSettings('Footer')}
                style={{ padding: '9px 20px', borderRadius: '8px', background: '#f59e0b', color: '#ffffff', border: 'none', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
              >
                💾 Save Footer Changes
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.95fr', gap: '24px', alignItems: 'start' }}>

              {/* Left Side: 3 Clean Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* Row 1: Brand & Logo */}
                <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>🏛️ Row 1: Brand Logo &amp; About Text</h4>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Logo URL</label>
                    <input
                      type="text"
                      value={settings?.footer?.logoUrl || ''}
                      onChange={(e) => updateSettingField('footer', 'logoUrl', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>About Text</label>
                    <textarea
                      rows={3}
                      value={settings?.footer?.aboutText || ''}
                      onChange={(e) => updateSettingField('footer', 'aboutText', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem', resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Row 2: Contact Details */}
                <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>📞 Row 2: Contact Us Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Mobile</label>
                      <input
                        type="text"
                        value={settings?.footer?.phone1 || ''}
                        onChange={(e) => updateSettingField('footer', 'phone1', e.target.value)}
                        style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Office</label>
                      <input
                        type="text"
                        value={settings?.footer?.phone2 || ''}
                        onChange={(e) => updateSettingField('footer', 'phone2', e.target.value)}
                        style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Email</label>
                    <input
                      type="email"
                      value={settings?.footer?.email || ''}
                      onChange={(e) => updateSettingField('footer', 'email', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Address</label>
                    <input
                      type="text"
                      value={settings?.footer?.address || ''}
                      onChange={(e) => updateSettingField('footer', 'address', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                {/* Row 3: Business Hours & Copyright */}
                <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>⏰ Row 3: Business Hours &amp; Copyright</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Mon–Fri</label>
                      <input
                        type="text"
                        value={settings?.footer?.hoursWeekday || ''}
                        onChange={(e) => updateSettingField('footer', 'hoursWeekday', e.target.value)}
                        style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Saturday</label>
                      <input
                        type="text"
                        value={settings?.footer?.hoursSaturday || ''}
                        onChange={(e) => updateSettingField('footer', 'hoursSaturday', e.target.value)}
                        style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Copyright</label>
                    <input
                      type="text"
                      value={settings?.footer?.copyright || ''}
                      onChange={(e) => updateSettingField('footer', 'copyright', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

              </div>

              {/* Right Side: Dark Luxury Live Preview */}
              <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgb(128, 128, 128)', borderRadius: '16px', padding: '26px 22px', color: '#ffffff', boxShadow: '0 12px 36px rgba(0,0,0,0.2)' }}>
                  <img
                    src={settings?.footer?.logoUrl || 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/1275896739a421cf642ea5e88346c08b.png'}
                    alt="Logo"
                    style={{ height: '32px', marginBottom: '12px', display: 'block' }}
                  />
                  <p style={{ margin: '0 0 16px', color: '#cbd5e1', fontSize: '0.8rem', lineHeight: '1.5' }}>
                    {settings?.footer?.aboutText}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.78rem' }}>
                    <div>
                      <h5 style={{ margin: '0 0 8px', color: '#ffffff', fontSize: '0.84rem' }}>Contact us</h5>
                      <div style={{ color: '#c5a880', fontWeight: 700 }}>{settings?.footer?.phone1}</div>
                      <div style={{ color: '#94a3b8' }}>{settings?.footer?.email}</div>
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 8px', color: '#ffffff', fontSize: '0.84rem' }}>Business hours</h5>
                      <div style={{ color: '#94a3b8' }}>{settings?.footer?.hoursWeekday}</div>
                      <div style={{ color: '#94a3b8' }}>{settings?.footer?.hoursSaturday}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.72rem', color: '#64748b' }}>
                    {settings?.footer?.copyright}
                  </div>
                </div>

                <button
                  onClick={() => handleSaveSettings('Footer')}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#f59e0b', color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  💾 Save All Footer Changes
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 9: GLOBAL SITE SETTINGS & CONTACT                     */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            <div style={{ background: '#ffffff', padding: '16px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ margin: '0 0 2px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Global Site Settings &amp; Contact</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Manage WhatsApp support numbers, announcement banner, company phone numbers, and official details.
                </p>
              </div>
              <button
                onClick={() => handleSaveSettings('Site Settings')}
                style={{ padding: '9px 20px', borderRadius: '8px', background: '#f59e0b', color: '#ffffff', border: 'none', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}
              >
                💾 Save All Settings
              </button>
            </div>

            {/* Settings Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.95fr', gap: '24px', alignItems: 'start' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* Top Announcement Banner */}
                <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📢</span>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>TOP ANNOUNCEMENT BANNER</h4>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings?.announcement?.enabled || false}
                        onChange={(e) => updateSettingField('announcement', 'enabled', e.target.checked)}
                      />
                      Show on Site
                    </label>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Announcement Offer / Message</label>
                    <input
                      type="text"
                      value={settings?.announcement?.text || ''}
                      onChange={(e) => updateSettingField('announcement', 'text', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>CTA Link (Optional)</label>
                    <input
                      type="text"
                      value={settings?.announcement?.link || ''}
                      onChange={(e) => updateSettingField('announcement', 'link', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                {/* WhatsApp Floating Button */}
                <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>💬</span>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>WHATSAPP FLOATING BUTTON</h4>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings?.whatsapp?.enabled ?? true}
                        onChange={(e) => updateSettingField('whatsapp', 'enabled', e.target.checked)}
                      />
                      Enable Button
                    </label>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>WhatsApp Number (with country code, e.g. 447309092376)</label>
                    <input
                      type="text"
                      value={settings?.whatsapp?.phone || ''}
                      onChange={(e) => updateSettingField('whatsapp', 'phone', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Default Pre-filled Message</label>
                    <input
                      type="text"
                      value={settings?.whatsapp?.message || ''}
                      onChange={(e) => updateSettingField('whatsapp', 'message', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                {/* Company Contact Info */}
                <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📞</span>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>OFFICIAL CONTACTS &amp; SUPPORT</h4>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Phone 1 (Mobile)</label>
                      <input
                        type="text"
                        value={settings?.company?.phone1 || ''}
                        onChange={(e) => updateSettingField('company', 'phone1', e.target.value)}
                        style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Phone 2 (Office)</label>
                      <input
                        type="text"
                        value={settings?.company?.phone2 || ''}
                        onChange={(e) => updateSettingField('company', 'phone2', e.target.value)}
                        style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Email</label>
                    <input
                      type="email"
                      value={settings?.company?.email || ''}
                      onChange={(e) => updateSettingField('company', 'email', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Office Postal Address</label>
                    <input
                      type="text"
                      value={settings?.company?.address || ''}
                      onChange={(e) => updateSettingField('company', 'address', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Service Coverage Area</label>
                    <input
                      type="text"
                      value={settings?.company?.coverage || ''}
                      onChange={(e) => updateSettingField('company', 'coverage', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                {/* Cloudinary Media Cloud */}
                <div style={{ background: '#ffffff', padding: '22px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>☁️</span>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>CLOUDINARY MEDIA CLOUD</h4>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: settings?.cloudinary?.cloudName ? '#16a34a' : '#64748b' }}>
                      {settings?.cloudinary?.cloudName ? '● Cloud Connected' : 'Auto / Local Ready'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b', lineHeight: '1.4' }}>
                    Directly upload photos from your phone or device. Add your free Cloudinary account details (from cloudinary.com) for worldwide cloud hosting.
                  </p>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Cloud Name</label>
                    <input
                      type="text"
                      placeholder="e.g. armattgloss"
                      value={settings?.cloudinary?.cloudName || ''}
                      onChange={(e) => updateSettingField('cloudinary', 'cloudName', e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>API Key</label>
                      <input
                        type="text"
                        placeholder="e.g. 123456789012345"
                        value={settings?.cloudinary?.apiKey || ''}
                        onChange={(e) => updateSettingField('cloudinary', 'apiKey', e.target.value)}
                        style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>API Secret</label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••"
                        value={settings?.cloudinary?.apiSecret || ''}
                        onChange={(e) => updateSettingField('cloudinary', 'apiSecret', e.target.value)}
                        style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Side: Settings Preview Frame */}
              <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    🔍 Live Configuration Summary
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Announcement:</span>
                      <strong style={{ color: settings?.announcement?.enabled ? '#16a34a' : '#64748b' }}>
                        {settings?.announcement?.enabled ? 'Active on Site' : 'Disabled'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>WhatsApp Floating:</span>
                      <strong style={{ color: settings?.whatsapp?.enabled !== false ? '#16a34a' : '#64748b' }}>
                        {settings?.whatsapp?.enabled !== false ? `Active (${settings?.whatsapp?.phone})` : 'Disabled'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Primary Phone:</span>
                      <strong style={{ color: '#0f172a' }}>{settings?.company?.phone1}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span style={{ color: '#64748b' }}>Coverage Area:</span>
                      <strong style={{ color: '#0f172a' }}>{settings?.company?.coverage || 'London & Surrey'}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveSettings('Site Settings')}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#f59e0b', color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.9rem', marginTop: '16px' }}
                  >
                    💾 Save &amp; Apply All Settings
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: LEAD DETAIL DRAWER                               */}
      {/* ========================================================= */}
      {selectedLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(2px)' }}>
          <div style={{ width: '480px', maxWidth: '100%', background: '#ffffff', height: '100%', padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '-8px 0 24px rgba(0,0,0,0.1)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b' }}>{selectedLead.id || selectedLead._id}</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{selectedLead.name}</h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <a
                href={`tel:${selectedLead.phone}`}
                style={{ padding: '10px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: '0.84rem' }}
              >
                📞 Call {selectedLead.phone}
              </a>
              <a
                href={`https://wa.me/${(selectedLead.phone || '').replace(/\D/g, '')}`}
                target="_blank"
                style={{ padding: '10px', borderRadius: '8px', background: '#25D366', color: '#ffffff', textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: '0.84rem' }}
              >
                💬 WhatsApp
              </a>
            </div>

            {/* Lead Details Card */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>REQUESTED SERVICE</div>
                <strong style={{ color: '#0f172a' }}>{selectedLead.service || 'General Painting'}</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>ESTIMATED BUDGET</div>
                <strong style={{ color: '#16a34a' }}>{selectedLead.budget || 'Custom Quote'}</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>POSTCODE / LOCATION</div>
                <strong style={{ color: '#0f172a' }}>{selectedLead.postcode || 'Not provided'}</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>LEAD SOURCE</div>
                <span>{selectedLead.source || 'Website'}</span>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>INQUIRY MESSAGE / NOTES</div>
                <p style={{ margin: '4px 0 0', color: '#334155', lineHeight: '1.5' }}>
                  {selectedLead.details || 'No message provided.'}
                </p>
              </div>
            </div>

            {/* Change Status */}
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Update Pipeline Status</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                {['New', 'Contacted', 'Quote Sent', 'Booked'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedLead.id || selectedLead._id, st)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: selectedLead.status === st ? '#f59e0b' : '#cbd5e1',
                      background: selectedLead.status === st ? '#fef3c7' : '#ffffff',
                      color: selectedLead.status === st ? '#92400e' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD / EDIT SERVICE                               */}
      {/* ========================================================= */}
      {showServiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '560px', maxWidth: '100%', background: '#ffffff', borderRadius: '16px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setShowServiceModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Service Title *</label>
                <input name="title" defaultValue={editingService?.title || ''} required style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>URL Slug *</label>
                  <input name="slug" defaultValue={editingService?.slug || ''} required style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Starting Price</label>
                  <input name="startingPrice" defaultValue={editingService?.startingPrice || '£450'} style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Subtitle / Short Catchphrase</label>
                <input name="sub" defaultValue={editingService?.sub || ''} style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Description</label>
                <textarea name="desc" rows={3} defaultValue={editingService?.desc || ''} style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <ImageUploadField
                label="Service Hero Photo"
                name="heroImage"
                value={editingService?.heroImage || ''}
                helperText="Upload service photo directly from device (Cloudinary CDN ready)"
              />

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Key Features (1 per line)</label>
                <textarea name="features" rows={3} defaultValue={(editingService?.features || []).join('\n')} style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                <input type="checkbox" name="active" defaultChecked={editingService?.active ?? true} />
                Live on Public Website
              </label>

              <button type="submit" style={{ padding: '12px', borderRadius: '8px', background: '#f59e0b', color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer', marginTop: '10px' }}>
                Save Service
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADD / EDIT PORTFOLIO                             */}
      {/* ========================================================= */}
      {showPortfolioModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '520px', maxWidth: '100%', background: '#ffffff', borderRadius: '16px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {editingPortfolio ? 'Edit Project' : 'Add Portfolio Project'}
              </h3>
              <button onClick={() => setShowPortfolioModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSavePortfolio} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Project Title *</label>
                <input name="title" defaultValue={editingPortfolio?.title || ''} required style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Category</label>
                  <select name="category" defaultValue={editingPortfolio?.category || 'Interior'} style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Interior">Interior</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Limewash">Limewash</option>
                    <option value="Cabinets">Cabinets</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Location</label>
                  <input name="location" defaultValue={editingPortfolio?.location || 'Richmond, Surrey'} style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <ImageUploadField
                label="After / Completed Photo"
                name="imgAfter"
                required
                value={editingPortfolio?.imgAfter || ''}
                helperText="Upload finished project photo directly from device (Cloudinary CDN ready)"
              />

              <ImageUploadField
                label="Before / In-Progress Photo"
                name="imgBefore"
                value={editingPortfolio?.imgBefore || ''}
                helperText="Optional: Upload before photo for interactive comparison"
              />

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Editorial Note / Highlight</label>
                <input name="editorialNote" defaultValue={editingPortfolio?.editorialNote || 'Spaces made to feel like home'} style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                <input type="checkbox" name="active" defaultChecked={editingPortfolio?.active ?? true} />
                Show in Portfolio Gallery
              </label>

              <button type="submit" style={{ padding: '12px', borderRadius: '8px', background: '#f59e0b', color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer', marginTop: '10px' }}>
                Save Project
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD / EDIT REVIEW                                */}
      {/* ========================================================= */}
      {showReviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '520px', maxWidth: '100%', background: '#ffffff', borderRadius: '16px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {editingReview ? 'Edit Review' : 'Add Customer Review'}
              </h3>
              <button onClick={() => setShowReviewModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Customer Name *</label>
                  <input name="n" defaultValue={editingReview?.n || ''} required style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Location</label>
                  <input name="l" defaultValue={editingReview?.l || 'London'} style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Services Done (comma-separated)</label>
                <input name="t" defaultValue={(editingReview?.t || ['Interior']).join(', ')} style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Review / Testimonial Quote *</label>
                <textarea name="q" rows={4} defaultValue={editingReview?.q || ''} required style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', lineHeight: '1.5' }} />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input type="checkbox" name="verified" defaultChecked={editingReview?.verified ?? true} />
                  Verified Client
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input type="checkbox" name="active" defaultChecked={editingReview?.active ?? true} />
                  Publish Live
                </label>
              </div>

              <button type="submit" style={{ padding: '12px', borderRadius: '8px', background: '#f59e0b', color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer', marginTop: '10px' }}>
                Save Review
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
