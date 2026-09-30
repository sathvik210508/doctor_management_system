import sodiumMod from "libsodium-wrappers";

let isReady = false;
let sodiumInstance = null;

// In-memory keypair cache for the logged in doctor (never stored in localStorage or exposed)
const keyPairCache = new Map();

/**
 * Initialize libsodium WebAssembly / crypto subsystem
 */
export async function initCrypto() {
  if (isReady && sodiumInstance) return sodiumInstance;
  
  // Handle both default export and namespace import patterns
  const sodium = sodiumMod.default || sodiumMod;
  await sodium.ready;
  sodiumInstance = sodium;
  isReady = true;
  return sodiumInstance;
}

/**
 * Compute deterministic conversation ID: sorted doctor IDs
 * e.g. DOC1001 + DOC1002 => DOC1001_DOC1002
 */
export function getDeterministicConversationId(docId1, docId2) {
  if (!docId1 || !docId2) return "";
  return [docId1, docId2].sort().join("_");
}

/**
 * Deterministically derive doctor's X25519 keypair client-side.
 * Private key stays strictly in browser memory and NEVER leaves the client.
 */
export async function getDoctorKeyPair(doctorId) {
  const sodium = await initCrypto();
  if (keyPairCache.has(doctorId)) {
    return keyPairCache.get(doctorId);
  }

  // Derive 32-byte seed deterministically for the doctor's client session
  const seedString = `LIORA_DOCTOR_E2EE_KEY_V1_${doctorId}`;
  const seed = sodium.crypto_generichash(32, seedString);
  const keyPair = sodium.crypto_box_seed_keypair(seed);

  keyPairCache.set(doctorId, keyPair);
  return keyPair;
}

/**
 * Get doctor's public key encoded in Base64
 */
export async function getDoctorPublicKeyBase64(doctorId) {
  const sodium = await initCrypto();
  const keyPair = await getDoctorKeyPair(doctorId);
  return sodium.to_base64(keyPair.publicKey, sodium.base64_variants.ORIGINAL);
}

/**
 * Compute Diffie-Hellman shared key for this conversation
 */
export async function deriveConversationSharedKey(myDoctorId, peerPublicKeyBase64) {
  const sodium = await initCrypto();
  const myKeyPair = await getDoctorKeyPair(myDoctorId);
  const peerPubKeyBuf = sodium.from_base64(peerPublicKeyBase64, sodium.base64_variants.ORIGINAL);
  return sodium.crypto_box_beforenm(peerPubKeyBuf, myKeyPair.privateKey);
}

/**
 * Encrypt message client-side:
 * Plaintext -> Shared Key + 24-byte Nonce -> XSalsa20-Poly1305 Ciphertext
 */
export async function encryptMessage(myDoctorId, peerPublicKeyBase64, plaintext) {
  const sodium = await initCrypto();
  const sharedKey = await deriveConversationSharedKey(myDoctorId, peerPublicKeyBase64);
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const ciphertextBuf = sodium.crypto_box_easy_afternm(plaintext, nonce, sharedKey);

  return {
    ciphertext: sodium.to_base64(ciphertextBuf, sodium.base64_variants.ORIGINAL),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
    algorithm: "X25519-XSalsa20-Poly1305"
  };
}

/**
 * Decrypt message client-side:
 * Ciphertext + Nonce + Shared Key -> Plaintext
 */
export async function decryptMessage(myDoctorId, peerPublicKeyBase64, ciphertextBase64, nonceBase64) {
  const sodium = await initCrypto();
  try {
    const sharedKey = await deriveConversationSharedKey(myDoctorId, peerPublicKeyBase64);
    const ciphertextBuf = sodium.from_base64(ciphertextBase64, sodium.base64_variants.ORIGINAL);
    const nonceBuf = sodium.from_base64(nonceBase64, sodium.base64_variants.ORIGINAL);
    const decryptedBuf = sodium.crypto_box_open_easy_afternm(ciphertextBuf, nonceBuf, sharedKey);
    return sodium.to_string(decryptedBuf);
  } catch {
    return "[Decryption error: Message cannot be decrypted with this conversation key]";
  }
}
