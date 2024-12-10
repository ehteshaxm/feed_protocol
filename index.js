const {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} = require("@solana/web3.js");

const PROGRAM_ID = new PublicKey(
  "3M9dMfaDgWA4RJ3HmRxPm7ogAWjNHCRAPqQnGyCs2NDb"
);
const payerKeypair = Keypair.fromSecretKey(
  Uint8Array.from(require("./wallet-keypair.json"))
);

const rngProgram = new PublicKey(
  "FEED1qspts3SRuoEyG29NMNpsTKX8yG9NGMinNC4GeYB"
);

const entropyAccount = new PublicKey(
  "CTyyJKQHo6JhtVYBaXcota9NozebV3vHF872S8ag2TUS"
);
const feeAccount = new PublicKey("WjtcArL5m5peH8ZmAdTtyFF9qjyNxjQ2qp4Gz1YEQdy");

const creditsAccount = PublicKey.findProgramAddressSync(
  [payerKeypair.publicKey.toBytes()],
  rngProgram
)[0];

const connection = new Connection("https://api.devnet.solana.com");

async function testRandomNumber() {
  const functionSelector = 1;

  const encoded = Buffer.from([functionSelector]);

  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { isSigner: true, isWritable: true, pubkey: payerKeypair.publicKey },
      { isSigner: false, isWritable: true, pubkey: entropyAccount },
      { isSigner: false, isWritable: true, pubkey: feeAccount },
      { isSigner: false, isWritable: false, pubkey: rngProgram },
      { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
      { isSigner: false, isWritable: true, pubkey: creditsAccount },
    ],
    data: encoded,
  });

  const { blockhash } = await connection.getLatestBlockhash();

  const message = new TransactionMessage({
    instructions: [ix],
    payerKey: payerKeypair.publicKey,
    recentBlockhash: blockhash,
  }).compileToV0Message();

  const tx = new VersionedTransaction(message);
  tx.sign([payerKeypair]);

  try {
    const sig = await connection.sendTransaction(tx);
    console.log("Transaction signature:", sig);

    const result = await connection.confirmTransaction(sig);
    console.log("Transaction confirmed:", result);

    const logs = await getTransactionLogs(sig);
  } catch (error) {
    console.error("Error invoking Random Number function:", error);
  }
}

async function testRandomCoordinates() {
  const functionSelector = 2;

  const encoded = Buffer.from([functionSelector]);

  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { isSigner: true, isWritable: true, pubkey: payerKeypair.publicKey },
      { isSigner: false, isWritable: true, pubkey: entropyAccount },
      { isSigner: false, isWritable: true, pubkey: feeAccount },
      { isSigner: false, isWritable: false, pubkey: rngProgram },
      { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
      { isSigner: false, isWritable: true, pubkey: creditsAccount },
    ],
    data: encoded,
  });

  const { blockhash } = await connection.getLatestBlockhash();

  const message = new TransactionMessage({
    instructions: [ix],
    payerKey: payerKeypair.publicKey,
    recentBlockhash: blockhash,
  }).compileToV0Message();

  const tx = new VersionedTransaction(message);
  tx.sign([payerKeypair]);

  try {
    const sig = await connection.sendTransaction(tx);
    console.log("Transaction signature:", sig);

    const result = await connection.confirmTransaction(sig);
    console.log("Transaction confirmed:", result);

    const logs = await getTransactionLogs(sig);
  } catch (error) {
    console.error("Error invoking Random Coordinates function:", error);
  }
}

async function getTransactionLogs(sig) {
  try {
    const transaction = await connection.getTransaction(sig, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (transaction) {
      console.log("Transaction details:", transaction);
      if (transaction.meta && transaction.meta.logMessages) {
        const logs = transaction.meta.logMessages;

        logs.forEach((log) => {
          if (log.includes("random number:")) {
            console.log(
              "Random number:",
              log.split("random number:")[1].trim()
            );
          }
          if (log.includes("Raw random number:")) {
            console.log(
              "Raw random number:",
              log.split("Raw random number:")[1].trim()
            );
          }
          if (log.includes("Random coordinates:")) {
            console.log(
              "Random coordinates:",
              log.split("Random coordinates:")[1].trim()
            );
          }
        });
      } else {
        console.log("No logs found in transaction metadata.");
      }
    } else {
      console.log("Transaction not found.");
    }
  } catch (error) {
    console.error("Error fetching transaction logs:", error);
  }
}

// Run the functions
testRandomNumber();
testRandomCoordinates();
