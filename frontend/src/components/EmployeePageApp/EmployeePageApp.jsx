import { useEffect, useState, useMemo } from 'react';
import { getAllTickets, updateTicket, deleteTicket } from '../../services/employeeTickets';
import style from './EmployeePageApp.module.css';
import { FiUsers } from "react-icons/fi";
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

export default function EmployeePageApp() {
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [glowColumn, setGlowColumn] = useState(null);
  const [activeTab, setActiveTab] = useState('repair'); // default στο repair
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    getAllTickets().then(setTickets);
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedTicket && !saving) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTicket, saving]);

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

  // status columns for Kanban
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

// handle drag-and-drop
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const newStatus = destination.droppableId;
    const id = draggableId;

    const currentTechnicalStatus = tickets.find(t => t.id === id)?.technical_status;

    const newTechnicalStatus = newStatus === 'in-repair' ? 'Pending' : currentTechnicalStatus;

    setTickets(prevTickets => {
      const updated = prevTickets.map(ticket =>
        ticket.id === id ? { ...ticket, status: newStatus, technical_status: newTechnicalStatus } : ticket
      );
      return updated;
    });

    setGlowColumn(newStatus);
    setTimeout(() => setGlowColumn(null), 800);

    try {
      await updateTicket(id, { status: newStatus, technical_status: newTechnicalStatus }, 'Employee');
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
      <header className={style.headerHeavy}>
        <FiUsers className={style.iconLarge} />
        <h1>Employee Portal</h1>
      </header>
      <p className={style.subtitle}>Manage all RMA tickets and requests</p>

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
        placeholder={`Search ${activeTab === 'repair' ? 'repair tickets' : 'return requests'}...`}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className={style.searchBar}
      />

      {activeTab === 'repair' && (<Kanban
          columns={columns}
          glowColumn={glowColumn}
          onDragEnd={onDragEnd}
          onCardDoubleClick={openModal}
          status_labels={STATUS_LABELS}
        />)}

      {activeTab === 'Request' && (
        <CustomerFormApp />
      )}

      {activeTab === 'return' && (<Kanban
          columns={returnColumns}
          glowColumn={glowColumn}
          onDragEnd={onDragEnd}
          onCardDoubleClick={openModal}
          status_labels={RETURN_STATUS_LABELS}
        />)}

      {selectedTicket && (
        <div className={style.modalOverlay} onClick={closeModal}>
          <div
            className={style.modalContent}
            onClick={e => e.stopPropagation()}
          >
            <h2>Ticket Details: {selectedTicket.rma}</h2>
            <p><strong>Customer:</strong> {selectedTicket.customer?.name}</p>
            <p><strong>Product:</strong> {selectedTicket.product?.name}</p>
            <p><strong>Status:</strong> {RETURN_STATUS_LABELS[selectedTicket.status] && RETURN_STATUS_LABELS[selectedTicket.status]}</p>
            {selectedTicket.record_type === 'repair' && (
              <><p><strong>Technical Status:</strong> {selectedTicket.technical_status}</p><label>
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
              </label></>
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
            <p><strong>Address:</strong> {selectedTicket.address || 'N/A'}</p>
            <p><strong>Serial Number:</strong> {selectedTicket.serial_number || 'N/A'}</p>
            <p><strong>Purchase Date:</strong> {selectedTicket.purchase_date || 'N/A'}</p>
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
              <button
                onClick={closeModal}
                disabled={saving}
                className={`${style.button} ${style.cancel}`}
              >
                Cancel
              </button>

              {!showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={saving}
                  className={`${style.button} ${style.delete}`}
                >
                  Delete
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={saving || showDeleteConfirm}
                className={`${style.button} ${style.save}`}
              >
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
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className={`${style.button} ${style.cancel}`}
                  >
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
