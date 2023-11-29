import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { ProxySwap } from '../wrappers/ProxySwap';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('ProxySwap', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('ProxySwap');
    });

    let blockchain: Blockchain;
    let proxySwap: SandboxContract<ProxySwap>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        proxySwap = blockchain.openContract(ProxySwap.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await proxySwap.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: proxySwap.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and proxySwap are ready to use
    });
});
