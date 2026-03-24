# backend/honest_signer.py
# HONEST Python Signing Layer — Ed25519 (owned, verifiable, no third-party)
import json
import base64
import hashlib
from typing import Dict, Any
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey
from datetime import datetime

class HONESTSigner:
    def __init__(self, private_key_bytes: bytes = None):
        if private_key_bytes:
            self.private_key = Ed25519PrivateKey.from_private_bytes(private_key_bytes)
        else:
            self.private_key = Ed25519PrivateKey.generate()
        
        self.public_key = self.private_key.public_key()
        self.trust_anchor = self._generate_trust_anchor()

    def _generate_trust_anchor(self) -> str:
        pub_bytes = self.public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )
        digest = hashlib.sha256(pub_bytes).hexdigest()[:8].upper()
        return f"HONEST-{digest}"

    def sign_sensory_output(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Sign any sensory output (audio, haptic, visual, etc.)"""
        message = json.dumps(data, sort_keys=True, separators=(',', ':')).encode('utf-8')
        signature = self.private_key.sign(message)
        
        return {
            "data": data,
            "signature": base64.b64encode(signature).decode('utf-8'),
            "publicKey": base64.b64encode(
                self.public_key.public_bytes(
                    encoding=serialization.Encoding.Raw,
                    format=serialization.PublicFormat.Raw
                )
            ).decode('utf-8'),
            "trustAnchor": self.trust_anchor,
            "signedAt": datetime.utcnow().isoformat() + "Z"
        }

    def get_public_key_base64(self) -> str:
        """For sharing/verification"""
        raw = self.public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )
        return base64.b64encode(raw).decode('utf-8')

# ──────────────────────────────────────────────────────────────
# Quick usage example
if __name__ == "__main__":
    signer = HONESTSigner()
    
    sample_output = {
        "frequency": 432,
        "haptic_intensity": 0.7,
        "verdict": "COHERENT"
    }
    
    signed = signer.sign_sensory_output(sample_output)
    print("✅ Signed output ready:")
    print(json.dumps(signed, indent=2))
