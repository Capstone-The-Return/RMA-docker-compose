import { 
  notifyTicketCreated, 
  notifyTechnicalStatusChange,
  notifyTechnicalNoteAdded
} from './notificationService';

const API_URL = import.meta.env.VITE_API_URL;

export const getAllTickets = async () => {
  const res = await fetch(`${API_URL}/tickets`);
  return res.json();
};

export const createTicket = async (data) => {
  const res = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to create ticket');
  }
  
  const ticket = await res.json();
  
  // NOTIFY: New ticket created
  try {
    await notifyTicketCreated(ticket, 'employee');
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
  
  return ticket;
};

export const updateTicket = async (id, data, updatedBy = 'system') => {
  // First, get the current ticket to compare values
  const currentRes = await fetch(`${API_URL}/tickets/${id}`);
  const currentTicket = await currentRes.json();
  
  const oldTechStatus = currentTicket.technical_status;
  
  // Update the ticket
  const res = await fetch(`${API_URL}/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      last_updated: new Date().toISOString()
    })
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to update ticket');
  }
  
  const updatedTicket = await res.json();
  
  try {
    if (data.technical_status && data.technical_status !== oldTechStatus) {
      const isNullToPending = 
        (!oldTechStatus || oldTechStatus === null) && 
        data.technical_status.toLowerCase() === 'pending';
      
      if (!isNullToPending) {
        await notifyTechnicalStatusChange(
          updatedTicket, 
          oldTechStatus, 
          data.technical_status, 
          'employee'
        );
      }

      if(data.technical_notes){
        await notifyTechnicalNoteAdded(updatedTicket,data.technical_notes,'employee');
      }
    }
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
  
  return updatedTicket;
};

export const deleteTicket = async (id) => {
  await fetch(`${API_URL}/tickets/${id}`, { method: 'DELETE' });
};