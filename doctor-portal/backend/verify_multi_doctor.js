import sodiumMod from "libsodium-wrappers";
import fs from "fs";

const BASE_URL = "http://localhost:5001/api";

async function runMultiDoctorVerification() {
  console.log("=================================================================");
  console.log("🔒 VERIFYING MULTI-DOCTOR CONVERSATION ISOLATION & E2EE FLOW");
  console.log("=================================================================\n");

  const sodium = sodiumMod.default || sodiumMod;
  await sodium.ready;

  // Key derivation helper
  const getDoctorKeyPair = (doctorId) => {
    const seed = sodium.crypto_generichash(32, "LIORA_DOCTOR_E2EE_KEY_V1_" + doctorId);
    return sodium.crypto_box_seed_keypair(seed);
  };

  const getSharedKey = (docId1, docId2) => {
    const kp1 = getDoctorKeyPair(docId1);
    const kp2 = getDoctorKeyPair(docId2);
    return sodium.crypto_box_beforenm(kp2.publicKey, kp1.privateKey);
  };

  const clientEncrypt = (senderId, receiverId, plaintext) => {
    const sharedKey = getSharedKey(senderId, receiverId);
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const ciphertext = sodium.crypto_box_easy_afternm(plaintext, nonce, sharedKey);
    return {
      ciphertext: sodium.to_base64(ciphertext, sodium.base64_variants.ORIGINAL),
      nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
      algorithm: "X25519-XSalsa20-Poly1305"
    };
  };

  const clientDecrypt = (viewerId, peerId, ciphertextB64, nonceB64) => {
    const sharedKey = getSharedKey(viewerId, peerId);
    const ciphertext = sodium.from_base64(ciphertextB64, sodium.base64_variants.ORIGINAL);
    const nonce = sodium.from_base64(nonceB64, sodium.base64_variants.ORIGINAL);
    const decryptedBuf = sodium.crypto_box_open_easy_afternm(ciphertext, nonce, sharedKey);
    return sodium.to_string(decryptedBuf);
  };

  const loginDoctor = async (doctorId) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, password: "Doctor@123" })
    });
    const data = await res.json();
    if (!data.success) throw new Error(`Login failed for ${doctorId}: ${data.message}`);
    return data.token;
  };

  // Login tokens
  const token1001 = await loginDoctor("DOC1001");
  const token1002 = await loginDoctor("DOC1002");
  const token1003 = await loginDoctor("DOC1003");
  const token1004 = await loginDoctor("DOC1004");

  const headers1001 = { "Content-Type": "application/json", Authorization: `Bearer ${token1001}` };
  const headers1002 = { "Content-Type": "application/json", Authorization: `Bearer ${token1002}` };
  const headers1003 = { "Content-Type": "application/json", Authorization: `Bearer ${token1003}` };
  const headers1004 = { "Content-Type": "application/json", Authorization: `Bearer ${token1004}` };

  console.log("Logged in doctors DOC1001, DOC1002, DOC1003, DOC1004 successfully.\n");

  // TEST 1: Login as DOC1001. Open DOC1002. Send "Hello Doctor Patel". Verify appears only in DOC1001 ↔ DOC1002.
  console.log("--- TEST 1: DOC1001 sends 'Hello Doctor Patel' to DOC1002 ---");
  const encMsg1 = clientEncrypt("DOC1001", "DOC1002", "Hello Doctor Patel");
  const send1Res = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: headers1001,
    body: JSON.stringify({
      conversationId: "DOC1001_DOC1002",
      recipientDoctorId: "DOC1002",
      ciphertext: encMsg1.ciphertext,
      nonce: encMsg1.nonce,
      algorithm: encMsg1.algorithm
    })
  });
  const send1Data = await send1Res.json();
  if (!send1Data.success) throw new Error("Failed to send message in Test 1");
  console.log("✓ Sent encrypted message to DOC1002. Ciphertext stored.");

  // Fetch DOC1001 ↔ DOC1002
  const chat1002Res = await fetch(`${BASE_URL}/messages/conversations/DOC1001_DOC1002`, { headers: headers1001 });
  const chat1002Data = await chat1002Res.json();
  const decrypted1002 = chat1002Data.messages.map((m) => clientDecrypt("DOC1001", "DOC1002", m.ciphertext, m.nonce));
  const hasPatel = decrypted1002.includes("Hello Doctor Patel");
  console.log(`✓ DOC1001 ↔ DOC1002 contains 'Hello Doctor Patel': ${hasPatel}`);
  if (!hasPatel) throw new Error("Test 1 Failed: Message not found in DOC1001 ↔ DOC1002");

  // TEST 2: Without refreshing, open DOC1003. "Hello Doctor Patel" MUST NOT appear.
  console.log("\n--- TEST 2: DOC1001 opens DOC1003 ---");
  const chat1003Res = await fetch(`${BASE_URL}/messages/conversations/DOC1001_DOC1003`, { headers: headers1001 });
  const chat1003Data = await chat1003Res.json();
  const decrypted1003 = chat1003Data.messages.map((m) => clientDecrypt("DOC1001", "DOC1003", m.ciphertext, m.nonce));
  const hasPatelIn1003 = decrypted1003.includes("Hello Doctor Patel");
  console.log(`✓ 'Hello Doctor Patel' in DOC1001 ↔ DOC1003: ${hasPatelIn1003} (MUST be false)`);
  if (hasPatelIn1003) throw new Error("Test 2 Failed: Message leaked into DOC1001 ↔ DOC1003!");

  // TEST 3: Send "Hello Doctor Rao" to DOC1003. Then switch back to DOC1002.
  console.log("\n--- TEST 3: DOC1001 sends 'Hello Doctor Rao' to DOC1003 ---");
  const encMsg3 = clientEncrypt("DOC1001", "DOC1003", "Hello Doctor Rao");
  await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: headers1001,
    body: JSON.stringify({
      conversationId: "DOC1001_DOC1003",
      recipientDoctorId: "DOC1003",
      ciphertext: encMsg3.ciphertext,
      nonce: encMsg3.nonce,
      algorithm: encMsg3.algorithm
    })
  });
  console.log("✓ Sent encrypted message to DOC1003.");

  // Switch back to DOC1002
  const chat1002ResAgain = await fetch(`${BASE_URL}/messages/conversations/DOC1001_DOC1002`, { headers: headers1001 });
  const chat1002DataAgain = await chat1002ResAgain.json();
  const decrypted1002Again = chat1002DataAgain.messages.map((m) => clientDecrypt("DOC1001", "DOC1002", m.ciphertext, m.nonce));
  const hasRaoIn1002 = decrypted1002Again.includes("Hello Doctor Rao");
  console.log(`✓ 'Hello Doctor Rao' in DOC1001 ↔ DOC1002: ${hasRaoIn1002} (MUST be false)`);
  if (hasRaoIn1002) throw new Error("Test 3 Failed: Cross-conversation contamination detected!");

  // TEST 4: Open DOC1004. Verify no messages from DOC1002, DOC1003 appear.
  console.log("\n--- TEST 4: DOC1001 opens DOC1004 ---");
  const chat1004Res = await fetch(`${BASE_URL}/messages/conversations/DOC1001_DOC1004`, { headers: headers1001 });
  const chat1004Data = await chat1004Res.json();
  const decrypted1004 = chat1004Data.messages.map((m) => clientDecrypt("DOC1001", "DOC1004", m.ciphertext, m.nonce));
  const hasPatelIn1004 = decrypted1004.includes("Hello Doctor Patel");
  const hasRaoIn1004 = decrypted1004.includes("Hello Doctor Rao");
  console.log(`✓ Leaked messages in DOC1001 ↔ DOC1004: ${hasPatelIn1004 || hasRaoIn1004} (MUST be false)`);
  if (hasPatelIn1004 || hasRaoIn1004) throw new Error("Test 4 Failed: Leakage into DOC1004!");

  // TEST 5: Login as DOC1002. Open DOC1001. Conversation MUST be DOC1001_DOC1002.
  console.log("\n--- TEST 5: DOC1002 views DOC1001 ---");
  const chat1002From1002 = await fetch(`${BASE_URL}/messages/conversations/DOC1001_DOC1002`, { headers: headers1002 });
  const data1002From1002 = await chat1002From1002.json();
  const dec1002 = data1002From1002.messages.map((m) => clientDecrypt("DOC1002", "DOC1001", m.ciphertext, m.nonce));
  const doc2HasPatel = dec1002.includes("Hello Doctor Patel");
  const doc2HasRao = dec1002.includes("Hello Doctor Rao");
  console.log(`✓ DOC1002 successfully decrypted 'Hello Doctor Patel': ${doc2HasPatel}`);
  console.log(`✓ DOC1002 conversation contains DOC1003 messages: ${doc2HasRao} (MUST be false)`);
  if (!doc2HasPatel || doc2HasRao) throw new Error("Test 5 Failed!");

  // TEST 6: Login as DOC1003. Open DOC1001. Only DOC1001_DOC1003 messages should appear.
  console.log("\n--- TEST 6: DOC1003 views DOC1001 ---");
  const chat1003From1003 = await fetch(`${BASE_URL}/messages/conversations/DOC1001_DOC1003`, { headers: headers1003 });
  const data1003From1003 = await chat1003From1003.json();
  const dec1003 = data1003From1003.messages.map((m) => clientDecrypt("DOC1003", "DOC1001", m.ciphertext, m.nonce));
  const doc3HasRao = dec1003.includes("Hello Doctor Rao");
  const doc3HasPatel = dec1003.includes("Hello Doctor Patel");
  console.log(`✓ DOC1003 successfully decrypted 'Hello Doctor Rao': ${doc3HasRao}`);
  console.log(`✓ DOC1003 conversation contains DOC1002 messages: ${doc3HasPatel} (MUST be false)`);
  if (!doc3HasRao || doc3HasPatel) throw new Error("Test 6 Failed!");

  // TEST 7: Security Authorization - DOC1001 attempts /api/messages/conversations/DOC1002_DOC1003
  console.log("\n--- TEST 7: Security - Cross-Conversation Snooping Attempt ---");
  const snoopRes = await fetch(`${BASE_URL}/messages/conversations/DOC1002_DOC1003`, { headers: headers1001 });
  console.log(`✓ DOC1001 requesting DOC1002_DOC1003 returned status: ${snoopRes.status} (MUST be 403)`);
  if (snoopRes.status !== 403) throw new Error("Security Failure: Unauthorized snooping was not rejected with 403 Forbidden!");

  // TEST 8: Database Inspection - Verify ZERO plaintext in db.json
  console.log("\n--- TEST 8: Database Zero-Plaintext Audit ---");
  const dbContent = fs.readFileSync("../database/db.json", "utf8");
  const dbJson = JSON.parse(dbContent);
  const foundPlaintext1 = dbContent.includes("Hello Doctor Patel");
  const foundPlaintext2 = dbContent.includes("Hello Doctor Rao");
  console.log(`✓ 'Hello Doctor Patel' in raw database: ${foundPlaintext1} (MUST be false)`);
  console.log(`✓ 'Hello Doctor Rao' in raw database: ${foundPlaintext2} (MUST be false)`);
  if (foundPlaintext1 || foundPlaintext2) throw new Error("Database Audit Failed: Plaintext discovered in db.json!");

  const allMessagesEncrypted = dbJson.messages.every((m) => m.ciphertext && m.nonce && !m.content);
  console.log(`✓ All ${dbJson.messages.length} database message records are strictly ciphertext + nonce with zero plaintext: ${allMessagesEncrypted}`);
  if (!allMessagesEncrypted) throw new Error("Database Audit Failed: Non-encrypted messages found!");

  console.log("\n=================================================================");
  console.log("🎉 ALL MULTI-DOCTOR CONVERSATION ISOLATION & E2EE TESTS PASSED!");
  console.log("=================================================================\n");
}

runMultiDoctorVerification().catch((err) => {
  console.error("FATAL ERROR IN MULTI-DOCTOR TESTS:", err);
  process.exit(1);
});
