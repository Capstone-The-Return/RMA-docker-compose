import { useEffect, useState, useMemo, useRef } from 'react';
import { getAllTickets, updateTicket, deleteTicket } from '../../services/employeeTickets';
import { getUnreadNotificationsByRole, markAsRead, markAllAsRead } from '../../services/notificationService';
import style from './EmployeePageApp.module.css';
import { FiUsers, FiBell } from "react-icons/fi";
import CustomerFormApp from '../../components/CustomerFormApp/CustomerFormApp.jsx';
import Kanban from '../../components/Kanban/Kanban.jsx';

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  'in-repair': 'In Repair',
  completed: 'Completed',
  rejected: 'Rejected'
};

const RETURN_STATUS_LABELS = {
  requested: 'Requested',
  received: 'Received',
  approved: 'Approved',
  refunded: 'Refunded',
  rejected: 'Rejected'
};

const TECHNICIANS = [
  'Unassigned',
  'Tech One',
  'Tech Two',
  'Tech Three',
  'Tech Four',
  'Tech Five'
];

const formatDate = (iso) => {
  if (!iso) return "-";
  try {
    const date = new Date(iso);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "-";
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return "-";
  }
};

const getNotifTheme = (notif) => {
  const { type, new_technical_status } = notif;
  
  if (type === 'created') return 'info';
  
  if (type === 'technical_status_change') {
    const techStatus = (new_technical_status || '').toLowerCase();
    if (techStatus === 'completed') return 'success';
    if (techStatus === 'rejected') return 'danger';
    if (techStatus === 'approved') return 'info';
    if (techStatus === 'pending') return 'warning';
  }
  
  return 'neutral';
};

export default function EmployeePageApp() {
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [glowColumn, setGlowColumn] = useState(null);
  const [activeTab, setActiveTab] = useState('repair');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifWrapRef = useRef(null);

  // Load tickets
  useEffect(() => {
    getAllTickets().then(setTickets);
  }, [activeTab]);

  // Load unread notifications only
  const loadNotifications = async () => {
    try {
      const data = await getUnreadNotificationsByRole('employee');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedTicket && !saving) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTicket, saving]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onDocDown(e) {
      if (!notifWrapRef.current) return;
      if (!notifWrapRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const unreadCount = notifications.length;

  const handleMarkAsRead = async (notifId) => {
    try {
      await markAsRead(notifId);
      // Remove from list since we only show unread
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications([]);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotifClick = async (notif) => {
    // Mark as read (removes from list)
    await handleMarkAsRead(notif.id);
    
    // Find and open the related ticket
    const ticket = tickets.find(t => t.id === notif.ticket_id);
    if (ticket) {
      openModal(ticket);
    }
    setNotifOpen(false);
  };

  const filteredTickets = useMemo(() => {
    const query = searchQuery?.toLowerCase();

    if (activeTab === 'repair') {
      return tickets.filter(ticket =>
        ticket.record_type === 'repair' &&
        (ticket.status === 'pending' ||
         ticket.status === 'approved' ||
         ticket.status === 'in-repair' ||
         ticket.status === 'completed' ||
         ticket.status === 'rejected') &&
        (ticket.rma?.toLowerCase().includes(query) ||
         ticket.customer?.name.toLowerCase().includes(query) ||
         ticket.product?.name.toLowerCase().includes(query))
      );
    } else if (activeTab === 'return') {
      return tickets.filter(ticket =>
        ticket.record_type === 'return' &&
        (ticket.rma?.toLowerCase().includes(query) ||
         ticket.customer?.name.toLowerCase().includes(query) ||
         ticket.product?.name.toLowerCase().includes(query))
      );
    }
    return [];
  }, [tickets, searchQuery, activeTab]);

  const columns = useMemo(() => ({
    pending: filteredTickets.filter(t => t.status === 'pending'),
    approved: filteredTickets.filter(t => t.status === 'approved'),
    'in-repair': filteredTickets.filter(t => t.status === 'in-repair'),
    completed: filteredTickets.filter(t => t.status === 'completed'),
    rejected: filteredTickets.filter(t => t.status === 'rejected'),
  }), [filteredTickets]);

  const returnColumns = useMemo(() => ({
    requested: filteredTickets.filter(t => t.status === 'requested' || t.status === 'pending'),
    received: filteredTickets.filter(t => t.status === 'received'),
    approved: filteredTickets.filter(t => t.status === 'approved'),
    refunded: filteredTickets.filter(t => t.status === 'refunded'),
    rejected: filteredTickets.filter(t => t.status === 'rejected'),
  }), [filteredTickets]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const id = draggableId;
    const currentTechnicalStatus = tickets.find(t => t.id === id)?.technical_status;
    const newTechnicalStatus = newStatus === 'in-repair' ? 'Pending' : currentTechnicalStatus;

    setTickets(prevTickets => {
      return prevTickets.map(ticket =>
        ticket.id === id ? { ...ticket, status: newStatus, technical_status: newTechnicalStatus } : ticket
      );
    });

    setGlowColumn(newStatus);
    setTimeout(() => setGlowColumn(null), 800);

    try {
      await updateTicket(id, { status: newStatus, technical_status: newTechnicalStatus }, 'Employee');
      // Refresh notifications after update
      await loadNotifications();
    } catch (error) {
      alert('Failed to update ticket status');
      console.error(error);
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === id ? { ...ticket, status: source.droppableId } : ticket
        )
      );
    }
  };

  const handleDelete = async (id) => {
    await deleteTicket(id);
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  const openModal = (ticket) => {
    setSelectedTicket(ticket);
    setEditData({
      assigned_to: ticket.assigned_to || 'Unassigned',
      warranty: ticket.warranty || false,
    });
  };

  const closeModal = () => {
    if (saving) return;
    setSelectedTicket(null);
    setEditData({});
    setShowDeleteConfirm(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedFields = {
        assigned_to: editData.assigned_to === 'Unassigned' ? null : editData.assigned_to,
        warranty: editData.warranty,
      };

      await updateTicket(selectedTicket.id, updatedFields, "Employee");

      setTickets(prev =>
        prev.map(t =>
          t.id === selectedTicket.id ? { ...t, ...updatedFields } : t
        )
      );

      closeModal();
    } catch (error) {
      alert('Error saving changes');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={style.container}>
      {/* Header with bell */}
      <header className={style.headerHeavy}>
        <div className={style.headerLeft}>
          <FiUsers className={style.iconLarge} />
          <h1>Employee Portal</h1>
        </div>
        
        {/* Notification Bell - now in header */}
        <div className={style.notifWrap} ref={notifWrapRef}>
          <button
            className={style.notifButton}
            onClick={() => setNotifOpen((p) => !p)}
            type="button"
            aria-haspopup="menu"
            aria-expanded={notifOpen}
            title="Notifications"
          >
            {/*<FiBell className={style.bellIcon} />*/}
            <span className={style.bell}>🔔</span>
              Notifications
            {unreadCount > 0 && (
              <span className={style.notifBadge}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className={style.notifDropdown} role="menu">
              <div className={style.notifHeader}>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    className={style.markAllRead}
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              {notifications.length === 0 ? (
                <div className={style.notifEmpty}>No new notifications</div>
              ) : (
                <div className={style.notifList}>
                  {notifications.map((n) => {
                    const theme = getNotifTheme(n);
                    const dotCls =
                      theme === "success" ? style.dotSuccess :
                      theme === "danger" ? style.dotDanger :
                      theme === "info" ? style.dotInfo :
                      theme === "warning" ? style.dotWarning :
                      style.dotNeutral;

                    return (
                      <div
                        key={n.id}
                        className={style.notifItem}
                        onClick={() => handleNotifClick(n)}
                        role="menuitem"
                      >
                        <span className={`${style.notifDot} ${dotCls}`}></span>
                        <div className={style.notifContent}>
                          <span className={style.notifRma}>{n.rma}</span>
                          <span className={style.notifMessage}>{n.message}</span>
                          <span className={style.notifWhen}>{formatDate(n.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      
      <p className={style.subtitle}>Manage all RMA tickets and requests</p>

      {/* Tabs - bell removed from here */}
      <div className={style.tabs}>
        <button
          className={`${style.tabButton} ${activeTab === 'repair' ? style.activeTab : ''}`}
          onClick={() => setActiveTab('repair')}
        >
          Repair Tickets
        </button>
        <button
          className={`${style.tabButton} ${activeTab === 'return' ? style.activeTab : ''}`}
          onClick={() => setActiveTab('return')}
        >
          Return Tickets
        </button>
        <button
          className={`${style.tabButton} ${activeTab === 'Request' ? style.activeTab : ''}`}
          onClick={() => setActiveTab('Request')}
        >
          New Request
        </button>
      </div>

      <input
        type="text"
        placeholder={`Search ${activeTab === 'repair' ? 'repair tickets' : 'return tickets'}...`}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className={style.searchBar}
      />

      {activeTab === 'repair' && (
        <Kanban
          columns={columns}
          glowColumn={glowColumn}
          onDragEnd={onDragEnd}
          onCardDoubleClick={openModal}
          status_labels={STATUS_LABELS}
        />
      )}

      {activeTab === 'Request' && <CustomerFormApp />}

      {activeTab === 'return' && (
        <Kanban
          columns={returnColumns}
          glowColumn={glowColumn}
          onDragEnd={onDragEnd}
          onCardDoubleClick={openModal}
          status_labels={RETURN_STATUS_LABELS}
        />
      )}

      {selectedTicket && (
        <div className={style.modalOverlay} onClick={closeModal}>
          <div className={style.modalContent} onClick={e => e.stopPropagation()}>
            <h2>Ticket Details: {selectedTicket.rma}</h2>
            <p><strong>Customer:</strong> {selectedTicket.customer?.name}</p>
            <p><strong>Product:</strong> {selectedTicket.product?.name}</p>
            {selectedTicket.record_type === 'return' && (<p><strong>Status:</strong> {RETURN_STATUS_LABELS[selectedTicket.status]}</p>)}
            
            {selectedTicket.record_type === 'repair' && (
              <>
              <p><strong>Status:</strong> {STATUS_LABELS[selectedTicket.status]}</p>
                <p><strong>Technical Status:</strong> {selectedTicket.technical_status}</p>
                <p><strong>Technical Notes:</strong> {selectedTicket.technical_notes}</p>
                <label>
                  <strong>Assigned to:</strong>
                  <select
                    className={style.modalSelect}
                    value={editData.assigned_to}
                    onChange={e => setEditData({ ...editData, assigned_to: e.target.value })}
                    disabled={saving}
                  >
                    {TECHNICIANS.map(emp => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <label>
              <strong>Warranty:</strong>
              <select
                className={style.modalSelect}
                value={editData.warranty ? 'Yes' : 'No'}
                onChange={e => setEditData({ ...editData, warranty: e.target.value === 'Yes' })}
                disabled={saving}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
            <p><strong>Issue:</strong> {selectedTicket.issue}</p>
            <p><strong>Contact:</strong> {selectedTicket.phone || 'N/A'}, {selectedTicket.email || 'N/A'}</p>
            <p><strong>Purchase Date:</strong> {new Date(selectedTicket.purchase_date).toLocaleString() || 'N/A'}</p>
            <p><strong>Store:</strong> {selectedTicket.store || 'N/A'}</p>
            <p><strong>Created at:</strong> {new Date(selectedTicket.created_at).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(selectedTicket.last_updated).toLocaleString()}</p>
            <p><strong>Notes:</strong> {selectedTicket.notes || 'N/A'}</p>
            <p><strong>Owner:</strong> {selectedTicket.owner || 'N/A'}</p>
            <p>
              <strong>Photo:</strong>{' '}
              {selectedTicket.photo_url
                ? <a href={selectedTicket.photo_url} target="_blank" rel="noopener noreferrer">View Photo</a>
                : 'N/A'}
            </p>

            <div className={style.modalButtons}>
              <button onClick={closeModal} disabled={saving} className={`${style.button} ${style.cancel}`}>
                Cancel
              </button>
              {!showDeleteConfirm && (
                <button onClick={() => setShowDeleteConfirm(true)} disabled={saving} className={`${style.button} ${style.delete}`}>
                  Delete
                </button>
              )}
              <button onClick={handleSave} disabled={saving || showDeleteConfirm} className={`${style.button} ${style.save}`}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {showDeleteConfirm && (
              <div className={style.deleteConfirm}>
                <span>Are you sure you want to delete this ticket?</span>
                <div className={style.confirmButtons}>
                  <button
                    onClick={() => {
                      handleDelete(selectedTicket.id);
                      setShowDeleteConfirm(false);
                      closeModal();
                    }}
                    className={`${style.button} ${style.delete} ${style.confirm}`}
                  >
                    Confirm
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className={`${style.button} ${style.cancel}`}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}