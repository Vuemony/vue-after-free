#!/usr/bin/env python3
"""
Recursively decrypt all .aes files using AES-CBC decryption.
"""

import base64
from pathlib import Path
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend


def decrypt_file(input_path, key, iv):
    """Decrypt a single file using AES-CBC."""
    try:
        # Read encrypted data
        with open(input_path, "rb") as f:
            encrypted_data = f.read()

        # Create cipher
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()

        # Decrypt
        decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize()

        # Remove null/zero padding (not PKCS7)
        decrypted_data = decrypted_data.rstrip(b"\x00")

        # Write decrypted file (remove .aes extension)
        output_path = str(input_path)[:-4]  # Remove .aes
        with open(output_path, "wb") as f:
            f.write(decrypted_data)

        print(f"✓ Decrypted: {input_path} -> {output_path}")
        return True

    except Exception as e:
        print(f"✗ Failed to decrypt {input_path}: {e}")
        return False


def main():
    # Key and IV
    key = b"SENTV0ASDKFGJJLFJSJKLFJKOEKFSPKP"  # UTF-8
    iv = base64.b64decode("gI1zB0GB+Z5AiNhwZXeKZw==")  # Base64 decoded

    print(f"Key: {key.hex()}")
    print(f"IV:  {iv.hex()}")
    print(f"Key length: {len(key)} bytes")
    print(f"IV length:  {len(iv)} bytes")
    print()

    # Find all .aes files recursively
    current_dir = Path(".")
    aes_files = list(current_dir.rglob("*.aes"))

    if not aes_files:
        print("No .aes files found in current directory or subdirectories.")
        return

    print(f"Found {len(aes_files)} .aes file(s)\n")

    # Decrypt each file
    success_count = 0
    for aes_file in aes_files:
        if decrypt_file(aes_file, key, iv):
            success_count += 1

    print(
        f"\nDecryption complete: {success_count}/{len(aes_files)} files decrypted successfully"
    )


if __name__ == "__main__":
    main()
