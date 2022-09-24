import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { DE1DeviceService } from './de1DeviceService';
import { GenericTemperatureAccessory } from './accessoryTemperature';
import { WaterLevelAccessory } from './accessoryWaterLevel';
import { DeviceConfig, DeviceState } from './config';
import { MachineSwitchAccessory } from './accessorySwitch';

export class DecentHomeBridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic =
    this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  discoverDevices() {
    const machines = this.config.machines as DeviceConfig[];

    // loop over the discovered devices and register each one if it has not already been registered
    for (const device of machines) {
      // generate a unique id for the accessory this should be generated from
      // something globally unique, but constant, for example, the device serial
      // number or MAC address
      const uuid = this.api.hap.uuid.generate(device.name);

      const deviceService = new DE1DeviceService(
        this.log,
        device.host,
        this.config.pullInterval,
        this.config.timeout,
      );

      this.addGenericTemperature(
        deviceService,
        uuid,
        'Mix',
        (state) => state.mixTemperature,
        device,
      );

      this.addGenericTemperature(
        deviceService,
        uuid,
        'Steam',
        (state) => state.steamHeaterTemperature,
        device,
      );

      this.addGenericTemperature(
        deviceService,
        uuid,
        'Head',
        (state) => state.headTemperature,
        device,
      );

      this.addWaterLevel(deviceService, uuid, device);

      this.addSwitch(deviceService, uuid, device);
    }
  }

  addGenericTemperature(
    dataService: DE1DeviceService,
    uuid: string,
    key: string,
    accessor: (state: DeviceState) => number | undefined,
    device: DeviceConfig,
  ) {
    const specificUuid = this.api.hap.uuid.generate(`${uuid}-${key}`);
    const existingMix = this.accessories.find(
      (accessory) => accessory.UUID === specificUuid,
    );
    if (existingMix) {
      this.log.info(
        'Restoring existing accessory from cache:',
        existingMix.displayName,
      );
      new GenericTemperatureAccessory(
        this,
        existingMix,
        dataService,
        accessor,
        key,
      );
    } else {
      this.log.info('Adding new accessory:', device.name, key);
      const mixTemp = new this.api.platformAccessory(
        `${device.name} ${key} Temperature`,
        specificUuid,
      );
      mixTemp.context.device = device;
      new GenericTemperatureAccessory(
        this,
        mixTemp,
        dataService,
        accessor,
        key,
      );
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        mixTemp,
      ]);
    }
  }

  addWaterLevel(
    dataService: DE1DeviceService,
    uuid: string,
    device: DeviceConfig,
  ) {
    const specificUuid = this.api.hap.uuid.generate(`${uuid}-water`);
    const existing = this.accessories.find(
      (accessory) => accessory.UUID === specificUuid,
    );
    if (existing) {
      this.log.info(
        'Restoring existing accessory from cache:',
        existing.displayName,
      );
      new WaterLevelAccessory(
        this,
        existing,
        dataService,
        device.waterTankSize,
      );
    } else {
      // the accessory does not yet exist, so we need to create it
      this.log.info('Adding new accessory:', device.name, 'Water Level');
      const mixTemp = new this.api.platformAccessory(
        `${device.name} Water Level`,
        specificUuid,
      );
      mixTemp.context.device = device;
      new WaterLevelAccessory(this, mixTemp, dataService, device.waterTankSize);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        mixTemp,
      ]);
    }
  }

  addSwitch(dataService: DE1DeviceService, uuid: string, device: DeviceConfig) {
    const specificUuid = this.api.hap.uuid.generate(`${uuid}-switch`);
    const existing = this.accessories.find(
      (accessory) => accessory.UUID === specificUuid,
    );
    if (existing) {
      this.log.info(
        'Restoring existing accessory from cache:',
        existing.displayName,
      );
      new MachineSwitchAccessory(this, existing, dataService);
    } else {
      this.log.info('Adding new accessory:', device.name, 'Switch');
      const mixTemp = new this.api.platformAccessory(
        `${device.name}`,
        specificUuid,
      );
      mixTemp.context.device = device;
      new MachineSwitchAccessory(this, mixTemp, dataService);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        mixTemp,
      ]);
    }
  }
}
