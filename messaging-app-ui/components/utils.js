export async function fetchMessages(endpoint, queryParams = {}) {
  const query = new URLSearchParams(queryParams).toString();
  const url = `${endpoint}messages?${query}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export function scrollToBottom(ref) {
  ref.current?.scrollIntoView({ behavior: 'smooth' });
}

export async function sendMessage(
  endpoint,
  token,
  messageContent,
  recipientUsername = null
) {
  try {
    const response = await fetch(`${endpoint}messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content: messageContent, recipientUsername })
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}
