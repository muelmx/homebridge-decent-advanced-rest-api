import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { DeviceState } from './config';
import { DeviceBridge } from './deviceBridge';

import { DecentHomeBridgePlatform } from './platform';

export class GenericTemperatureAccessory {
  private service: Service;

  constructor(
    private readonly platform: DecentHomeBridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly dataService: DeviceBridge,
    private readonly extractor: (state: DeviceState) => number | undefined,
    private readonly temperatureIdentifier: string,
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        'Decent',
      )
      .setCharacteristic(
        this.platform.Characteristic.Model,
        `Decent DE1 ${this.temperatureIdentifier}`,
      )
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'default');

    this.service =
      this.accessory.getService(this.platform.Service.TemperatureSensor) ||
      this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.name,
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getTemperature.bind(this));
  }

  async getTemperature(): Promise<CharacteristicValue> {
    const temp = this.extractor(this.dataService.state);
    if (temp === undefined) {
      throw new this.platform.api.hap.HapStatusError(
        this.platform.api.hap.HAPStatus.NOT_ALLOWED_IN_CURRENT_STATE,
      );
    }
    return temp;
  }
}
