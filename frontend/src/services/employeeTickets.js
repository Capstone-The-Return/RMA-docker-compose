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
  return res.json();
};

export const updateTicket = async (id, data) => {
  const res = await fetch(`${API_URL}/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to update ticket');
  }
  return res.json();
};


export const deleteTicket = async id => {
  await fetch(`${API_URL}/tickets/${id}`, { method: 'DELETE' });
};
