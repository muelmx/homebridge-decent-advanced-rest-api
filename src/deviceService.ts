import { DeviceState } from './config';

export interface DeviceService {
  get state(): DeviceState;
  setStatus(value: boolean): Promise<void>;
}
