import { Logger } from 'homebridge';
import * as http from 'http';
import { DeviceState } from './config';
import { DeviceService } from './deviceService';

const baseUrl = (host: string) => `http://${host}`;
const statusUrl = (host: string) => `${baseUrl(host)}/api/status`;
const detailsUrl = (host: string) => `${baseUrl(host)}/api/status/details`;

type DE1StatusResponse = {
  is_active: boolean;
};

type DE1DetailsResponse = {
  state: string;
  substate: string;
  profile?: string;
  head_temperature?: number;
  mix_temperature?: number;
  steam_heater_temperature?: number;
  water_level?: string;
};

const extractFloatRegex = /[+-]?\d+(\.\d+)?/g;

const invalidState = {
  isOn: undefined,
  headTemperature: undefined,
  mixTemperature: undefined,
  steamHeaterTemperature: undefined,
  waterLevel: undefined,
};

const defaultInterval = 1000;
const defaultTimeout = 200;

export class DE1DeviceService implements DeviceService {
  private intState: DeviceState = {
    ...invalidState,
  };

  public constructor(
    private readonly log: Logger,
    private readonly host: string,
    private readonly pullInterval?: number,
    private readonly timeout?: number,
  ) {
    this.startUpdateRoutine();
  }

  public get state(): DeviceState {
    return this.intState;
  }

  public setStatus(active: boolean): Promise<void> {
    const post_data = JSON.stringify({
      active,
    });
    const options = {
      hostname: this.host.split(':')[0],
      port: this.host.split(':')[1],
      path: '/api/status/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': post_data.length,
      },
    };
    return new Promise((resolve, reject) => {
      const req = http
        .request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            this.log.debug('switch invoked', body);
            try {
              this.parseStatus(JSON.parse(body));
            } catch (error) {
              return reject(error);
            }
            return resolve();
          });
        })
        .on('error', (err) => {
          return reject(err);
        });

      req.write(post_data);
      req.end();
    });
  }

  private startUpdateRoutine() {
    setInterval(async () => {
      this.update();
    }, this.pullInterval ?? defaultInterval);
  }

  private async update() {
    try {
      this.parseStatus(await this.queryEndpoint(statusUrl(this.host)));
      this.parseDetailState(await this.queryEndpoint(detailsUrl(this.host)));
    } catch (error) {
      this.log.warn('error updating machine state', error);
      this.invalidateState();
    }
  }

  private queryEndpoint(url: string): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
      http
        .request(url, { timeout: this.timeout ?? defaultTimeout }, (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            try {
              const state = JSON.parse(body);
              return resolve(state);
            } catch (error) {
              this.invalidateState();
              reject(error);
            }
          });
        })
        .on('error', (err) => {
          this.invalidateState();
          reject(err);
        })
        .end();
    });
  }

  private parseStatus(data: unknown) {
    try {
      const onResponseProto = data as DE1StatusResponse;
      this.state.isOn = onResponseProto.is_active;
    } catch (error) {
      this.log.warn('error parsing machine data', error);
      throw error;
    }
  }

  private parseDetailState(data: unknown) {
    try {
      const onResponseProto = data as DE1DetailsResponse;
      this.state.headTemperature = onResponseProto.head_temperature;
      this.state.steamHeaterTemperature =
        onResponseProto.steam_heater_temperature;
      this.state.mixTemperature = onResponseProto.mix_temperature;
      this.state.waterLevel = onResponseProto.water_level
        ?.match(extractFloatRegex)
        ?.map((v) => parseFloat(v))[0];
    } catch (error) {
      this.log.warn('error parsing machine data', error);
      throw error;
    }
  }

  private invalidateState() {
    this.intState = {
      ...invalidState,
    };
  }
}
