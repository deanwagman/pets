const usernameRegex = /^[a-zA-Z0-9]{3,30}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidUsername = username => usernameRegex.test(username);
export const isValidPassword = password => passwordRegex.test(password);
export const isValidEmail = email => emailRegex.test(email);