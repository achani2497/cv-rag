import axios from 'axios';

export const postFetch = async <T>(url: string, payload: any): Promise<T> => {
  const response = await axios.post(url, payload);
  return response.data;
};
