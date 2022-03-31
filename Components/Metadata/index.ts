import { decodeMetadata } from "./utils.ts";
import { PublicKey, clusterApiUrl, Connection } from "@solana/web3.js";
// @ts-ignore
import fetch from "isomorphic-unfetch";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import axios from "axios";
// import { performance, PerformanceObserver } from "perf_hooks";

const METADATA_PUBKEY = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const connection = new Connection(clusterApiUrl("mainnet-beta"));

const getNFTs = async () => {
  const tokenMint = "CkgGJdaJPXsgd4Rq6mLyex491z3ZafEqCEoS4ZUTBsz3";
  const metadataPDA = await Metadata.getPDA(new PublicKey(tokenMint));
  const tokenMetadata = await Metadata.load(connection, metadataPDA);

  const largestAccounts = await connection.getTokenLargestAccounts(
    new PublicKey(tokenMint)
  );
  const largestAccountInfo = await connection.getParsedAccountInfo(
    largestAccounts.value[0].address
  );
  const NFTowner = largestAccountInfo.value.data.parsed.info.owner;

  console.log("NFT owner: ", NFTowner);

  console.log("metadata from metaplex: ", tokenMetadata.data);
};

const getAccountsData = async () => {
  const pubKey = new PublicKey("4pUQS4Jo2dsfWzt3VgHXy3H6RYnEDd11oWPiaM2rdAPw");
  const program_id = new PublicKey(
    "BPFLoader2111111111111111111111111111111111"
  );
  // const filter = new PublicKey("13sGxGR99uH5bKwwsh9XuBYi24uqQhds1A86cp92hpqD");
  // return connection
  //   .getTokenAccountsByOwner( pubKey, { mint: filter })
  //   .then((res) => {
  //     return res;
  //   })
  //   .catch((e) => {
  //     return e;
  //   });

  // return toutes les metadata d'un account
  // return connection
  //   .getAccountInfoAndContext(pubKey)
  //   .then((res) => {
  //     return res;
  //   })
  //   .catch((error) => {
  //     return error;
  //   });

  // return tous les accounts possédés par un program
  return connection
    .getProgramAccounts(program_id, {
      filters: [
        {
          dataSize: 165, // number of bytes
        },
        {
          memcmp: {
            offset: 0,
            bytes: 32,
          },
        },
      ],
    })
    .then((accounts) => {
      return accounts;
    })
    .catch((error) => {
      return error;
    });
};

// async function getNft(pubKey_NFT: string) {
//   try {
//     // input token address
//     let address = new PublicKey(pubKey_NFT);
//     let [pda, bump] = await PublicKey.findProgramAddress(
//       [
//         Buffer.from("metadata"),
//         METADATA_PUBKEY.toBuffer(),
//         new PublicKey(address).toBuffer(),
//       ],
//       METADATA_PUBKEY
//     );
//     // console.log("pda: ", pda.toBase58());

//     const data = {
//       jsonrpc: "2.0",
//       id: 1,
//       method: "getAccountInfo",
//       params: [
//         pda.toBase58(),
//         {
//           encoding: "base64",
//           DataSlice: {
//             length: 20,
//             offset: 20,
//           },
//         },
//       ],
//     };

//     return axios
//       .post("https://api.mainnet-beta.solana.com", data, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       .then(async (accountInfo: any) => {
//         let buffer = Buffer.from(accountInfo.result.value.data[0], "base64");
//         let metadata = decodeMetadata(buffer);
//         return axios.get(metadata.data.uri).then((metaDataFromUri) => {
//           return {
//             metaData: metadata,
//             metaDataFromUri,
//           };
//         });
//       })
//       .catch((e) => {
//         console.log(e);
//         return e;
//       });
//   } catch (e) {
//     console.log(e);
//     return e;
//   }
// }

const MAX_NAME_LENGTH = 32;
const MAX_URI_LENGTH = 200;
const MAX_SYMBOL_LENGTH = 10;
const MAX_CREATOR_LEN = 32 + 1 + 1;
const MAX_CREATOR_LIMIT = 5;
const MAX_DATA_SIZE =
  4 +
  MAX_NAME_LENGTH +
  4 +
  MAX_SYMBOL_LENGTH +
  4 +
  MAX_URI_LENGTH +
  2 +
  1 +
  4 +
  MAX_CREATOR_LIMIT * MAX_CREATOR_LEN;
const MAX_METADATA_LEN = 1 + 32 + 32 + MAX_DATA_SIZE + 1 + 1 + 9 + 172;
const CREATOR_ARRAY_START =
  1 +
  32 +
  32 +
  4 +
  MAX_NAME_LENGTH +
  4 +
  MAX_URI_LENGTH +
  4 +
  MAX_SYMBOL_LENGTH +
  2 +
  1 +
  4;

const TOKEN_METADATA_PROGRAM = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const getMetaData = async (firstCreatorAddress: PublicKey) => {
  return Metadata.findMany(connection, { creators: [firstCreatorAddress] })
    .then((res) => {
      console.log("res findDataByOwner", res);
      return res;
    })
    .catch((e) => {
      console.log(e);
      return e;
    });
};

const getMintAddresses = async (firstCreatorAddress: PublicKey) => {
  const metadataAccounts = await connection.getProgramAccounts(
    TOKEN_METADATA_PROGRAM,
    {
      // The mint address is located at byte 33 and lasts for 32 bytes.
      dataSlice: { offset: 33, length: 32 },

      filters: [
        // Only get Metadata accounts.
        { dataSize: MAX_METADATA_LEN },

        // Filter using the first creator.
        {
          memcmp: {
            offset: CREATOR_ARRAY_START,
            bytes: firstCreatorAddress.toBase58(),
          },
        },
      ],
    }
  );

  return metadataAccounts.map((metadataAccountInfo) =>
    bs58.encode(metadataAccountInfo.account.data)
  );
};

const getCandyMachineCreator = async (
  candyMachine: PublicKey
): Promise<[PublicKey, number]> => {
  const CANDY_MACHINE_V2_PROGRAM = new PublicKey(
    "cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ"
  );

  return PublicKey.findProgramAddress(
    [Buffer.from("candy_machine"), candyMachine.toBuffer()],
    CANDY_MACHINE_V2_PROGRAM
  );
};

// get all public keys of all nfts
const getMintAddressFromCandyMachine = async (candyMachineAddress: string) => {
  // const candyMachineCreator = await getCandyMachineCreator(candyMachineId);
  const candyMachineId = new PublicKey(candyMachineAddress);
  return getMintAddresses(candyMachineId);
};

// return all the MetaData of All the NFTs of a collection
const getAllNFTsMetadata = async (candyMachineAddress: string) => {
  // var startTime = performance.now();
  const candyMachineId = new PublicKey(candyMachineAddress);
  console.log("######## \n Started searching \n #########");
  let NFTs_metaData = await getMetaData(candyMachineId);
  NFTs_metaData = NFTs_metaData.slice(0, 20);
  // var endTime = performance.now();

  // console.log(
  //   `Call to NFTs_pubKeys took ${
  //     endTime / 1000 - startTime / 1000
  //   } milliseconds`
  // );
  return NFTs_metaData;
};

export { getAllNFTsMetadata, getAccountsData };
