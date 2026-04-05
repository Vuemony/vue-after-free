#!/usr/bin/env python3
"""
Recursively encrypt files to .aes format using AES-CBC encryption.
Same keys as PlayStation Vue decryption.
"""

import base64
from pathlib import Path
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend


def encrypt_file(input_path, key, iv):
    """Encrypt a single file using AES-CBC."""
    try:
        # Read plaintext data
        with open(input_path, "rb") as f:
            plaintext_data = f.read()

        # Pad to 16-byte boundary with null bytes (same as Vue uses)
        padding_needed = (16 - len(plaintext_data) % 16) % 16
        if padding_needed > 0:
            plaintext_data += b"\x00" * padding_needed

        # Create cipher
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        encryptor = cipher.encryptor()

        # Encrypt
        encrypted_data = encryptor.update(plaintext_data) + encryptor.finalize()

        # Write encrypted file (add .aes extension)
        output_path = str(input_path) + ".aes"
        with open(output_path, "wb") as f:
            f.write(encrypted_data)

        print(f"✓ Encrypted: {input_path} -> {output_path}")
        return True

    except Exception as e:
        print(f"✗ Failed to encrypt {input_path}: {e}")
        return False


def main():
    # Same key and IV as Vue decryption
    key = b"SENTV0ASDKFGJJLFJSJKLFJKOEKFSPKP"  # UTF-8
    iv = base64.b64decode("gI1zB0GB+Z5AiNhwZXeKZw==")  # Base64 decoded

    import sys

    if len(sys.argv) < 2:
        print("Usage:")
        print(f"  {sys.argv[0]} <file>")
        print()
        print("Example:")
        print(f"  {sys.argv[0]} index.js              # Encrypts to index.js.aes")
        return

    input_file = sys.argv[1]
    target_path = Path(input_file)

    if not target_path.is_file():
        print(f"Error: File not found: {input_file}")
        return

    print("=== PlayStation Vue AES Encryption ===")
    print(f"Input:  {input_file}")
    print(f"Output: {input_file}.aes")
    print()

    # Encrypt the file
    if encrypt_file(target_path, key, iv):
        print("\nEncryption successful!")
    else:
        print("\nEncryption failed!")


if __name__ == "__main__":
    main()
