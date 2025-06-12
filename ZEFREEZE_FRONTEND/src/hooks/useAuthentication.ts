import { useAuth } from '../contexts/AuthContext'; 

const response = await axios.get('/notifications', { withCredentials: true });