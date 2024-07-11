import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Crowdfund } from "../target/types/crowdfund";
import { expect } from "chai";
import { BN } from "bn.js";

describe("crowdfund", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Crowdfund as Program<Crowdfund>;
  const campaignAccount = anchor.web3.Keypair.generate();

  // Optional: Use a dedicated payer if needed
  const payer = anchor.web3.Keypair.generate();
  before(async () => {
    const airdropSignature = await program.provider.connection.requestAirdrop(
      payer.publicKey,
      1000000000 // 1 SOL
    );
    await program.provider.connection.confirmTransaction(airdropSignature);
  });

  it("Is initialized!", async () => {
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  describe("create", () => {
    it("should create a campaign with the provided details", async () => {
      const [campaignPublicKey, bump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("CROWDFUND"), payer.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .create(
          "Campaign Name",
          "Campaign Description",
          new BN(1000),
          "Project URL",
          "Progress Update URL",
          "Project Image URL",
          "Category"
        )
        .accounts({
          campaign: campaignPublicKey,
          user: payer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([payer])
        .rpc();

      console.log("Transaction signature:", tx);

      // Fetch the created campaign account
      const campaign = await program.account.campaign.fetch(
        campaignPublicKey
      );

      // Assertions
      expect(campaign.name).to.equal("Campaign Name");
      expect(campaign.description).to.equal("Campaign Description");
      expect(campaign.targetAmount.toNumber()).to.equal(1000);
      expect(campaign.projectUrl).to.equal("Project URL");
      expect(campaign.progressUpdateUrl).to.equal("Progress Update URL");
      expect(campaign.projectImageUrl).to.equal("Project Image URL");
      expect(campaign.category).to.equal("Category");
      expect(campaign.amountDonated.toNumber()).to.equal(0);
      expect(campaign.amountWithdrawn.toNumber()).to.equal(0);
      expect(campaign.admin).to.eql(payer.publicKey); // Check admin
    });
  });

  // ... (Tests for donate, withdraw, get_campaign)
});
