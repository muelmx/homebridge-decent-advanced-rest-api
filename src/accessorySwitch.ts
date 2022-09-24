import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { DeviceBridge } from './deviceBridge';

import { DecentHomeBridgePlatform } from './platform';

export class MachineSwitchAccessory {
  private service: Service;

  constructor(
    private readonly platform: DecentHomeBridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly dataService: DeviceBridge,
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Decent')
      .setCharacteristic(
        this.platform.Characteristic.Model,
        'Decent DE1 Switch',
      )
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'default');

    this.service =
      this.accessory.getService(this.platform.Service.Switch) ||
      this.accessory.addService(this.platform.Service.Switch);
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.exampleDisplayName,
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getState.bind(this))
      .onSet(this.setState.bind(this));
  }

  async getState(): Promise<CharacteristicValue> {
    const val = this.dataService.state.isOn;
    if (val === undefined) {
      throw new this.platform.api.hap.HapStatusError(
        this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE,
      );
    }
    return val;
  }

  async setState(value: CharacteristicValue) {
    try {
      await this.dataService.setStatus(value as boolean);
    } catch (error) {
      this.platform.log.warn('error switch', error);
    }
  }
}
