// authService.js
export const setToken = (token) => {
  localStorage.setItem('jwt', token);
};

export const getToken = () => {
  return localStorage.getItem('jwt');
};

export const clearToken = () => {
  localStorage.removeItem('jwt');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getUserInfo = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    return null;
  }
};
