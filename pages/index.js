import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import Wallet from "../Components/Wallet";
import { Context } from "../store";
import * as solanaWeb3 from "@solana/web3.js";
import { TailSpin } from "react-loader-spinner";

export default function Home() {
  const [context, dispatch] = useContext(Context);
  const { publicKey } = context;
  const [displayTransaction, setDisplayTransaction] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (displayTransaction) {
      timer = setTimeout(() => {
        setDisplayTransaction({});
      }, 5000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [displayTransaction]);

  return (
    <div className="w-full h-screen flex flex-col space-y-4 bg-gray-800 text-white">
      <Wallet />
      <div className="w-full flex  justify-center h-screen items-center flex-col">
        <button
          className="hover:scale-110  transition duration-300 ease-in-out p-4 bg-[#18EE98] text-black font-bold italic w-[20em] rounded-full flex items-center justify-center"
          onClick={async () => {
            setLoading(true);
            let connection = new solanaWeb3.Connection(
              solanaWeb3.clusterApiUrl("testnet")
            );

            let airdropSignature = await connection.requestAirdrop(
              new solanaWeb3.PublicKey(publicKey.publicKey),
              solanaWeb3.LAMPORTS_PER_SOL
            );

            await connection
              .confirmTransaction(airdropSignature)
              .then((response) => {
                setDisplayTransaction({
                  status: true,
                  transaction_address: airdropSignature,
                });
              })
              .catch((error) => {
                setDisplayTransaction({
                  status: false,
                  message: error.message,
                });
              });
            setLoading(false);
            console.log("airdrop terminé !");
          }}
        >
          {loading ? (
            <TailSpin color="#FFFFFF" height={30} width={30} />
          ) : (
            "Airdrop me!"
          )}
        </button>

        <span className="text-sm text-[#18EE98] italic py-4">
          {"You'll "}receive 1 sol in your connected wallet
        </span>

        {displayTransaction && displayTransaction?.status === true ? (
          <div className="rounded box min-w-[20em] fixed p-4 pt-14 top-4 space-y-4 right-4 grid bg-fuchsia-500">
            <button
              className=" px-4 absolute py-2 top-2 right-2 text-white rounded-full"
              onClick={() => setDisplayTransaction({})}
            >
              X
            </button>
            <button className="px-4 py-2 bg-[#18EE98] text-black font-bold">
              <Link
                href={
                  "https://explorer.solana.com/tx/" +
                  displayTransaction?.transaction_address +
                  "?cluster=testnet"
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
      </div>
    </div>
  );
}
