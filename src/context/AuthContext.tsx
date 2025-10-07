/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { useDetailUserQuery } from '../api/auth';
import { getAuthToken, setAuthToken, removeAuthToken } from '../api/auth';
import { useNavigate } from 'react-router-dom';

interface User {
  name: string;
  email: string;
  profileCompleted?: boolean;
  interests?: string[];
  incomeRange?: string;
  expenseCategories?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [user, setUser] = useState<User | null>(null);
  const { data, isLoading, refetch } = useDetailUserQuery(token || '');

  useEffect(() => {
    if (data) {
      setUser(data);
    } else {
      setUser(null);
    }
  }, [data]);

  const login = (newToken: string) => {
    setAuthToken(newToken, true);
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading: isLoading, token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
