import { useRef, useState, useEffect } from "react";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants/index";
import { Contract, providers, utils } from "ethers";
import Web3Modal from "web3modal";

export default function Home() {
    const [walletConnected, setWalletConnected] = useState(false);
    const [presaleStarted, setPresaleStarted] = useState(false);
    const [presaleEnded, setPresaleEnded] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
    const web3ModalRef = useRef();

    const presaleMint = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
            const tx = await nftContract.presaleMint({
                value: utils.parseEther("0.001"),
            });

            setLoading(true);
            await tx.wait();
            setLoading(false);
            console.alert("Minted Successfully!");
        } catch (err) {
            console.error(err);
        }
    };

    const mint = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
            const tx = await nftContract.mint({
                value: utils.parseEther("0.001"),
            });

            setLoading(true);
            await tx.wait();
            setLoading(false);
            console.alert("Minted Successfully!");
        } catch (err) {
            console.error(err);
        }
    };

    const walletConnect = async () => {
        try {
            await getProviderOrSigner();
            setWalletConnected(true);
        } catch (err) {
            console.error(err);
        }
    };

    const presaleStart = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
            const tx = await nftContract.startPresale();
            setLoading(true);
            tx.wait();
            setLoading(false);
            console.alert("Presale started!");
        } catch (err) {
            console.error(err);
        }
    };

    const checkIfPresaleStarted = async () => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            const _presaleStarted = await nftContract.presaleStarted();
            if (!_presaleStarted) {
                await getOwner();
            }

            setPresaleStarted(_presaleStarted);
            return _presaleStarted;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const checkIfPresaleEnded = async () => {
        try {
            const provider = await getProviderOrSigner();

            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            const _presaleEnded = await nftContract.presaleEnded();

            const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));

            if (hasEnded) {
                setPresaleEnded(true);
            } else {
                setPresaleEnded(false);
            }
            return hasEnded;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const getOwner = async () => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            const _owner = await nftContract.owner();

            const signer = await getProviderOrSigner(true);

            const address = await signer.getAddress();
            if (_owner.toLowerCase() === address.toLowerCase()) {
                setIsOwner(true);
            }
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const getTokenIdsMinted = async () => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

            const _tokenIds = await nftContract.tokenIds();
            setTokenIdsMinted(_tokenIds.toString());
        } catch (err) {
            console.error(err);
        }
    };

    const getProviderOrSigner = async (needSigner = false) => {
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        const { chainId } = await web3Provider.getNetwork();
        if (chainId != 5) {
            window.alert("Change the Testnet to Goerli");
            throw new Error("Change Network to Goerli");
        }

        if (needSigner) {
            const signer = await web3Provider.getSigner();
            return signer;
        }

        return web3Provider;
    };

    useEffect(() => {
        if (!walletConnected) {
            web3ModalRef.current = new Web3Modal({
                network: "goerli",
                providerOptions: {},
                disableInjectedProvider: false,
            });

            walletConnect();

            const _presaleStarted = checkIfPresaleStarted();
            if (_presaleStarted) {
                checkIfPresaleEnded();
            }

            getTokenIdsMinted();

            const presaleEndedInterval = setInterval(async function () {
                const _presaleStarted = await checkIfPresaleStarted();
                if (_presaleStarted) {
                    const _presaleEnded = await checkIfPresaleEnded();
                    if (_presaleEnded) {
                        clearInterval(presaleEndedInterval);
                    }
                }
            }, 5 * 1000);

            setInterval(async function () {
                await getTokenIdsMinted();
            }, 5 * 1000);
        }
    }, [walletConnected]);

    const renderButton = () => {
        if (!walletConnected) {
            return (
                <button
                    onClick={walletConnect}
                    className="px-10 py-5 rounded-md text-[#ffeade] text-2xl font-medium bg-[#3B0040]"
                >
                    Connect your wallet
                </button>
            );
        }

        if (loading) {
            return <button className="text-white">Loading...</button>;
        }

        if (isOwner && !presaleStarted) {
            return (
                <button
                    className="px-10 py-5 rounded-md text-[#ffeade] text-2xl font-medium bg-[#3B0040]"
                    onClick={presaleStart}
                >
                    Start Presale!
                </button>
            );
        }

        if (!presaleStarted) {
            return (
                <div>
                    <div className="p-10 text-white">Presale hasnt started!</div>
                </div>
            );
        }

        if (presaleStarted && !presaleEnded) {
            return (
                <div>
                    <div className="p-10 text-white">
                        Presale has started!!! If your address is whitelisted, Mint a Crypto Dev 🥳
                    </div>
                    <button
                        className="px-10 py-5 rounded-md text-[#ffeade] text-2xl font-medium bg-[#3B0040]"
                        onClick={() => {
                            presaleMint();
                        }}
                    >
                        Presale Mint 🚀
                    </button>
                </div>
            );
        }

        if (presaleStarted && presaleEnded) {
            return (
                <button
                    className="px-10 py-5 rounded-md text-[#ffeade] text-2xl font-medium bg-[#3B0040]"
                    onClick={mint}
                >
                    Public Mint 🚀
                </button>
            );
        }
    };

    return (
        <div className="w-full h-screen bg-black text-white flex flex-col justify-center  items-center  space-y-10">
            <h1 className=" font-bold text-7xl">NFTLabs</h1>
            <p className="font-medium italic text-3xl">You're not You. You're a Monster!</p>
            <p className="p-10 text-white">{tokenIdsMinted}/20 have been minted</p>

            {renderButton()}
        </div>
    );
}
