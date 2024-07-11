import React, { useState, useEffect, useCallback } from "react";
import * as anchor from "@coral-xyz/anchor";
import { Program, utils, BN } from "@coral-xyz/anchor";
import IDL from "./idl.json";
import {
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Form, message, Input, InputNumber, Button } from "antd";

import { Buffer } from "buffer";
window.Buffer = Buffer;

const programID = new PublicKey(IDL.address);
const opts = {
  preflightCommitment: "processed",
};

const App = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [campaigns, setCampaigns] = useState([]); // Use correct type
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    targetAmount: 0,
    projectUrl: "",
    progressUpdateUrl: "",
    projectImageUrl: "",
    category: "",
  });

  // Define getProvider using useCallback
  const getProvider = useCallback(() => {
    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      opts.preflightCommitment
    );
    return provider;
  }, [connection, wallet]);

  // getAllCampaigns as a useCallback function WITH setCampaigns dependency
  const getAllCampaigns = useCallback(async () => {
    if (wallet?.publicKey) {
      const provider = getProvider();
      const program = new Program(IDL, programID, {
        connection,
      });

      const campaigns = await program.account.campaign.all();
      setCampaigns(campaigns); // Include setCampaigns here
    }
  }, [wallet?.publicKey, getProvider, setCampaigns]); // Correct dependencies

  useEffect(() => {
    getAllCampaigns(); // Now you can call it without the useEffect warning
  }, [getAllCampaigns]);

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setIsCreating(true);
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, {
        connection,
      });

      // Calculate the PDA for the campaign account
      const [campaignPublicKey, bump] = await PublicKey.findProgramAddressSync(
        [
          utils.bytes.utf8.encode("CROWDFUND"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

       // Get form values and convert targetAmount to BN
       const {
        name,
        description,
        targetAmount,
        projectUrl,
        progressUpdateUrl,
        projectImageUrl,
        category
      } = values;

      await program.methods
        .create(
          name,
          description,
          new BN(targetAmount * LAMPORTS_PER_SOL),
          projectUrl,
          progressUpdateUrl,
          projectImageUrl,
          category
        )
        .accounts({
          campaign: campaignPublicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setIsCreating(false);
      message.success("Campaign created successfully!");
      form.resetFields();
      await getAllCampaigns(); // Refresh the campaign list
    } catch (error) {
      setIsCreating(false); // Reset loading state on error
      console.error("Error creating campaign:", error);
      message.error("Failed to create campaign.");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div>
      <Form
        form={form}
        name="createCampaign"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Campaign Name"
          name="name"
          rules={[
            { required: true, message: "Please input your Campaign Name!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: "Please input your Description!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Target Amount"
          name="targetAmount"
          rules={[
            { required: true, message: "Please input your Target Amount!" },
          ]}
        >
          <InputNumber />
        </Form.Item>

        <Form.Item
          label="Project URL"
          name="projectUrl"
          rules={[
            { required: true, message: "Please input your Project URL!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Progress Update URL"
          name="progressUpdateUrl"
          rules={[
            {
              required: true,
              message: "Please input your Progress Update URL!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Project Image URL"
          name="projectImageUrl"
          rules={[
            { required: true, message: "Please input your Project Image URL!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: "Please input your Category!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>

      <WalletMultiButton />
    </div>
  );
};

export default App;
