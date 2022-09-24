# Decent DE1 Homebridge Advanced Rest Api Plugin

made to work with https://github.com/randomcoffeesnob/decent-advanced-rest-api


## Configuration

The `waterTankSize` attribute is used to calculate the water tank level depending on the amount of water you usually fill it up with.

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
          "waterTankSize": 1500
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