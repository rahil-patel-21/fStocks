// Imports
import { Injectable } from '@nestjs/common';
import { SmartAPI, WebSocketClient } from 'smartapi-javascript';

const smartApi = new SmartAPI({
  access_token:
    'eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IlI1NjY0NDA3NSIsInJvbGVzIjowLCJ1c2VydHlwZSI6IlVTRVIiLCJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6VXhNaUlzSW5SNWNDSTZJa3BYVkNKOS5leUp6ZFdJaU9pSlNOVFkyTkRRd056VWlMQ0psZUhBaU9qRTNNRGd4TURnME9UQXNJbWxoZENJNk1UY3dPREF4T1RJMk55d2lhblJwSWpvaVlUUmpaVFZpWW1VdE1tVTRNUzAwTVRSaExUbGpZbVF0TkRVME0yTXdOalV3TWpKbElpd2liMjF1WlcxaGJtRm5aWEpwWkNJNk15d2ljMjkxY21ObGFXUWlPaUl6SWl3aWRYTmxjbDkwZVhCbElqb2lZMnhwWlc1MElpd2lkRzlyWlc1ZmRIbHdaU0k2SW5SeVlXUmxYMkZqWTJWemMxOTBiMnRsYmlJc0ltZHRYMmxrSWpvekxDSnpiM1Z5WTJVaU9pSXpJaXdpWkdWMmFXTmxYMmxrSWpvaU1tWmlORGhoTUdFdE9HWXpZaTB6WW1FMkxXRmlZV0l0TTJJek1URTBObVExWW1ZM0lpd2lZV04wSWpwN2ZYMC4xY0VoRmtQU2U1bWl6elFtdk5xQmVQRHlJc1g3a0cwV2JIV3BYdG9lMjFhbnN5bkFEY1YwanRIM3hQNkdxcVc5T2FCODllVGR0N1lNaGQtd1JzTjh5ZyIsIkFQSS1LRVkiOiJMOG1yWGNGeSIsImlhdCI6MTcwODAxOTMyNywiZXhwIjoxNzA4MTA4NDkwfQ.kWqFUpHOGqmuh-zwFaO_cyvrf-6LYTqW4TTNQpCMTPTlwiy0E_bmdlWiUqKj3qf3ESH3mBb-CKZAL_j_241xyg',
  api_key: 'L8mrXcFy',
});

@Injectable()
export class AngleOneService {
  async generateToken() {
    // const userDetails = await smartApi.generateSession(
    //   'R56644075',
    //   '3112',
    //   '875908',
    // );
    // console.log({ userDetails });

    return await smartApi.getCandleData({
      exchange: 'NSE',
      symboltoken: '19926',
      interval: 'ONE_MINUTE',
      fromdate: '2023-12-16 09:00',
      todate: '2023-12-16 09:20',
    });
  }
}
