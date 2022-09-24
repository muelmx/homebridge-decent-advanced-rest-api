import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { DeviceBridge } from './deviceBridge';

import { DecentHomeBridgePlatform } from './platform';

const defaultWaterTankSize = 1500;

export class WaterLevelAccessory {
  private service: Service;

  constructor(
    private readonly platform: DecentHomeBridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly dataService: DeviceBridge,
    private readonly waterTankSize?: number,
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Decent')
      .setCharacteristic(
        this.platform.Characteristic.Model,
        'Decent DE1 Water Level',
      )
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'default');

    this.service =
      this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor);
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.name,
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .onGet(this.getWaterLevel.bind(this));
  }

  async getWaterLevel(): Promise<CharacteristicValue> {
    const val = this.dataService.state.waterLevel;
    if (val === undefined) {
      throw new this.platform.api.hap.HapStatusError(
        this.platform.api.hap.HAPStatus.NOT_ALLOWED_IN_CURRENT_STATE,
      );
    }
    return (val * 100) / (this.waterTankSize ?? defaultWaterTankSize);
  }
}
