import { useMutation, useQuery, QueryClient } from '@tanstack/react-query';
import api from './api';

export const queryClient = new QueryClient();

export const setAuthToken = (token: string, rememberMe = false) => {
  if (rememberMe) localStorage.setItem('token', token);
  else sessionStorage.setItem('token', token);
  queryClient.clear();
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  queryClient.clear();
};

export const getAuthToken = () =>
  localStorage.getItem('token') || sessionStorage.getItem('token');

export const isAuthenticated = () => !!getAuthToken();

// ======== Login mutation ========
interface LoginData {
  email: string;
  password: string;
}
interface LoginResponse {
  name: string;
  email: string;
  token: string;
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (data: LoginData) => {
      const { data: res } = await api.post<LoginResponse>('/auth/login', data);
      return res;
    },
  });
};

interface RegisterData {
  name: string;
  email: string;
  password: string;
}
interface RegisterResponse {
  token: string;
}

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const { data: res } = await api.post<RegisterResponse>(
        '/auth/register',
        data,
      );
      return res;
    },
    onSuccess: (data) => setAuthToken(data.token, true),
  });
};

export const useDetailUserQuery = (token: string) => {
  return useQuery({
    queryKey: ['detail-user'],
    queryFn: async () => {
      const { data: res } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res;
    },
    enabled: !!token,
  });
};

// ======== Complete Profile mutation ========
interface CompleteProfileData {
  interests: string[];
  incomeRange: string;
  expenseCategories: string[];
}

interface CompleteProfileResponse {
  name: string;
  email: string;
  profileCompleted: boolean;
  interests: string[];
  incomeRange: string;
  expenseCategories: string[];
}

export const useCompleteProfileMutation = () => {
  return useMutation({
    mutationFn: async (data: CompleteProfileData) => {
      const { data: res } = await api.post<CompleteProfileResponse>(
        '/auth/complete-profile',
        data,
      );
      return res;
    },
  });
};

// ======== Update Name & Change Password ========
export const useUpdateNameMutation = () => {
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { data: res } = await api.post('/auth/update-name', payload);
      return res as { name: string; email: string };
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const { data: res } = await api.post('/auth/change-password', payload);
      return res as { ok: boolean };
    },
  });
};
