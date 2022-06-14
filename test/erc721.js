const { ethers } = require("hardhat");
const { expect } = require("chai");

let signers;
let owner;
let seller;
let NFTMarketplace;
let Erc721;
let NFTMarketplaceContract;
let Erc721Contract;

before(async () => {
  signers = await ethers.getSigners();
  owner = signers[0];
  seller = signers[1];

  Erc721 = await ethers.getContractFactory("UITToken721");
  NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
});

describe("ERC721", () => {
  beforeEach(async () => {
    NFTMarketplaceContract = await (await NFTMarketplace.deploy()).deployed();
    Erc721Contract = await (
      await Erc721.connect(owner).deploy(
        "UITToken721",
        "U721",
        NFTMarketplaceContract.address
      )
    ).deployed();
  });

  it("should allow stranger to mint token throw default contract", async () => {
    console.log(NFTMarketplaceContract.address);
    console.log(Erc721Contract.address);
    const tx = await NFTMarketplaceContract.createMarketItem(
      Erc721Contract.address,
      "ipfs://test.com",
      false
    );
    let receipt = await tx.wait();
    console.log(
      receipt.events?.filter((x) => {
        return x.event == "MarketItemCreated";
      })
    );
    expect(await Erc721Contract.ownerOf(1)).to.be.equal(owner.address);
  });
});
