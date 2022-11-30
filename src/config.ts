export type DeviceConfig = {
  host: string;
  name: string;
  waterTankSize?: number;
  suppressHeadTemperature?: boolean;
  suppressSteamHeaterTemperature?: boolean;
  suppressMixTemperature?: boolean;
  suppressWaterLevel?: boolean;
};

export type DeviceState = {
  isOn: boolean | undefined;
  waterLevel: number | undefined;
  headTemperature: number | undefined;
  steamHeaterTemperature: number | undefined;
  mixTemperature: number | undefined;
};