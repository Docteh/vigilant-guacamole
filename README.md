# vigilant-guacamole
WIP hex handler for betaflight

alias hex='node /[wherever]/vigilant-guacamole/hex.js'

or `npm i https://github.com/Docteh/vigilant-guacamole.git -g`

hex --config unified_targets/configs/KAKUTEF4V2.config --firmware obj/betaflight_4.1.0_STM32F405.hex

hex --config unified_targets/configs/KAKUTEF4V2.config --offset 0x080FC000

If you're flashing just a config, remember to turn off "Whole Chip Erase"!
