import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment): Promise<void> {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log({ deployer });
  await deploy("MultiSendProxy", {
    from: deployer,
    log: true,
    proxy: {
      proxyContract: "OptimizedTransparentProxy",
      owner: deployer,
      execute: {
        methodName: "initialize",
        args: [
          [
            "0x9B122F633616f23cedf52fc9194C815B6Ff51970",
            "0x741A2647720E8dBdA47fF680337ea97Af6D0ccc6",
            "0x894f4aE6DF5407E36ba2fdF5d80aA9B7f0FA500d",
            "0x951373E4228a877d8914E0cb4C3a53443c5e648c"
          ]
        ], // change me when deploy production
      },
    },
  });
};

func.tags = ["multisend_test"];
export default func;
