#!/usr/bin/env python3
"""Send inject.js to PS4 for execution"""

import argparse
import asyncio
import pathlib
import readline
from datetime import datetime, timezone

import websockets

parser = argparse.ArgumentParser(description="WebSocket client for JSMAF")
parser.add_argument("ip", help="IP address of the PS4")
parser.add_argument(
    "-p", "--port", type=int, default=40404, help="Port number (default: 40404)"
)
parser.add_argument("-d", "--delay", type=int, default=2, help="Delay (default: 2)")

args = parser.parse_args()

IP = args.ip
PORT = args.port
DELAY = args.delay
RETRY = True

LOG_FILE = f"logs_{datetime.now(timezone.utc).strftime('%Y-%m-%d_%H-%M-%S')}_utc.txt"
CURRENT_ATTEMPT = 1
IS_NEW_ATTEMPT = True
ATTEMPT_START_TIME = None

try:
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        f.write("note:\n\n")
except Exception as e:
    print(f"[!] Failed to create log file: {e}")


def log_print(message: str) -> None:
    global CURRENT_ATTEMPT, IS_NEW_ATTEMPT, ATTEMPT_START_TIME

    time_now = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
    log_entry = f"[{time_now}] {message}"

    print(log_entry)

    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            if IS_NEW_ATTEMPT:
                f.write(f"attempt {CURRENT_ATTEMPT}:\n")
                ATTEMPT_START_TIME = datetime.now(timezone.utc)
                IS_NEW_ATTEMPT = False

            f.write(log_entry + "\n")

            if "Disconnected" in message:
                if ATTEMPT_START_TIME:
                    duration = datetime.now(timezone.utc) - ATTEMPT_START_TIME
                    f.write(f"Time Taken: {duration}\n")

                f.write("\n")
                CURRENT_ATTEMPT += 1
                IS_NEW_ATTEMPT = True

    except Exception:
        pass


async def send_file(ws: websockets.ClientConnection, file_path: str) -> None:
    try:
        path = pathlib.Path(file_path)
        if not path.is_file():
            log_print(f"[!] File not found: {file_path}")
            return

        message = path.read_text("utf-8")
        await ws.send(message)

        log_print(f"[*] Sent {file_path} ({len(message)} bytes) to server")
    except Exception as e:
        log_print(f"[!] Failed to send file: {e}")


async def command(ws: websockets.ClientConnection) -> None:
    global RETRY

    loop = asyncio.get_event_loop()
    while ws.state == websockets.protocol.State.OPEN:
        try:
            cmd = await loop.run_in_executor(None, input, ">")
        except (EOFError, KeyboardInterrupt):
            print()
            log_print("[*] Disconnecting...")
            await ws.close()
            RETRY = False
            break

        parts = cmd.split(maxsplit=1)

        if len(parts) == 2 and parts[0].lower() == "send":
            await send_file(ws, parts[1])
        elif cmd.lower() in ("quit", "exit", "disconnect"):
            log_print("[*] Disconnecting...")
            await ws.close()
            RETRY = False
            break
        else:
            log_print("[*] Unknown command. Use: send <path-to-file>")


async def receiver(ws: websockets.ClientConnection) -> None:
    try:
        async for data in ws:
            if isinstance(data, str):
                log_print(data)
    except websockets.ConnectionClosed:
        log_print("[*] Disconnected")
        pass
    except Exception as e:
        log_print(f"[!] {e}")


async def main() -> None:
    while RETRY:
        ws = None
        receiver_task = None
        command_task = None
        try:
            # log_print(f"[*] Connecting to {IP}:{PORT}...")
            async with websockets.connect(f"ws://{IP}:{PORT}", ping_timeout=None) as ws:
                log_print(f"[*] Connected to {IP}:{PORT} !!")
                receiver_task = asyncio.create_task(receiver(ws))
                command_task = asyncio.create_task(command(ws))

                await asyncio.wait(
                    [receiver_task, command_task],
                    return_when=asyncio.FIRST_COMPLETED,
                )
        except Exception as e:
            # log_print(f"[!] Error: {e}")
            # log_print(f"[*] Retrying in {DELAY} seconds...")
            await asyncio.sleep(DELAY)
        finally:
            if receiver_task is not None:
                receiver_task.cancel()
            if command_task is not None:
                command_task.cancel()
            if ws is not None and ws.state != websockets.protocol.State.CLOSED:
                await ws.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
