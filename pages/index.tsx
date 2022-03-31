import Head from "next/head";
import Image from "../Components/Image";
import styles from "../styles/Home.module.css";
import { Connection } from "@metaplex/js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useEffect, useState } from "react";
import { getPhantomWallet } from "@solana/wallet-adapter-wallets";
import {
  getAllNFTsMetadata,
  getAccountsData,
} from "../Components/Metadata/index.ts";
import Test from "../Components/test/index.tsx";
import axios from "axios";

export default function Home() {
  const [search, setSearch] = useState("");
  const [collectionData, setCollectionData] = useState({});
  const [collection, setCollection] = useState({});
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");
  // connect phantom wallet
  // const connectWallet = () => {
  //   const wallet = getPhantomWallet();
  //   wallet.connect();
  //   return wallet;
  // };

  useEffect(() => {
    const fetchData = async () => {
      await getAccountsData()
        .then((res) => console.log("res getAccountsData", res))
        .catch((err) => console.log("err getAccountsData", err));
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (dots.length < 3) {
        setDots(dots + ".");
      } else {
        setDots("");
      }
    }, 400);
    return () => clearInterval(interval);
  }, [dots]);

  useEffect(() => {
    console.log("collection: ", collection);
  }, [collection]);

  useEffect(() => {
    if (search.length) {
      setCollectionData({});
      const searchProject = async () => {
        await axios
          .post("/api/search", {
            search: search,
          })
          .then((res) => {
            setCollectionData(res.data);
            console.log(res.data);
          })
          .catch((err) => {
            setCollectionData(err.data);
            console.log(err.data);
          });
      };
      searchProject();
    } else {
      setCollectionData({});
    }
  }, [search]);

  return (
    <div className="w-full h-screen flex flex-col space-y-4">
      <button onClick={() => connectWallet()} className="">
        Connect Wallet{" "}
      </button>

      <div className="flex flex-col px-4">
        <input
          type="text"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          className="w-full ring-2  h-[2em] px-4 rounded-md ring-black text-black font-semibold"
        />
        {collectionData?.collection?.length ? (
          <div className="w-full flex flex-col bg-gray-500 text-white">
            {collectionData?.collection.map((collection_data, key) => (
              <div
                key={key}
                className="flex relative py-2 px-4 flex-row space-x-4 items-center"
              >
                <div className="rounded-full w-[2em] h-[2em] relative">
                  {collection_data?.avatar && (
                    <Image
                      src={`/api/imageproxy?url=${encodeURIComponent(
                        collection_data?.avatar
                      )}`}
                      alt="collection_avatar"
                      layout="fill"
                      quality={50}
                      rounded={true}
                      priority
                    />
                  )}
                </div>

                <button
                  onClick={async () => {
                    setCollectionData({});
                    setLoading(true);
                    await axios
                      .post("/api/collection", {
                        collection: collection_data,
                      })
                      .then((res) => setCollection(res.data))
                      .catch((err) => setCollection(err.data));
                    setLoading(false);
                  }}
                  className="text-white font-semibold hover:text-black"
                >
                  {collection_data.collection}
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {loading ? <p>Envoi en cours{dots} </p> : null}
      </div>

      <div className="w-full grid grid-cols-4 md:grid-cols-2 gap-4 p-4 md:p-0">
        {collection?.length &&
          collection?.collection?.map((item, id) => (
            <div
              className="flex flex-col space-y-2 bg-white shadow-xl"
              key={id}
            >
              {item.data.data.image && (
                <Image
                  src={`/api/imageproxy?url=${encodeURIComponent(
                    item.data.data.image
                  )}`}
                  alt="collection_avatar"
                  layout="fill"
                  quality={50}
                  priority
                  width={500}
                  height={500}
                />
              )}
              {item.data.data.name && (
                <p className="text-center">{item.data.data.name}</p>
              )}
            </div>
          ))}
      </div>
      <Test />
    </div>
  );
}
