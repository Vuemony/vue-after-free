To convert any MP4 to HLS:

```bash
ffmpeg -i input.mp4 \
  -profile:v baseline \
  -level 3.0 \
  -start_number 0 \
  -hls_time 2 \
  -hls_list_size 0 \
  -f hls output.m3u8
```

