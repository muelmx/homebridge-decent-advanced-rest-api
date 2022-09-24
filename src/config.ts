export type DeviceConfig = {
  host: string;
  name: string;
  waterTankSize?: number;
};

export type DeviceState = {
  isOn: boolean | undefined;
  waterLevel: number | undefined;
  headTemperature: number | undefined;
  steamHeaterTemperature: number | undefined;
  mixTemperature: number | undefined;
};