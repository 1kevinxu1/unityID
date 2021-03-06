function Bitmap(width, height) {
    this.width = width;
    this.height = height;
    this.pixel = new Array(width);
    for (var x = 0; x < width; x++) {
        this.pixel[x] = new Array(height);
        for (var y = 0; y < height; y++)
            this.pixel[x][y] = [0, 0, 0, 0];
    }
}

Bitmap.prototype.dataURL = function() {
    function sample(v) {
        return ~~(Math.max(0, Math.min(1, v)) * 255);
    }

    function gamma(v) {
        return sample(Math.pow(v, .45455));
    }

    function row(pixel, width, y) {
        var data = "\0";
        for (var x = 0; x < width; x++) {
            var r = pixel[x][y];
            data += String.fromCharCode(gamma(r[0]), gamma(r[1]),
                                        gamma(r[2]), sample(r[3]));
        }
        return data;
    }

    function rows(pixel, width, height) {
        var data = "";
        for (var y = 0; y < height; y++)
            data += row(pixel, width, y);
        return data;
    }

    function adler(data) {
        var s1 = 1, s2 = 0;
        for (var i = 0; i < data.length; i++) {
            s1 = (s1 + data.charCodeAt(i)) % 65521;
            s2 = (s2 + s1) % 65521;
        }
        return s2 << 16 | s1;
    }

    function hton(i) {
        return String.fromCharCode(i>>>24, i>>>16 & 255, i>>>8 & 255, i & 255);
    }

    function deflate(data) {
        var len = data.length;
        return "\170\1\1" +
            String.fromCharCode(len & 255, len>>>8,
                                ~len & 255, (~len>>>8) & 255) +
            data + hton(adler(data));
    }

    function crc32(data) {
        var c = ~0;
        for (var i = 0; i < data.length; i++)
            for (var b = data.charCodeAt(i) | 0x100; b != 1; b >>>= 1)
                c = (c >>> 1) ^ ((c ^ b) & 1 ? 0xedb88320 : 0);
        return ~c;
    }

    function chunk(type, data) {
        return hton(data.length) + type + data + hton(crc32(type + data));
    }

    function base64(data) {
        enc = "";
        for (var i = 5, n = data.length * 8 + 5; i < n; i += 6)
            enc +=
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[
                (data.charCodeAt(~~(i/8)-1) << 8 | data.charCodeAt(~~(i/8))) >>
                7 - i%8 & 63];
        for (; enc.length % 4; enc += "=");
        return enc;
    }

    var png = "\211PNG\r\n\32\n" +
        chunk("IHDR", hton(this.width) + hton(this.height) + "\10\6\0\0\0") +
        chunk("IDAT", deflate(rows(this.pixel, this.width, this.height))) +
        chunk("IEND", "");

    return "data:image/png;base64," + base64(png);
}
