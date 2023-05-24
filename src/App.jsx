import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Alchemy, Network, Utils } from "alchemy-sdk";
import { useState } from "react";

import { ethers } from "ethers";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  async function getTokenBalance() {
    setIsLoading(true);

    if (ethers.utils.isAddress(userAddress)) {
      try {
        const config = {
          apiKey: import.meta.env.REACT_APP_API_KEY, //.env with vite
          network: Network.ETH_MAINNET,
        };

        const alchemy = new Alchemy(config);
        const data = await alchemy.core.getTokenBalances(userAddress);

        setResults(data);

        const tokenDataPromises = [];

        for (let i = 0; i < data.tokenBalances.length; i++) {
          const tokenData = alchemy.core.getTokenMetadata(
            data.tokenBalances[i].contractAddress
          );
          tokenDataPromises.push(tokenData);
        }

        setTokenDataObjects(await Promise.all(tokenDataPromises));
        setHasQueried(true);
      } catch (err) {
        console.log(err);
        toast({
          title: "Error",
          description:
            "An error has occurred. Please check your address and try again",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Invalid address",
        description: "Please enter a valid address",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  }
  return (
    <div className="container">
      <div className="row text-center d-flex flex-column align-items-center align-self-center">
        <h1>ERC-20 Token Indexer</h1>
        <p>Get all ERC-20 token balances of this address:</p>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
      </div>
      <div className="row text-center d-flex flex-column align-items-center">
        <h3>ERC-20 token balances:</h3>
        {isLoading ? <Spinner w={50} h={50} p={20}></Spinner> : null}
        {hasQueried ? (
          <SimpleGrid w={"90vw"} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  flexDir={"column"}
                  color="white"
                  bg="blue"
                  w={"20vw"}
                  key={e.id}
                >
                  <Box>
                    <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                  </Box>
                  <Box>
                    <b>Balance:</b>&nbsp;
                    {Utils.formatUnits(
                      e.tokenBalance,
                      tokenDataObjects[i].decimals
                    )}
                  </Box>
                  <Image src={tokenDataObjects[i].logo} />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          "Please make a query!"
        )}
      </div>
    </div>
  );
}

export default App;
