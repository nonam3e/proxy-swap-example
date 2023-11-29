import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/ton';

export type ProxySwapConfig = {
    owner: Address;
    dedust: Address;
    pool: Address;
    forwardAmount: bigint;
};

export function proxySwapConfigToCell(config: ProxySwapConfig): Cell {
    return beginCell()
        .storeAddress(config.owner)
        .storeAddress(null)
        .storeRef(beginCell().storeAddress(config.dedust).storeAddress(config.pool).endCell())
        .storeCoins(config.forwardAmount)
        .endCell();
}

export class ProxySwap implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new ProxySwap(address);
    }

    static createFromConfig(config: ProxySwapConfig, code: Cell, workchain = 0) {
        const data = proxySwapConfigToCell(config);
        const init = { code, data };
        return new ProxySwap(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint, jettonAddress: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(2, 32).storeAddress(jettonAddress).endCell(),
        });
    }

    async getParams(provider: ContractProvider) {
        let res = await provider.get('get_params', []);
        return {
            owner: res.stack.readAddressOpt(),
            jetton_wallet: res.stack.readAddressOpt(),
            dedust: res.stack.readAddressOpt(),
            pool: res.stack.readAddressOpt(),
            forwardAmount: res.stack.readBigNumber(),
        };
    }
}
