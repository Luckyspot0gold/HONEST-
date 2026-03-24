# 🔐 H.O.N.E.S.T. Integrity Layer (Ed25519)

HONEST uses **native cryptographic signing** via **Ed25519** to ensure the authenticity and integrity of all sensory signals.

This is **not third-party attestation**.  
This is **your own, verifiable, open-keychain system** — built and owned by you.

---

## 🔑 How It Works

1. Every sensory output (audio, haptics, text) is serialized to JSON
2. It is signed with a **private key** you control
3. The signature is stored with the output
4. Anyone can verify it using the **public key** and standard protocols

### ✅ What This Guarantees
- ✅ Signature authenticity
- ✅ Data integrity (not altered post-generation)
- ✅ Non-repudiation (can’t deny authorship)

### ⚠️ What This Does NOT Guarantee
- ❌ Output accuracy or truthfulness  
- ❌ Absence of model bias  
- ❌ Real-world correctness

> 🛑 This is **not a truth machine** — only an **authenticity layer**.

---

## 🔧 How to Verify (5 Minutes)

1. Get the **public key** from [HONEST Trust Anchors](#trust-anchors)
2. Get the **signed output** + **signature**
3. Run:
   ```bash
   echo '{"data":{...}}' | openssl dgst -sha512 -verify public.key -signature signature.base64
