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
* Userland exploit works 5.05 to 13.04 as is.

# FAQ & Troubleshooting

**Q: Will this work on 13.02 or above?**
Only the userland, you cannot jailbreak above 13.00 with the files in this repo.

**Q: Do I need an internet connection?**
You need any form of a network connection, not specifically internet. You can use your mobile phone hotspot or anyting else available. Vue will not launch the exploit without a network connection and will display "There was a problem connecting to the internet". Please see [Connection Instructions](https://github.com/Vuemony/vue-after-free?tab=readme-ov-file#connecting-to-the-internet). 

**Q: I am getting "There is a network communication issue" error.**
This indicates that either Vue has updated or your save file has reset. Use your own profile backup's save, or if using the system backup from this repo, unpack the `encryptedsavebackup.zip` to a USB and import it with the PS4 saved data management. Or if all the internal data is gone you can use the `OnlineSave` that is signed to VueUser to enable the jailbreak again, or resign it to your account. It is recommended to keep a copy of it which is signed to your main user or a spare user. For more specific instructions see the [Gettting the jailbreak again](https://github.com/Vuemony/vue-after-free#getting-the-jailbreak-again) section.

**Q: I am getting "This service requires you to sign in to PlayStation Network" even after replacing the save file, how can I fix it?**
Your Vue app most likely updated. This usually happens when not using a DNS or blocking Sony servers. You will have to delete and reinstall it. You can use the Extended storage method to do that. 

**Q: I ran Vue and the app crashed?**
If the app crashes the exploit failed, shutdown the console and try again.

**Q: I ran Vue and my console shutdown, what do I do?**
If a kernel panic occurred you may need to press the power button on your console twice, then retry running the exploit.

**Q: How can I run a payload?**
Closing and reopening Vue is required between running JS payloads, but .bin or .elf payloads can be run one after the other. Select the payload from the UI in the Payload Menu.

**Q: Can I run the jailbreak offline?**
No. PS Vue requires any form of network connection. Internet is not required, so you can use any network like home WiFi, a hotspot from your mobile phone, a network from a microcontroller like ESP32, or an Ethernet network from a repurposed PPPwn device.

**Q: My payload is not recognized, what should I do?**
Format your USB drive to MBR partition and exFAT format.

> [!IMPORTANT]
> The Vue save file may occasionally reset. To avoid issues please copy the encrypted save to a USB, from the PS4 settings menu for the user that is used to run the jailbreak, for easy future recovery.   

> [!IMPORTANT]
> DO NOT change your np environment via Debug Settings, it will cause you to be unable to use a backup save file. And makes it incompatible with the current fake sign in payload. 


# Introduction 
The PS Vue exploit can be run a number of ways.
Below are requirments and instructions on how to apply the different methods. Please create backups of savedata relevant to running the exploit and of your own from games.   

Usually the Vue exploit uses the save file to load jailbreak data from the HDD, if the data becomes corrupted making you stuck on "There is a network communication issue" error" the Vue `OnlineSave` can be used to recover. Adittionally by using Vue from extended storage and resigning the `OnlineSave` and a fake activated or real PSN account you can retain all current data, or recover and jailbreak no matter what after jailbreak related data corruption. 

If you can already jailbreak and want to try Vue just use the manual method. 

If you cannot jailbreak and have no activated or real PSN account you will need to use the SystemBackup which will erase all current data on the console. 

Lastly Vue has a fun UI with cats and Theme support for you to tinker with alongside a payload menu and auto run options but if you'd like to skip all that and simply jailbreak and load the payload from the USB then you can use the Lite version for any of the 3 methods Manual, Extended Storage andSystem Backup.

## Requirements

### For Jailbroken PS4
  * Any kind of network connection to launch the app.
  * Fake or legit activated PS4 user account.
  * FTP access to the console.
  * USB flash drive.

  * PlayStation Vue 1.01 base and 1.24 patch.(Referred to as "PS Vue or Vue" later in the guide). [Download](https://www.mediafire.com/file/45owcabezln2ykm/CUSA00960.zip/file)

### For Non-Jailbroken PS4 Extended Storage and Save Resign
  * Internet connection on the PS4. 
  * Fake or legit activated PS4 user account.
  * 256GB or above USB/HDD/SSD. Any drive larger than 256GB will also work.
  > [!IMPORTANT]
  > A **USB 3.0 cable** must be used to connect the drive to the PS4. USB 2.0 cables will **not** work for the extended storage method.
  * A way to resign a save file. A jailbroken PS4 or a Discord bot or Save Wizard.
  > [!IMPORTANT]
  > You will resign the save file that installs the exploit data through the internet.

### For Non-Jailbroken PS4 System Backup 
  * Any kind of network connection to launch the app.
  * USB flash drive.
  * System backup file.
> [!WARNING]
> Restoring the system backup will erase all data on your console, then apply the Vue app and it's exploit data to it.   

# Setup Instructions
## Jailbroken PS4
If you are already jailbroken and want to update the exploit files use the udpate.js or see [Exploit update](https://github.com/Vuemony/vue-after-free#updating-vue-exploit)
A network connection of any kind is required, before trying to run Vue please connect to a local network even if it does not have internet. [Connection Instructions](https://github.com/Vuemony/vue-after-free?tab=readme-ov-file#connecting-to-the-internet)
  1. Jailbreak your console.
  2. Enable FTP.
  3. Install Apollo Save Tool. [Download](https://github.com/bucanero/apollo-ps4/releases/latest)
  4. Download PS Vue 1.01 pkg and 1.24 patch and place them on the USB. [Download](https://www.mediafire.com/file/45owcabezln2ykm/CUSA00960.zip/file)
  5. Open Apollo Save Tool and fake activate your account by going to `User Tools`>`Activate PS4 Accounts` then press R2 then X and then keep pressing `O` till you are asked if you want to exit to the XMB accept with `X` then restart the console and jailbreak again.
  6. Connect to the console with FTP.
  7. Download the `VueManualSetup.7z` or `VueLiteManualSetup.7z` from releases. If you choose Lite mode the exploit will always launch as soon as you open the app after the initial prompt.
  8. Go to the following path with FTP `/user/download/CUSA00960/` (create path if needed) and place `download0.dat` there.
  9. On your USB unpack the save.zip ( or FTP to `/data/fakeusb/` ). The files will show up in USB Saves as if it is a real USB. It can be toggled in Apollo Settings>USB Saves Sources to be the only thing displayed even while a real USB is plugged in.
  10. In the root of your USB place HEN or GoldHEN named as `payload.bin`. Or place it in `/data/`. It will be loaded from `/data/` in the future so you do not need the USB after the first time.
  11. Plug the USB into the console.
  12. In Apollo Save Tool go to USB Saves and select the PS Vue save(CUSA00960) and choose the option "Copy save game to HDD".
  13. Install PS Vue from your package installer, make sure `Background Installation` is off press on yes when it asks if you want to install it again (only for 1.01) then install the 1.24 patch. 
  14. Reboot your console then open PS Vue you will be told "This service requires you to sign in to PlayStation Network" press OK to continue, run the exploit by pressing on the jailbreak button or configure the autoloader and auto close. Note if using HEN before setting up Auto Close please edit the config.js and add 20 seconds to the close delay by writing `20000`. 
  * Backup the current save file to a USB via the console settings. Resign an `OnlineSave` in case of exploit file corruption.
  15. Optionally after jailbreaking run the [np-fake-signin](https://github.com/Vuemony/vue-after-free/blob/main/README.md#np-fake-signin) payload to avoid the PSN pop-up. Lastly in this repo in src/icon is the Vue custom icon. If you'd like to set it up FTP to /user/appmeta/CUSA00960 delete icon0.png and place the one from this repo there, then reboot the console.

## For Non-Jailbroken PS4 Extended Storage and Save Resign
### Extended Storage Setup 

> [!WARNING]
> This will wipe your external drive.

 An internet connection of any kind is required, before trying to run Vue please connect to a local network see: [Connection Instructions](https://github.com/Vuemony/vue-after-free?tab=readme-ov-file#connecting-to-the-internet)
  1. Download **balenaEtcher** for Windows, macOS, or Linux from: [https://etcher.balena.io](https://etcher.balena.io/#download-etcher)
  2. Download `VueExtStorage.7z` from Releases.
  3. Extract the downloaded `.7z` file. Inside, you will see a `VueExtImg.7z` extract it. Inside, you will see a `.zip` image file.
  4. Connect your Drive to your computer (using a dock/enclosure or spare M.2 slot).
  > [!IMPORTANT]
  > When connecting the drive to your PS4, use a **USB 3.0 cable**. USB 2.0 cables will **not** work.
  5. Open **balenaEtcher**.
  6. Click **“Flash from file”** and select the extracted **`.zip`** image.
  7. Click **“Select target”** and choose your Drive. 
  8. Click **“Flash!”** to start the process.
  > Etcher will appear stuck at **0%** for a while, then at **85-99%** for several minutes.
  > This is normal, let it finish without interruption!
  > If you encounter damaged image warnings, reboot your pc, redownload the image.
  9. Go to Settings -> Storage -> Extended Storage -> Applications  -> [Press Options on controller] -> Move To System Storage
  10. Press X on the Vue App to tick and select it. 
  11. Go to "Move" and press X.
  12. Press OK on the prompt to move the app to internal storage. It will then move to internal storage.

### Save File Resign Online Version 
A network connection of any kind is required, before trying to run Vue please connect to a local network even if it does not have internet, directly after restoring the system backup but if it does make sure you have first read the instructions  >. [Connection Instructions](https://github.com/Vuemony/vue-after-free?tab=readme-ov-file#connecting-to-the-internet)
 * The `OnlineSave` requires an active internet connection. 
  1. In the `VueExtStorage.7z` you extracted earlier is a folder called `OnlineSaveResign` and inside it `CUSA00960`, it has an encrypted save which you need to resign to your current account on the targed console. You can do this with a jailbroken PS4 or a Discord bot or Save Wizard. `11695c49_CUSA00960_localstorage.aes` Has a decrypted save file too. Both can be used and be resigned. There is an empty PS4 folder in the `PS4\SAVEDATA` create a new folder with your Account ID and inside it place the CUSA00960 resigned save file. 
  * To find your current Account ID move any save file to a USB and see the 16 character folder in `PS4/SAVEDATA/XXXXXXXXXXXXXXXX` and resign the save file to it.
  2. In the root of your USB place HEN or GoldHEN named as `payload.bin`. It will be loaded from `/data/` in the future so you do not need the USB after the first time.
  3. After resigning the save file place it on a USB in the path `PS4/SAVEDATA/XXXXXXXXXXXXXXXX/CUSA00960` and plug it into your PS4. And make a backup of the save file you just resgined. 
  4. Go to `Settings>Apliccation Saved Data Management>Saved Data on USB Storage Device>Copy to System Storage`. Select the Vue save file and move it.
  5. Open the application you will be told "This service requires you to sign in to PlayStation Network" press OK to continue and wait a few seconds a screen will appear asking you to pick between a full install and a lite install choose whichever you want. If you choose Lite mode the exploit will always launch as soon as you open the app after the initial prompt. Optionally after jailbreaking run the [np-fake-signin](https://github.com/Vuemony/vue-after-free/blob/main/README.md#np-fake-signin) payload to avoid the PSN pop-up.
* After a successful jailbreak you will only need to run the app again in the future. Note if using HEN before setting up Auto Close please edit the config.js and add 20 seconds to the close delay by writing `20000`.

## Non-Jailbroken PS4 System Backup 
A network connection of any kind is required, before trying to run Vue please connect to a local network even if it does not have internet, directly after restoring the system backup but if it does make sure you have first read the instructions  >. [Connection Instructions](https://github.com/Vuemony/vue-after-free?tab=readme-ov-file#connecting-to-the-internet)
  1. Format your USB Drive to Exfat.
> [!WARNING]
> This will wipe your drive of all data. Backup any important data.   
  2. Download the `VueSystemBackup.7z` or `VueLiteSystemBackup.7z` from Releases. If you choose Lite mode the exploit will always launch as soon as you open the app after the initial prompt.
  3. Unpack the contents of the zip onto the USB.
  4. Plug the USB into your console.
  5. If you have a real PSN account on the console go to Settings>Application Saved Data Management>Saved Data in System Storage and backup your savedata to the USB. (Sufficient space required.)
  * If you cannot access the savedata you do not have a Real PSN account or fake activated account, meaning that if you do not jailbreak first you cannot backup your saves.
  6. Go to Settings>Storage>System Storage>Capture Gallery>All and backup your captures to the USB. (Sufficient space required.)
  7. Go to Settings>System>Back Up and Restore>Restore PS4 and select the system backup there and restore it.
  8. When the console reboots you will have a fake activated user account and PS Vue and it's exploit data.
  9. In the root of your USB place HEN or GoldHEN named as `payload.bin`. It will be loaded from `/data/` in the future so you do not need the USB after the first time.
  10. Safely connect to any network as mentioned above.
  11. Open PS Vue you will be told "This service requires you to sign in to PlayStation Network" press OK to continue run the exploit by pressing on the jailbreak button or configure the autoloader and auto close. Note if using HEN before setting up Auto Close please edit the config.js and add 20 seconds to the close delay by writing `20000`. Backup the current save file to a USB via the console settings. 
  12. Optionally after jailbreaking run the [np-fake-signin](https://github.com/Vuemony/vue-after-free/blob/main/README.md#np-fake-signin) payload to avoid the PSN pop-up.
  * User account ID is "1111111111111111" you cannot change it but you can create another user and fake activate it (instructions below), then while jailbroken follow the instructions above for jailbroken users to set up PS Vue while signed into the newly activated account. Resign an `OnlineSave` in case of exploit file corruption.

# Connecting to the internet.
  1. Navigate to Settings > System > Automatic Downloads, and uncheck "Featured Content", "System Software Update Files" and "Application Update Files".
  2. Navigate to **Settings > Network > Set Up Internet Connection**
  3. Choose your connection type:
     - **Use WiFi** > **Custom** Scroll to the bottom and select **Set Up Manually** > **Enter Manually** Enter your network name then set security to "WPA-PSK/WPA2-PSK and put in the password" Proceed to the next step.
     - **Use a LAN Cable** > **Custom**: Proceed to the next step.
  4. **IP Address Settings** Choose `Automatic`.
  5. **DHCP Host Name** Choose `Do not Specify`.
  6. **DNS Settings** Choose `Manual`.
  7. Set **Primary DNS** to `127.0.0.2` or `62.210.38.117` (leave Secondary DNS blank). 127.0.0.2 will limit your to local network connections only, while the 62.210.. DNS is the Nomadic DNS which blocks Sony servers and allow a normal internet connection.
  8. **MTU Settings** Choose "Automatic", **Proxy Server** Choose "Do Not Use".
  9. Press **Test Internet Connection** wait for the connection to establish. 
> [!NOTE]
> If you get an IP Address but do not get an internet connection then the 62.210... DNS is working. IF you get a successful internet connection it has failed to apply due to limitations in your local network. Please use the 127.0.0.2 DNS.
* The internet connection failing does not indicate that it actually cannot connect to the internet, it just means the PS4 cannot communicate with Sony servers which is the point of the DNS.

### Creating a separate user
If you wish to use a new account instead of the default one in the system backup.
  1. Create a new user.
  2. Fake activate it with Apollo Save Tool from User Tools>Activate PS4 Accounts. (optionally with the Account ID you want) then Reboot the console.
  3. On your USB unpack the save.zip from the VueManualSetup.zip in Releases.
  4. In Apollo Save Tool go to USB Saves and select the PS Vue save(CUSA00960) and choose the option "Copy save game to HDD".
  

### Updating Vue Exploit
  1. Download the `VueManualSetup.7z` and replace download0.dat in `/user/download/CUSA000960/` and delete download0_info.dat with FTP while jailbroken.

### Updating Vue Exploit to Lite 
1. Download the `VueManualLite.7z` and replace download0.dat in `/user/download/CUSA000960/` and delete download0_info.dat with FTP while jailbroken.

# Getting the jailbreak again
On occasion your Vue app may update or your save data may reset or your exploit data corrupts. This will make you unable to jailbreak but it is fixable.
If Vue updated or you accidentally deleted it. 
  1. Make sure the app is currently deleted if it updated. 
  2. Rebuild your database in safe mode.
  3. Follow the [Extended Storage Setup](https://github.com/Vuemony/vue-after-free#extended-storage-setup) to get it back.
  4. Use the `OnlineSave` by either importing it or resigning it to your current account. Then launch Vue while you have a real internet connection see [Connection Instructions](https://github.com/Vuemony/vue-after-free?tab=readme-ov-file#connecting-to-the-internet).
  5. Rebuild the FPKG database by following the guide here [Rebuilding FPKG Database](https://consolemods.org/wiki/PS4:Rebuilding_FPKG_Database)

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
For some config changes to apply the application needs to be closed and opened again.   
Vue comes with a few custom options. Firstly the jailbreak button auto detects firmware and the Lapse exploit from 7.00-12.02, as of 12.50-13.00 it then runs the Netctrl exploit. You can change the defaults in the config menu in the JB Behaviour section.   
Another available option is to automatically launch a kernel exploit upon opening the Vue app. You can choose to either automatically launch Lapse or Netctrl on their respective compatible firmwares. Auto Lapse and Auto Poop.    
After a successful jailbreak run you can choose to have the application automatically close, the Auto Close option.   
Music can be enabled or disabled.

# Automatic Payloads
In config.js you can add .bin or .elf files to be loaded automatically on kernel exploit completion. HEN or GoldHEN should not be added there as they are already loaded via USB or from the /data/ directory automatically.
Example: `/mnt/sandbox/download/CUSA00960/payloads/kernel_dumper.bin`

# NP-Fake-SignIn
The np-fake-signin payload gets rid of the first PS Vue pop-up asking you to sign into PSN. It can be launched from the payloads menu.

# Update
The update.js payload allows you to grab the latest files in the repo without needing to reinstall anything. Only works for normal UI version not for Lite mode.  

# Themes 
Themes can be added my simply copying the folder to `/download0/themes/` the default theme provides a good example of how a theme should be written.

# Credits

- [c0w-ar](https://github.com/c0w-ar/) — Lapse and NetCtrl porting  , Reverse Engineering
- [earthonion](https://github.com/earthonion) — UI, initial JS injection, Payload host, Netctrl porting, binloader, Reverse engineering and remote installer
- [ufm42](https://github.com/ufm42) — Userland Exploit and reverse engineering
- [D-Link Turtle](https://github.com/iMrDJAi) — General support for userland exploition
- [Gezine](https://github.com/gezine) — Local JS method and PSN bypass research
- [Helloyunho](https://github.com/Helloyunho) — TypeScript port  , Reverse Engineering
- [Dr.Yenyen](https://github.com/DrYenyen) — Extensive testing, quality control, end‑user support/ideas, system backup and extended storage method
- [AlAzif](https://github.com/Al-Azif) — Reference for exploit table, retail application advice, Lapse AIO Fix kpatches and 12.50-13.00 kpatches
- abc — Lapse
- [TheFlow](https://github.com/TheOfficialFloW) — NetCtrl
- [Lua Loader project](https://github.com/shahrilnet/remote_lua_loader) — Remote Lua loader foundation
- [Cryptogenic](https://github.com/Cryptogenic/PS4-6.20-WebKit-Code-Execution-Exploit) — Refence for CVE-2018-4441
- [rebelle3](https://github.com/rebelle3/cve-2017-7117) — Reference for CVE-2017-7117

## payload sources:
- [elfldr.elf](https://github.com/ps4-payload-dev/elfldr) by John Törnblom
- [AIOfix_network.elf](https://github.com/Gezine/BD-JB-1250/blob/main/payloads/lapse/src/org/bdj/external/aiofix_network.c) by Gezine
- [np-fake-signin](https://github.com/earthonion/np-fake-signin) by earthonion
