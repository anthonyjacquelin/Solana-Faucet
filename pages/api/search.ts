import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function search_collection(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { search } = req.body;

    await axios
      .get(
        "https://api.solscan.io/nft/search?keyword=" +
          search.toLowerCase().toString()
      )
      .then((collection_data) => {
        console.log(collection_data.data);
        res.status(200).json(collection_data.data.data);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ error });
      });
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : "Unknown Error";
    console.log(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}
