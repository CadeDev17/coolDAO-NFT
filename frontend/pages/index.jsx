import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false) 
  const [loading, setLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0")

  const web3ModalRef = useRef()

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)

    const {chainId } = await web3Provider.getNetwork()
    if (chainId !== 5) {
      window.alert("Change network to goerli")
      throw new Error("Change network to goerli")
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      return signer
    }

    return web3Provider
  }


  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer)

      const tx = await nftContract.mint({ value: utils.parseEther("0.01")})
      setLoading(true)
      window.alert("You have successfully minted a coolDAO NFT!")
    } catch (err) {
      console.error(err)
    }
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner()
      setWalletConnected(true)
    } catch (err) {
      console.error(err)
    }
  }

  const getTokenIdsMinted = async () => {
    try {
      const provider = getProviderOrSigner()
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
      const _tokenIds = await nftContract.tokenIds()
      setTokenIdsMinted(_tokenIds.toString())
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false
      })
      connectWallet()

      getTokenIdsMinted()

      setInterval(async function () {
        await getTokenIdsMinted()
      }, 5 * 1000)
    }
  }, [walletConnected])

  const renderButton = () => {
    if (walletConnected) {
      return (
        <button onClick={publicMint} className={styles.button}>Mint Now!</button>
      )
    }

    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }
  }

  const renderConnectWallet = () => { 
    if (walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.connect}>
          Wallet Connected
        </button>
      )
    } else {
      return (
        <button onClick={connectWallet} className={styles.connect}>
          Connect your wallet
        </button>
      );
    }
  }

  return (
  <div className={styles.page}>
    <div>
      <style jsx global>{`
        body {
          margin: 0px;
          padding: 0px;
        }
      `}</style>
    </div>
    <Head>
      <title>Whitelist Dapp</title>
      <meta name="description" content="Whitelist-Dapp" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech&display=swap" rel="stylesheet" />
    </Head>
    <nav className={styles.mainNavContainer}>
      <div className={styles.textLogoContainer}>
        <h1 className={styles.textLogo}>cool<span className={styles.cool}>DAO</span></h1>
      </div>
      <div className={styles.pageOptionsContainer}>
        <h4 className={styles.option}>Home</h4>
        <h4 className={styles.option}>Whitepaper</h4>
        <h4 className={styles.option}>Roadmap</h4>
        {renderConnectWallet()}
      </div>
    </nav>
    <div className={styles.main}>
      <div>
        <img className={styles.image} src="/coolDAO/coolDAO.jpeg" />
      </div>
      <div className={styles.mainContainer}>
        <h1 className={styles.title}>Welcome to the coolDAO NFT mint</h1>
        <div className={styles.description}>
          <span className={styles.red}>Not</span> Based, Purely <a href="WHITEPAPER" className={styles.obj}>Objectve</a>
        </div>
        <div className={styles.description}>
          {tokenIdsMinted}/20 coolDAO NFTs Minted!
        </div>
        {renderButton()}
      </div>
    </div>
  </div>
  );
}
