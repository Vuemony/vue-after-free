#!/usr/bin/env python3
"""WebSocket client for JSMAF — PS4 log viewer & JS injector"""

import argparse
import asyncio
import pathlib
import readline
from datetime import datetime, timezone

import websockets
from rich.console import Console
from rich.rule import Rule
from rich.text import Text
from rich.theme import Theme

THEME = Theme({
    "ts":     "dim white",
    "info":   "steel_blue1",
    "ok":     "green3",
    "err":    "red3",
    "ps4":    "bright_white",
    "prompt": "steel_blue1 bold",
    "accent": "steel_blue1",
})

console = Console(theme=THEME, highlight=False)

parser = argparse.ArgumentParser(description="WebSocket client for JSMAF")
parser.add_argument("ip",                                       help="PS4 IP address")
parser.add_argument("-p", "--port",  type=int, default=40404,  help="Port  (default: 40404)")
parser.add_argument("-d", "--delay", type=int, default=2,      help="Retry delay in seconds (default: 2)")
args = parser.parse_args()

IP    = args.ip
PORT  = args.port
DELAY = args.delay
RETRY = True

LOG_FILE        = f"logs_{datetime.now(timezone.utc).strftime('%Y-%m-%d_%H-%M-%S')}_utc.txt"
CURRENT_ATTEMPT = 1
IS_NEW_ATTEMPT  = True
ATTEMPT_START   = None


def _ts() -> str:
    return datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]


def _detect(msg: str):
    if msg.startswith("[!]"):
        return "err",  "✕"
    if msg.startswith("[+]") or ("Connected" in msg or "Sent" in msg or "Done" in msg):
        return "ok",   "✓"
    if msg.startswith("[*]"):
        return "info", "›"
    return "ps4", " "


def log_print(message: str) -> None:
    global CURRENT_ATTEMPT, IS_NEW_ATTEMPT, ATTEMPT_START

    ts           = _ts()
    style, icon  = _detect(message)
    clean        = message.lstrip("[+] ").lstrip("[-] ").lstrip("[*] ").strip()

    line = Text()
    line.append(f"  {ts}  ", style="ts")
    line.append(f"{icon} ",  style=style)
    line.append(clean,       style=style if style != "ps4" else "ps4")
    console.print(line)

    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            if IS_NEW_ATTEMPT:
                f.write(f"\nattempt {CURRENT_ATTEMPT}:\n")
                ATTEMPT_START  = datetime.now(timezone.utc)
                IS_NEW_ATTEMPT = False
            f.write(f"[{ts}] {message}\n")
            if "Disconnected" in message:
                if ATTEMPT_START:
                    f.write(f"duration: {datetime.now(timezone.utc) - ATTEMPT_START}\n")
                CURRENT_ATTEMPT += 1
                IS_NEW_ATTEMPT = True
    except Exception:
        pass


def _banner() -> None:
    console.print()
    console.print(Rule(style="accent"))
    title = Text()
    title.append("  VAF  ", style="steel_blue1 bold reverse")
    title.append("  WebSocket Client", style="bright_white bold")
    console.print(title)
    console.print(
        f"  [ts]target  [/ts][accent]{IP}:{PORT}[/accent]"
        f"  [ts]log  [/ts][accent]{LOG_FILE}[/accent]"
    )
    console.print(Rule(style="accent"))
    console.print()
    console.print(
        "  [ts]Commands:[/ts]  "
        "[info]send <file>[/info]  [ts]·[/ts]  "
        "[info]quit[/info]  [ts]·[/ts]  "
        "[ts]Ctrl-C to exit[/ts]"
    )
    console.print()


try:
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        f.write(f"target: {IP}:{PORT}\nnote:\n")
except Exception as e:
    console.print(f"  [err]✕ Could not create log file: {e}[/err]")


async def send_file(ws: websockets.ClientConnection, file_path: str) -> None:
    try:
        path = pathlib.Path(file_path)
        if not path.is_file():
            log_print(f"[!] File not found: {file_path}")
            return
        message = path.read_text("utf-8")
        await ws.send(message)
        log_print(f"[+] Sent {file_path} ({len(message)} bytes)")
    except Exception as e:
        log_print(f"[!] Failed to send file: {e}")


async def command(ws: websockets.ClientConnection) -> None:
    global RETRY
    loop = asyncio.get_event_loop()
    while ws.state == websockets.protocol.State.OPEN:
        try:
            console.print("  [prompt]›[/prompt] ", end="")
            cmd = await loop.run_in_executor(None, input, "")
        except (EOFError, KeyboardInterrupt):
            print()
            log_print("[*] Disconnecting...")
            await ws.close()
            RETRY = False
            break

        parts = cmd.strip().split(maxsplit=1)
        if not parts:
            continue
        if len(parts) == 2 and parts[0].lower() == "send":
            await send_file(ws, parts[1])
        elif parts[0].lower() in ("quit", "exit", "disconnect"):
            log_print("[*] Disconnecting...")
            await ws.close()
            RETRY = False
            break
        else:
            log_print("[*] Unknown command — use:  send <path>  or  quit")


async def receiver(ws: websockets.ClientConnection) -> None:
    try:
        async for data in ws:
            if isinstance(data, str):
                log_print(data)
    except websockets.ConnectionClosed:
        log_print("[*] Disconnected")
    except Exception as e:
        log_print(f"[!] {e}")


async def main() -> None:
    _banner()
    while RETRY:
        ws, receiver_task, command_task = None, None, None
        try:
            async with websockets.connect(
                f"ws://{IP}:{PORT}", ping_timeout=None
            ) as ws:
                log_print(f"[+] Connected to {IP}:{PORT}")
                console.print(Rule(style="dim"))
                receiver_task = asyncio.create_task(receiver(ws))
                command_task  = asyncio.create_task(command(ws))
                await asyncio.wait(
                    [receiver_task, command_task],
                    return_when=asyncio.FIRST_COMPLETED,
                )
        except Exception:
            await asyncio.sleep(DELAY)
        finally:
            if receiver_task: receiver_task.cancel()
            if command_task:  command_task.cancel()
            if ws and ws.state != websockets.protocol.State.CLOSED:
                await ws.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        console.print()
        console.print(Rule(style="accent"))
        console.print("  [ts]Session ended[/ts]")
        console.print(Rule(style="accent"))
        console.print()
