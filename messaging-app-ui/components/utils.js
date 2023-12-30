async function fetchMessages(endpoint, queryParams = {}) {
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

export default fetchMessages;
