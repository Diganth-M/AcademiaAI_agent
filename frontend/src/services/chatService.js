export const getChatHistory = async (documentId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:8080/api/chat/history/${documentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
};
