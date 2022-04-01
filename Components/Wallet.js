import React from "react";
import { useState, useEffect, useContext } from "react";
import CutString from "../Components/Functions/CutString";
import { Context } from "../store";
import { REDUCER } from "../reducer";

function Wallet() {
  const [context, dispatch] = useContext(Context);
  const { publicKey } = context;

  useEffect(() => {
    if (publicKey) {
      console.log("publicKey: ", publicKey);
    }
  }, [publicKey]);

  function setPublicKey(key) {
    dispatch({
      type: REDUCER.SET_PUBLIC_KEY,
      payload: key,
    });
  }

  const connectWallet = async () => {
    try {
      const resp = await window.solana.connect();
      console.log("resp: ", resp);
      const key = resp.publicKey.toString();
      setPublicKey({ keyPair: resp.publicKey._bn.words, publicKey: key });
      // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo
    } catch (err) {
      console.log("error while connecting to wallet: ", err);
    }
  };

  useEffect(() => {
    if (typeof window.solana !== "undefined" && !publicKey?.publicKey) {
      console.log(window.solana);
      connectWallet();
    }
  }, [publicKey]);

  return (
    <div className="grid grid-cols-3 p-4">
      <div></div>
      <div className="w-full flex items-center justify-center text-3xl text-[#18EE98] font-bold italic">
        <span>Solana Faucet</span>
      </div>
      <div className="w-full flex justify-end">
        <button
          onClick={() => {
            if (publicKey?.publicKey) {
              window.solana.disconnect();
              setPublicKey({});
            } else {
              connectWallet();
            }
          }}
          className=" px-4 py-2 border-2 rounded-full border-[#18EE98]"
        >
          {publicKey?.publicKey ? CutString(20, publicKey.publicKey) : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}

export default Wallet;
