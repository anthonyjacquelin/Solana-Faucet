import type { NextApiRequest, NextApiResponse } from "next";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { getAllNFTsMetadata } from "../../Components/Metadata/index";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

interface Creator {
  address: string;
  verified: number;
  share: number;
}

export default async function get_NFT_collection(
  req: NextApiRequest,
  res: NextApiResponse<object>
) {
  try {
    const { collection } = req.body;
    console.log("collection", collection);

    let candyMachine: Creator = collection.creators.find(
      (creator: Creator) => creator.share === 0 && creator.verified === 1
    );

    console.log("candyMachine", candyMachine);
    let candyMachineId: string = candyMachine.address;

    const NFT_collection = await getAllNFTsMetadata(candyMachineId);

    // Pass the counter to the client-side as JSON
    res.status(200).json(NFT_collection);
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : "Unknown Error";
    console.log(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}
  