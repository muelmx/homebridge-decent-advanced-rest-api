import { Service, PlatformAccessory, CharacteristicValue, HapStatusError } from 'homebridge';
import { DeviceState } from './config';
import { DeviceService } from './deviceService';

import { DecentHomeBridgePlatform } from './platform';

export class MachineSwitchAccessory {
  private service: Service;

  constructor(
    private readonly platform: DecentHomeBridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly deviceBridge: DeviceService,
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

    deviceBridge.onUpdate((state) => {
      const characteristic = this.service.getCharacteristic(
        this.platform.Characteristic.On,
      );
      try {
        const val = this.extractValueFromState(state);
        characteristic.updateValue(val);
      } catch (error) {
        characteristic.updateValue(error as Error | HapStatusError);
      }
    });
  }

  async getState(): Promise<CharacteristicValue> {
    return this.extractValueFromState(this.deviceBridge.state);
  }

  private extractValueFromState(state: DeviceState): CharacteristicValue {
    const val = state.isOn;
    if (val === undefined) {
      throw new this.platform.api.hap.HapStatusError(
        this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE,
      );
    }
    return val;
  }

  async setState(value: CharacteristicValue) {
    try {
      await this.deviceBridge.setStatus(value as boolean);
    } catch (error) {
      this.platform.log.warn('error switch', error);
    }
  }
}
