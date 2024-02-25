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
      //   if (!response) return k500Error;
      //   const result = response.data;
      //   if (!result) return k500Error;
      return response;
    } catch (error) {
      //   try {
      //     if (isSendData) return kUnproccesableData(error?.response?.data);
      //     console.log(JSON.stringify(error), JSON.stringify(error.response.data));
      //   } catch (error) {}
      //   return k500Error;
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
      try {
        // if (isSendData) return kUnproccesableData(error?.response?.data);
      } catch (error) {}
    }
  }
}
