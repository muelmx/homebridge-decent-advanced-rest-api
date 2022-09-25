import { Service, PlatformAccessory, CharacteristicValue, HapStatusError } from 'homebridge';
import { DeviceState } from './config';
import { DeviceService } from './deviceService';

import { DecentHomeBridgePlatform } from './platform';

const defaultWaterTankSize = 1500;

export class WaterLevelAccessory {
  private service: Service;

  constructor(
    private readonly platform: DecentHomeBridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly deviceBridge: DeviceService,
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

    deviceBridge.onUpdate((state) => {
      const characteristic = this.service.getCharacteristic(
        this.platform.Characteristic.CurrentRelativeHumidity,
      );
      try {
        const val = this.extractValueFromState(state);
        characteristic.updateValue(val);
      } catch (error) {
        characteristic.updateValue(error as Error | HapStatusError);
      }
    });
  }

  async getWaterLevel(): Promise<CharacteristicValue> {
    return this.extractValueFromState(this.deviceBridge.state);
  }

  private extractValueFromState(state: DeviceState): CharacteristicValue {
    const val = state.waterLevel;
    if (val === undefined) {
      throw new this.platform.api.hap.HapStatusError(
        this.platform.api.hap.HAPStatus.NOT_ALLOWED_IN_CURRENT_STATE,
      );
    }
    return (val * 100) / (this.waterTankSize ?? defaultWaterTankSize);
  }
}
