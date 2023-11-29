import { ProxySwap } from '../wrappers/ProxySwap';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Address, beginCell, toNano } from '@ton/core';
import { JettonMaster } from '@ton/ton';
import { JettonWallet } from '../wrappers/JettonWallet';

export async function run(provider: NetworkProvider) {
    const proxySwap = provider.open(ProxySwap.createFromConfig({owner: provider.sender().address!, dedust: provider.sender().address!, pool: Address.parse("EQAvtGe8Nep_XncmQYJrqzWjjdsTaygzL17bvH_8Rjryz1xu"), forwardAmount: toNano("0.2")}, await compile('ProxySwap')));

    let jetton = provider.open(JettonMaster.create(Address.parse("EQA0x08VeIRgjTXHH50TVkd7Q2UCYohINo84liLSuO2CG40H")));
    await proxySwap.sendDeploy(provider.sender(), toNano('0.05'), await jetton.getWalletAddress(proxySwap.address));

    await provider.waitForDeploy(proxySwap.address);

    console.log(await proxySwap.getParams());

    let w = provider.open(JettonWallet.createFromAddress(await jetton.getWalletAddress(provider.sender().address!)))
    await w.sendTransfer(provider.sender(), {value: toNano("0.5"), toAddress: proxySwap.address, queryId: 12, fwdAmount: toNano("0.4"), fwdPayload: beginCell().endCell(), jettonAmount: toNano(100)})
    
    // run methods on `proxySwap`
}
