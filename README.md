# vigilant-guacamole
WIP hex handler for betaflight

alias hex='node /Web/vigilant-guacamole/hex.js'

hex --config unified_targets/configs/KAKUTEF4V2.config --firmware obj/betaflight_4.1.0_STM32F405.hex

hex --config unified_targets/configs/KAKUTEF4V2.config --offset 0x080FC000
