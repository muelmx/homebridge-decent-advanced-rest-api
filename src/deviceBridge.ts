import { DeviceState } from './config';

export interface DeviceBridge {
  get state(): DeviceState;
  setStatus(value: boolean): Promise<void>;
}
