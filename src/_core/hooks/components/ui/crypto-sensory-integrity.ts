<!-- HONEST Verify This Output Button -->
<div id="honest-verify-section" style="margin: 24px 0; padding: 20px; border: 2px solid #00ff9d; border-radius: 12px; background: #0a0a0a;">
  <h3 style="margin-bottom: 12px; color: #00ff9d;">🔐 Verify This HONEST Output</h3>
  <p style="font-size: 14px; color: #ccc; margin-bottom: 12px;">
    Paste the full JSON response (including <code>signature</code> and <code>publicKey</code>) to prove it came from HONEST and was not altered.
  </p>

  <textarea id="verify-input" rows="8" 
    style="width: 100%; background: #111; color: #fff; border: 1px solid #444; padding: 12px; font-family: monospace; border-radius: 8px;"
    placeholder='{"data": {...}, "signature": "base64...", "publicKey": "base64...", "trustAnchor": "HONEST-8E5F9A3A"}'
    aria-label="Paste full HONEST JSON response here"></textarea>

  <button onclick="verifyHONESTOutput()" 
    style="margin-top: 12px; padding: 12px 24px; background: #00ff9d; color: #000; font-weight: bold; border: none; border-radius: 8px; cursor: pointer;">
    🔍 Verify Signature Now
  </button>

  <div id="verify-result" style="margin-top: 16px; padding: 12px; border-radius: 8px; display: none;"></div>
</div>

<script>
// Self-contained verification using noble-ed25519 (CDN version for quick demo)
async function verifyHONESTOutput() {
  const input = document.getElementById('verify-input').value.trim();
  const resultDiv = document.getElementById('verify-result');
  
  if (!input) {
    showResult('error', 'Please paste a full JSON response.');
    return;
  }

  try {
    const data = JSON.parse(input);
    
    if (!data.signature || !data.publicKey || !data.data) {
      showResult('error', 'Missing signature, publicKey, or data.');
      return;
    }

    // Load noble-ed25519 (or use your bundled version)
    const { verify } = await import('https://esm.sh/noble-ed25519@2');
    
    const message = JSON.stringify(data.data, null, 2);
    const hash = await nobleEd25519.utils.sha512(message);  // noble-ed25519 hash helper
    const sig = Uint8Array.from(atob(data.signature), c => c.charCodeAt(0));
    const pubKey = Uint8Array.from(atob(data.publicKey), c => c.charCodeAt(0));

    const isValid = await verify(sig, hash, pubKey);

    if (isValid) {
      showResult('success', 
        `✅ Verified by HONEST-${data.trustAnchor || 'UNKNOWN'}<br>
        <small>Signed on ${data.signedAt || 'unknown date'}</small>`);
    } else {
      showResult('error', '❌ Signature validation failed. Output may have been altered.');
    }
  } catch (e) {
    showResult('error', `Parse or verification error: ${e.message}`);
  }
}

function showResult(type, message) {
  const div = document.getElementById('verify-result');
  div.style.display = 'block';
  div.innerHTML = message;
  div.style.background = type === 'success' ? '#001a00' : '#4d0000';
  div.style.color = type === 'success' ? '#00ff9d' : '#ff4444';
}
</script>
