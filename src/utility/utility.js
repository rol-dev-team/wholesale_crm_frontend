import moment from 'moment';

export const dateTimeFormat = (date) => {
  return moment(date).format('LLL');
};

export const getUserInfo = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
