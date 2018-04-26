
[![NPM version](https://img.shields.io/npm/v/bootoast.svg?style=flat-square&label=npm)](https://www.npmjs.com/package/bootoast)
![NPM downloads](https://img.shields.io/npm/dt/bootoast.svg?style=flat-square&label=npm%20downloads)
[![License](https://img.shields.io/npm/l/qoopido.demand.svg?style=flat-square)](https://github.com/odahcam/bootoast)

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/884fb7b79aa446acaa60b1ff22e5429a)](https://www.codacy.com/app/odahcam/bootoast?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=odahcam/bootoast&amp;utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/2ebe930bdb2803dbfdbb/maintainability)](https://codeclimate.com/github/odahcam/bootoast/maintainability)


# Bootoast 🔥

> A [*Boot*][0]strap T[*oast*][1]er library.
> 
> Make your toast notifications with **Bootstrap 3 or 4** `alert`s.


## [Demo!][3]


## Default Settings

```javascript
bootoast.toast({
    message: 'Bootoast!',
    type: 'info',
    position: 'bottom-center',
    icon: null,
    timeout: null,
    animationDuration: 300,
    dismissible: true
});
```

## Options Settings

To use your own settings, take the default example above and replace with your values. You can also remove the keys you will not change.

Option | Default Value | Descrition
:--- | :--- | :---
`message` | `'Helo!'` | Any, **any**, HTML String!
`type` | `'info'` | A raw string that can be any of Bootstrap 3 alert type classes without the `alert-` preffix. [Available types](#types).
`icon` | based on choosen `type` OR `undefined` | An icon following the standard Bootstrap 3 glyphicons name without the `glyphicon-` preffix. [Icons choosen by type](#icon-defaults).
`position` | `'bottom-center'` | A raw string with two segments of align separated by hypehn follo0wing the pattern: `vertical-horizontal`. [Supported positions](#supported-positions).
`timeout` | `false` | The time in seconds for hide the notification (`.alert` element). If `false` or `0`, the notification will not auto-hide. 
`dismissible` | `true` | Shows or hides the dismiss &times; button. It can be `true` or `false`.
`animationDuration` | `300` | The notification hide animation duration in milliseconds (`ms`).

### Supported Types

By default, Bootoast supports all [Bootstrap 3 alert types][2]:

* info
* success
* warning
* danger
 
 [See more about Bootsrap `alert`s][2].
 


### Supported Positions

Supported | Sinonymus
:---: | :---:
`top-center` | `top`
`top-left` | `left-top`
`top-right` | `right-top`
`bottom-center` | `bottom`
`bottom-left` | `left-bottom`
`bottom-right` | `right-bottom`


### Icon Defaults

By default, if it's not defined, it will turn into an icon choosen by the type:

Bootoast type | Bootstrap icon
:---: | :---:
warning | exclamation-sign
success | ok-sign
danger | remove-sign
info | info-sign


## Versioning

Closest as possible to semver (Semantic Versioning).

----

Good Luck. :-)


[0]: https://getbootstrap.com/docs/3.3/
[1]: github.com/odahcam/bootoast
[2]: https://getbootstrap.com/docs/3.3/components/#alerts
[3]: https://codepen.io/odahcam/full/oeoYxm
