import * as Bip39 from "bip39";
import {
  Keypair,
  Connection,
  Cluster,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import { useState, useEffect } from "react";
import {
  refreshBalance,
  handleAirdrop,
  sendTransaction,
} from "../Metadata/utils.ts";
import Link from "next/link";

const Test = () => {
  const [mnemonic, setMnemonic] = useState("");
  const [seed, setSeed] = useState("");
  const [newAccount, setNewAccount] = useState({});
  const [balance, setBalance] = useState(0);
  const [receiverAddress, setReceiverAddress] = useState("");
  const [amountToSend, setAmountToSend] = useState(0);
  const [displayTransaction, setDisplayTransaction] = useState({});

  // function to refresh solAmount in wallet
  const refreshSolAmount = async () => {
    const result = await refreshBalance("devnet", newAccount);
    setBalance(result);
    console.log("balance", result);
  };

  useEffect(() => {
    console.log("displayTransaction: ", displayTransaction);
  }, [displayTransaction]);

  useEffect(() => {
    console.log("receiverAddress: ", receiverAddress);
    console.log("amountToSend: ", amountToSend);
  }, [receiverAddress, amountToSend]);

  useEffect(() => {
    const generatedMnemonic = Bip39.generateMnemonic();
    setMnemonic(generatedMnemonic);
    setSeed(Bip39.mnemonicToSeedSync(generatedMnemonic).slice(0, 32));
  }, []);

  useEffect(() => {
    if (seed) {
      setNewAccount(Keypair.fromSeed(seed));
    }
  }, [seed]);

  useEffect(async () => {
    await refreshSolAmount();
  }, [newAccount]);

  useEffect(() => console.log("newAccount: ", newAccount), [newAccount]);
  useEffect(() => console.log("mnemonic: ", mnemonic), [mnemonic]);
  useEffect(() => console.log("seed: ", seed), [seed]);

  return (
    <>
      <div>You have {balance ? balance : 0} sol</div>
      <button
        className="p-4 bg-black text-white rounded-full"
        onClick={async (e) => {
          e.preventDefault();
          await handleAirdrop("devnet", newAccount);
          await refreshSolAmount();
        }}
      >
        Airdrop me!
      </button>
      {displayTransaction && displayTransaction?.status === true ? (
        <div className="rounded min-w-[20em] fixed p-4 pt-14 top-4 space-y-4 right-4 flex items-start flex-col bg-fuchsia-500">
          <button
            className="bg-black px-4 absolute py-2 top-2 right-2 text-white rounded-full"
            onClick={() => setDisplayTransaction({})}
          >
            X
          </button>
          <p>Transaction hash: {displayTransaction?.transaction_address}</p>
          <button className="px-4 py-2 bg-green-500 text-white font-bold">
            <Link
              href={
                "https://explorer.solana.com/tx/" +
                displayTransaction?.transaction_address +
                "?cluster=devnet"
              }
            >
              <a target="_blank">See on Solana Explorer</a>
            </Link>
          </button>
        </div>
      ) : null}

      {displayTransaction && displayTransaction?.status === false ? (
        <div className="rounded min-w-[20em] p-4 fixed top-4 right-4 flex items-start flex-col bg-red-500">
          <p>error during transaction !</p>
          <p>{displayTransaction?.message}</p>
        </div>
      ) : null}

      {/* send transaction to an address */}
      <form className="flex flex-row space-x-4 items-center py-4 justify-center bg-gray-800 text-white">
        <label className="flex flex-col">
          Send to:
          <input
            type="text"
            onChange={(e) => setReceiverAddress(e.target.value)}
            value={receiverAddress}
            className="text-black"
          />
        </label>
        <label className="flex flex-col">
          Amount:
          <input
            type="text"
            onChange={(e) => setAmountToSend(e.target.value)}
            value={amountToSend}
            className="text-black"
          />
        </label>
        <input
          type="submit"
          value="Submit"
          className="bg-white text-black px-4 py-2 rounded"
          onClick={async (e) => {
            e.preventDefault();
            if (receiverAddress && amountToSend) {
              await sendTransaction(
                "devnet",
                newAccount,
                receiverAddress,
                amountToSend
              )
                .then((transaction_confirmation) => {
                  if (transaction_confirmation.success) {
                    console.log(
                      "transaction_confirmation: ",
                      transaction_confirmation
                    );
                    setDisplayTransaction({
                      status: true,
                      transaction_address:
                        transaction_confirmation.transaction_hash,
                    });
                  } else {
                    setDisplayTransaction({
                      status: false,
                      message: transaction_confirmation.message.message,
                    });
                  }
                })
                .catch((error) => {
                  console.log("error: ", error);
                  setDisplayTransaction({
                    status: false,
                    message: error.message,
                  });
                });
              await refreshSolAmount();
            } else {
              alert("Please fill in all fields");
            }
          }}
        />
      </form>
      <p>ex: 9B5XszUGdMaxCZ7uSQhPzdks5ZQSmWxrmzCSvtJ6Ns6g</p>
    </>
  );
};

export default Test;
