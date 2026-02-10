<p align="center">
    <img width="25%" height="25%" alt="logo2" src="https://github.com/user-attachments/assets/5596a357-61c3-471c-9a1e-b8c3d6de33c8" />
</p>

<h1 align="center"> Vue-After-Free </h1>
<p  align="center">
    A PlayStation Vue userland code execution exploit for Playstation 4.
</p>



> [!NOTE]
> **Need help or having issues?** [Join the discord](https://discord.gg/asBgEtjjVt)

# Vue After Free Userland
CVE-2018-4441 was shortly applied but due to instability and bad success rate it was dropped.
CVE-2017-7117 is used for the userland, and has been chained with Lapse and Poopsploit(Netctrl) kernel exploits on respective firmwares marked below.

> [!IMPORTANT]
> Netctrl stability is low due to high memory usage by the exploit compared to the available memory in Vue.

## Vulnerability Scope
KEX= Kernel Exploit
| vue-after-free (Userland) | Lapse (KEX) | Netctrl (KEX) |
| :------------------------ | :---------- | :--------------- |
| 5.05–13.04                | 1.01–12.02  | 1.01-13.00       |

## Supported by this Repository

This table indicates firmware versions for which the _current version_ of this repository provides a functional tested jailbreak for.

| 7.00-13.00 |
| :--------- |

* By default Lapse is used from 7.00 to 12.02, and Poopsploit from 12.50-13.00. Although you can choose to run Poopsploit on as low as 9.00.
* Userland exploit works 5.05 to 13.02 as is.

# FAQ
Q: Will this work on 13.02 or above? A: Only the userland, you cannot jailbreak above 13.00 with the files in this repo.
Q: I ran Vue and the app crashed? A: If the app crashes the exploit failed reboot the console and try again.
Q: I ran Vue and my console shutdown what do I do? A: If a kernel panic occurred you may need to press the power button on your console twice, then retry running the exploit.
Q: How can I run a payload? A: Closing and Reopening Vue is required between running js payloads, but .bin or .elf payloads can be run one after the other. Select the payload from the UI in the Payload Menu.
Q: Can I run the jailbreak offline? A: No. PS Vue requires any form of network connection, internet is not required as such you can use any network like home WiFi or Hotspot from your mobile phone or a network from a micro controller like ESP32 or an Ethernet network from a reporpused PPPwn device.

> [!IMPORTANT]
> The Vue save file may occasionally reset. To avoid issues please copy the encrypted save to a USB, from the PS4 settings menu for the user that is used to run the jailbreak, for easy future recovery.

## Requirements

### For Jailbroken PS4
  * Fake or legit activated PS4 user account.
  * FTP access to the console.
  * USB flash drive.

  * PlayStation Vue 1.01 base and 1.24 patch.(Referred to as "PS Vue or Vue" later in the guide). [Download](https://www.mediafire.com/file/45owcabezln2ykm/CUSA00960.zip/file)

### For Non-Jailbroken PS4
  * USB flash drive.
  * System backup file.
> [!WARNING]
> Restoring the system backup will erase all data on your console, then apply the Vue app and it's exploit data to it.

# Setup Instructions
## Jailbroken PS4
A network connection of any kind is required, before trying to run Vue please connect to a local network even if it does not have internet. [Connection Instructions](https://github.com/Vuemony/vue-after-free?tab=readme-ov-file#connecting-to-the-internet)
  1. Jailbreak your console.
  2. Enable FTP.
  3. Install Apollo Save Tool. [Download](https://pkg-zone.com/details/APOL00004)
  4. Install PS Vue 1.01 pkg and 1.24 patch. [Download](https://www.mediafire.com/file/45owcabezln2ykm/CUSA00960.zip/file)
  5. Connect to the console with FTP.
  6. Download the `VueManualSetup.7z` from releases.
  7. Go to the following path with FTP `/user/download/CUSA00960` (create path if needed) and place `download0.dat` there.
  8. On your USB unpack the save.zip ( or FTP to `/data/fakeusb/` ). The files will show up in USB Saves as if it is a real USB. It can be toggled in Apollo Settings>USB Saves Sources to be the only thing displayed even while a real USB is plugged in.
  9. In the root of your USB place HEN or GoldHEN named as `payload.bin`. Or place it in `/data/`.
  10. Plug the USB into the console.
  11. In Apollo Save Tool go to USB Saves and select the PS Vue save(CUSA00960) and choose the option "Copy save game to HDD".
  12. Reboot your console then open PS Vue run the exploit by pressing on the jailbreak button or configure the autoloader.
  13. Optionally after jailbreaking run the [np-fake-signin](https://github.com/Vuemony/vue-after-free/blob/main/README.md#np-fake-signin) payload to avoid the PSN pop-up.

## Non-Jailbroken PS4
A network connection of any kind is required, before trying to run Vue please connect to a local network even if it does not have internet. [Connection Instructions](https://github.com/Vuemony/vue-after-free?tab=readme-ov-file#connecting-to-the-internet)
  1. Format your USB Drive to Exfat.
> [!WARNING]
> This will wipe your drive of all data. Backup any important data.
  2. Download the `VueSystemBackup.7z` from Releases.
  3. Unpack the contents of the zip onto the USB.
  4. Plug the USB into your console.
  5. If you have a real PSN account on the console go to Settings>Application Saved Data Management>Saved Data in System Storage and backup your savedata to the USB. (Sufficient space required.)
  * If you cannot access the savedata you do not have a Real PSN account or fake activated account, meaning that if you do not jailbreak first you cannot backup your saves.
  6. Go to Settings>Storage>System Storage>Capture Gallery>All and backup your captures to the USB. (Sufficient space required.)
  7. Go to Settings>System>Back Up and Restore>Restore PS4 and select the system backup there and restore it.
  8. When the console reboots you will have a fake activated user account and PS Vue and it's exploit data.
  9. In the root of your USB place HEN or GoldHEN named as `payload.bin`.
  10. Open PS Vue run the exploit by pressing on the jailbreak button or configure the autoloader.
  11. Optionally after jailbreaking run the [np-fake-signin](https://github.com/Vuemony/vue-after-free/blob/main/README.md#np-fake-signin) payload to avoid the PSN pop-up.
  * User account ID is "1111111111111111" you cannot change it but you can create another user and fake activate it (instructions below), then while jailbroken follow the instructions above for jailbroken users to set up PS Vue while signed into the newly activated account.

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


# Payloads
Vue After Free comes preloaded with some payloads.

> [!IMPORTANT]
> The np-fake-signin should not be run on a real psn account.

## FTP
The `ftp-server.ts` payload gives you sandbox FTP to quickly swap exploit or cosmetic files without running a kernel exploit/jailbreaking.

## WebUI
Example code for how you can run userland code with the browser as the UI. (possible alternative to jsmaf)

## ELFLDR
`elfldr.elf` is used to load elf and bin payloads post exploit when HEN or GoldHEN have not been loaded.

# Config
Vue comes with a few custom options. Firstly the jailbreak button auto detects firmware and the Lapse exploit from 7.00-12.02, as of 12.50-13.00 it then runs the Netctrl exploit. You can change the defaults in the config menu in the JB Behaviour section.
Another available option is to automatically launch a kernel exploit upon opening the Vue app. You can choose to either automatically launch Lapse or Netctrl on their respective compatible firmwares. Auto Lapse and Auto Poop.
Lastly after a successful jailbreak run you can choose to have the application automatically close, the Auto Close option.

# Automatic Payloads
In config.js you can add .bin or .elf files to be loaded automatically on kernel exploit completion. HEN or GoldHEN should not be added there as they are already loaded via USB or from the /data/ directory automatically.
Example: `/mnt/sandbox/download/CUSA00960/payloads/kernel_dumper.bin`

# NP-Fake-SignIn
The np-fake-signin payload gets rid of the first PS Vue pop-up asking you to sign into PSN.
In the payloads section of Vue enable elfldr, then send `np-fake-signin-ps4.elf` with a payload sender or netcat.

# Creating a separate user
If you wish to use a new account instead of the default one in the system backup.
1. Create a new user.
2. Fake activate it with Apollo Save Tool from User Tools>Activate PS4 Accounts. (optionally with the Account ID you want) then Reboot the console.
3. On your USB unpack the save.zip from the VueManualSetup.zip in Releases.
4. In Apollo Save Tool go to USB Saves and select the PS Vue save(CUSA00960) and choose the option "Copy save game to HDD".

# Credits

- [c0w-ar](https://github.com/c0w-ar/) — Lapse and NetCtrl porting  , Reverse Engineering
- [earthonion](https://github.com/earthonion) — UI, initial JS injection, Payload host, Netctrl porting, binloader, Reverse engineering
- [ufm42](https://github.com/ufm42) — Userland Exploit and reverse engineering
- [D-Link Turtle](https://github.com/iMrDJAi) — General support for userland exploition
- [Gezine](https://github.com/gezine) — Local JS method and PSN bypass research
- [Helloyunho](https://github.com/Helloyunho) — TypeScript port  , Reverse Engineering
- [Dr.Yenyen](https://github.com/DrYenyen) — Extensive testing, quality control, and end‑user support/ideas
- [AlAzif](https://github.com/Al-Azif) — Reference for exploit table and retail application advice
- abc — Lapse
- [TheFlow](https://github.com/TheOfficialFloW) — NetCtrl
- [Lua Loader project](https://github.com/shahrilnet/remote_lua_loader) — Remote Lua loader foundation
- [Cryptogenic](https://github.com/Cryptogenic/PS4-6.20-WebKit-Code-Execution-Exploit) — Refence for CVE-2018-4441
- [rebelle3](https://github.com/rebelle3/cve-2017-7117) — Reference for CVE-2017-7117

## payload sources:
- [elfldr.elf](https://github.com/ps4-payload-dev/elfldr) by John Törnblom
- [AIOfix_network.elf](https://github.com/Gezine/BD-JB-1250/blob/main/payloads/lapse/src/org/bdj/external/aiofix_network.c) by Gezine
- [np-fake-signin](https://github.com/earthonion/np-fake-signin) by earthonion
