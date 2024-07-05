import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolDonate } from "../target/types/sol_donate";
import { BN } from "bn.js";

describe("sol-donate", () => {
  const provider = anchor.AnchorProvider.env();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.SolDonate as Program<SolDonate>;
  const keypair = anchor.web3.Keypair.generate();
  const donatorKeypair = anchor.web3.Keypair.generate();

  it('create campaign', async() => {
    const airdropSign = await provider.connection.requestAirdrop(
      keypair.publicKey,10 *
      anchor.web3.LAMPORTS_PER_SOL
    );
    const latestBlockHash = await provider.connection.getLatestBlockhash();

    await provider.connection.confirmTransaction({
      blockhash:latestBlockHash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSign,
    })

    let [pda, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from('campaign'),
        keypair.publicKey.toBuffer()
      ],
      program.programId
    )

    await program.methods.createCampaign(
      "Sample Cat Youtube",
      "Sample Cat Youtube Description",
      new BN(100* anchor.web3.LAMPORTS_PER_SOL),
    ).accounts({
      campaign: pda,
      user: keypair.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([keypair])
    .rpc()
  });

  it('create donate', async() => {
    let balanceAddress = await provider.connection.getBalance(donatorKeypair.publicKey);
    console.log(balanceAddress);

    const airdropSign = await provider.connection.requestAirdrop(
      donatorKeypair.publicKey,10 *
      anchor.web3.LAMPORTS_PER_SOL
    );
    const latestBlockHash = await provider.connection.getLatestBlockhash();

    await provider.connection.confirmTransaction({
      blockhash:latestBlockHash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSign,
    })

    let data = await program.account.campaign.all();
    console.log(data);

    await program.methods.donate(
      new BN(3* anchor.web3.LAMPORTS_PER_SOL),
    ).accounts({
      campaign: data[0].publicKey,
      user: donatorKeypair.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([donatorKeypair])
    .rpc()
  });

  it('withdraw donation', async() => {
    let balanceAddress = await provider.connection.getBalance(keypair.publicKey);
    console.log(`balance withdraw${balanceAddress/anchor.web3.LAMPORTS_PER_SOL}`);

    let data = await program.account.campaign.all();
    console.log(data);

    await program.methods.withdraw().accounts({
      campaign: data[0].publicKey,
      user: keypair.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([keypair])
    .rpc()


    let balanceAddressAfter = await provider.connection.getBalance(keypair.publicKey);
    console.log(`afterbalance withdraw${balanceAddressAfter/anchor.web3.LAMPORTS_PER_SOL}`);
  });
});
