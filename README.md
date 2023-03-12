# Decent DE1 Homebridge Advanced Rest Api Plugin

made to work with https://github.com/randomcoffeesnob/decent-advanced-rest-api


## Configuration

The `waterTankSize` attribute is used to calculate the water tank level depending on the amount of water you usually fill it up with.

The individual temperature / water level sensors can be disabled by setting the respective flags to true (see _full config_). If you are using automations based on room temperature / humidity it is recommended to disable the sensors.

**Minimal Config**
```
...
"platforms": [
    ...
    {
      "platform": "decent-advanced-rest-api",
      "machines": [
        {
          "name": "Decent DE1",
          "host": "192.168.1.14:8888"
        }
      ]
    }
  ]
```

**Full Config**

```
...
"platforms": [
    ...
    {
      "platform": "decent-advanced-rest-api",
      "timeout": 200,
      "pullInterval": 1000,
      "machines": [
        {
          "name": "Decent DE1",
          "host": "192.168.1.14:8888",
          "waterTankSize": 1500,
          "suppressHeadTemperature": true,
          "suppressMixTemperature": false,
          "suppressSteamHeaterTemperature": true,
          "suppressWaterLevel": true
        }
      ]
    }
  ]

```
**Multi-machine Config**
```
...
"platforms": [
    ...
    {
      "platform": "decent-advanced-rest-api",
      "machines": [
        {
          "name": "My First DE1",
          "host": "192.168.1.14:8888"
        },
        {
          "name": "My Second DE1",
          "host": "192.168.1.15:8888"
        }
      ]
    }
  ]
```

## Known Issues

- The maximum temperature supported by HomeKit is 100°C. In case of the steam heater wrong values might be shown.