// ... existing code ...
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_MY_API_URL}/api/users/all-users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  fetchUsers();
}, []);
// ... existing code ...