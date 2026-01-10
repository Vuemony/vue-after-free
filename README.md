# vue-after-free
A PlayStation Vue userland code execution exploit. 

  * Can be chained with the kernel exploit Lapse up to 12.02 and Poopsploit up to 13.00 on PS4 only.

## Requirments
  * Firmware 9.00 or above. 

### For Jailbroken PS4
  * Fake or legit activated PS4 user account.
  * FTP access to the console.
  * USB flash drive.
  * Playstation Vue 1.01 base and 1.xx patch.(Referred to as "PS Vue" later in the guide).

### For Non-Jailbroken PS4
  * USB flash drive.
  * System backup file.
> [!WARNING]
> Restoring the system backup will erase all data on your console, then apply the vue app and it's exploit data to it. 

# Setup Instructions 
## Jailbroken PS4
  1. Jailbreak your console. 
  2. Enable FTP. 
  3. Install Apollo Save Tool. https://pkg-zone.com/details/APOL00004
  4. Install PS Vue 1.01 pkg and 1.xx patch. 
  5. Open PS Vue.
  6. Connect to the console with FTP. 
  7. Go to the following path /mnt/sandbox/CUSA00960_000/download0
  8. Place location.js.aes, XXX, XXX there then close the app. 
  9. Plug the USB into the console.
  10. Open Apollo Save Tool and go to HDD Saves. 
  11. Copy the PS Vue save file to USB with the "Copy save game to USB" option. 
  12. Delete the save file with the "Delete Save Game" option.
  13. On your USB go to the following path "PS4/APOLLO/15c6264b_CUSA00960_localstorage.aes" and delete the localstorage.aes. Then place the one from the repo there. 
  14. In Apollo Save Tool go to USB Saves and select the PS Vue save(CUSA00960) and choose the option "Copy save game to HDD". 
  15. Reboot your console then open PS Vue and wait for the exploit to run.

## Non-Jailbroken PS4
  1. Format your USB Drive to Exfat. 
> [!WARNING]
> This will wipe your drive of all data. Backup any important data. 
  2. Download the SystemBackup.zip from Releases.
  3. Unpack the contents of the zip onto the USB.
  4. Plug the USB into your console. 
  5. If you have a real PSN account on the console go to Settings>Application Saved Data Management>Saved Data in System Storage and backup your savedata to the USB. (Sufficient space required.)
  * If you cannot access the savedata you do not have a Real PSN account or fake activated account, meaning that if you do not jailbreak first you cannot backup your saves.
  6. Go to Settings>Storage>System Storage>Capture Gallery>All and backup your captures to the USB. (Sufficient space required.)
  7. Go to Settings>System>Back Up and Restore>Restore PS4 and select the the system backup there and restore it. 
  8. When the console reboots you will have a fake activated user account and PS Vue and it's exploit data. 
  9. Open PS Vue and wait for the exploit to run.
  * User account ID is "1111111111111111" you cannot change it but you can create another user and fake activate it, then while jailbroken follow the instructions above for jailbroken users to set up PS Vue while signed into the newly activated account.

# Connecting to the internet. 
  1. Navigate to Settings > System > Automatic Downloads, and uncheck "Featured Content", "System Software Update Files" and "Application Update Files".
  2. Navigate to Settings > Network > Check Connect to the Internet, then Set Up Internet Connection.
  3. Connection: Wi-Fi or LAN cable
  4. Set Up: Custom
  5. IP Address: Automatic
  6. DHCP Host Name: Do Not Specify
  7. DNS Settings: Manual
  8. Primary DNS: 62.210.38.117 (Leave the secondary blank as it is)
  9. MTU Settings: Automatic
  10. Proxy Server: Do Not Use
  11. Test the internet connection if you get an IP address it's working. 
  * The internet connection failing does not indicate that it actually cannot connect to the internet, it just means the PS4 cannot communicate with Sony servers which is the point of the DNS

# Credits 


# payload sources:
- elfldr.elf by John Törnblom: https://github.com/ps4-payload-dev/elfldr
- AIOfix_network.elf by Gezine : https://github.com/Gezine/BD-JB-1250/blob/main/payloads/lapse/src/org/bdj/external/aiofix_network.c
