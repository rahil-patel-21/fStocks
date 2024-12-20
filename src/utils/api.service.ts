// Imports
import axios from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class APIService {
  async post(
    url: string,
    body: any = {},
    headers: any = {},
    auth: any = {},
    options: any = {},
    timeout = 180000,
  ) {
    try {
      const response = await axios.post(url, body, {
        headers,
        auth,
        ...options,
        timeout,
      });
      if (!response) return false;
      const result = response.data;
      if (!result) return false;
      return result;
    } catch (error) {
      return error?.response?.data;
    }
  }

  async get(
    url: string,
    params: any = {},
    headers: any = {},
    config: any = {},
  ) {
    try {
      const response = await axios.get(url, { headers, params, ...config });
      const result = response.data;
      return result;
    } catch (error) {
      return error?.response?.data;
    }
  }
}
