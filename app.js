// endpoint at https://pleasurecoin.app/endpoint

const http = require('http');

const hostname = '127.0.0.1';
const port = 3500;
const { providers, JsonRpcProvider, ethers }  = require('ethers');
const BigNumber = require('bignumber.js');
const abi = require("./resources/NSFW.json");
const stakingabi = require("./resources/NSFWStaking.json")

BigNumber.config({ DECIMAL_PLACES: 4 })


const chainRpcUrls = {
    polygon: 'https://polygon-rpc.com',
    ethereum: 'https://rpc.ankr.com/eth',
    bsc: 'https://bsc-dataseed1.binance.org'
}

const cHttpProviders = {
    polygon: new ethers.providers.JsonRpcProvider(chainRpcUrls.polygon),
    ethereum: new ethers.providers.JsonRpcProvider(chainRpcUrls.ethereum),
    bsc: new ethers.providers.JsonRpcProvider(chainRpcUrls.bsc)
}

const ethContracts =  {
    polygon: new ethers.Contract('0x8f006D1e1D9dC6C98996F50a4c810F17a47fBF19', abi, cHttpProviders.polygon),
    ethereum: new ethers.Contract('0x8f006D1e1D9dC6C98996F50a4c810F17a47fBF19', abi, cHttpProviders.ethereum),
    bsc: new ethers.Contract('0x8f006D1e1D9dC6C98996F50a4c810F17a47fBF19', abi, cHttpProviders.bsc),
}

const burningWallets = {
    polygon: ['0x000000000000000000000000000000000000dead'], // dead
    ethereum: ['0x000000000000000000000000000000000000dead'], // dead
    bsc: ['0x000000000000000000000000000000000000dead'], // dead
}

const multichainContracts = {
    polygon: [
        '0x084c04f5445bf762127008efe023c6d9650cb905' // Multichain Bridge Contract
    ],
    ethereum: [
        '0x5977d06D455b1C791c753B4eA8153F609017d46d' // Multichain Bridge Contract
    ],
    bsc: [
        '0x7b1ac40fb90739b0c54235d47b46f8f528f8fee5' // Multichain Bridge Contract
    ],
}

const vestingContracts = {
    polygon: [
        '0x3eF7442dF454bA6b7C1deEc8DdF29Cfb2d6e56c7', // Company Vesting Wallet
        '0x366ce50bf1d668e3f62a6e3460833af06b1f565a' // Company Locked Wallet
    ],
    ethereum: [

    ],
    bsc: [

    ],
}

const stakingContracts = {
    polygon: [
        '0xAad3B603623032d9941AF26599a256830fba2254', // 4 weeks locked staking
        '0x84ED758f73C994D61B4a119c06700889C8463F8B' // 12 weeks locked staking
    ],
    ethereum: [],
    bsc: [],
}

// main
const server = http.createServer(async (req, res) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');

    const erc20_nsfw_poly = new ethers.Contract('0x8f006D1e1D9dC6C98996F50a4c810F17a47fBF19', abi, cHttpProviders.polygon);
    const erc20_nsfw_eth = new ethers.Contract('0x8f006D1e1D9dC6C98996F50a4c810F17a47fBF19', abi, cHttpProviders.ethereum);
    const erc20_nsfw_bsc = new ethers.Contract('0xaA076B62EFC6f357882E07665157A271aB46A063', abi, cHttpProviders.bsc);

    const erc20_nsfwST4_poly = new ethers.Contract(stakingContracts.polygon[0], stakingabi, cHttpProviders.polygon);
    const erc20_nsfwST12_poly = new ethers.Contract(stakingContracts.polygon[1], stakingabi, cHttpProviders.polygon);

    const totalSupplyPoly = await erc20_nsfw_poly.totalSupply()
    const totalSupplyEth = await erc20_nsfw_eth.totalSupply()
    const totalSupplyBsc = await erc20_nsfw_bsc.totalSupply()

    const burnedPoly = await erc20_nsfw_poly.balanceOf(burningWallets.polygon[0]);
    const burnedEth = await erc20_nsfw_poly.balanceOf(burningWallets.ethereum[0]);
    const burnedBsc = await erc20_nsfw_poly.balanceOf(burningWallets.bsc[0]);

    const multichainPoly = await erc20_nsfw_poly.balanceOf(multichainContracts.polygon[0]);
    const multichainEth = await erc20_nsfw_eth.balanceOf(multichainContracts.ethereum[0]);
    const multichainBsc = await erc20_nsfw_bsc.balanceOf(multichainContracts.bsc[0]);

    const vestedPoly = await erc20_nsfw_poly.balanceOf(vestingContracts.polygon[0]);
    const vestedPoly2 = await erc20_nsfw_poly.balanceOf(vestingContracts.polygon[1]);

    const staked4w = await erc20_nsfwST4_poly.totalStaked();
    const staked12w = await erc20_nsfwST12_poly.totalStaked();

    Promise.all([totalSupplyPoly, totalSupplyEth, totalSupplyBsc,
            burnedPoly, burnedEth, burnedBsc,
            vestedPoly, vestedPoly2, multichainPoly, multichainEth, multichainBsc, staked4w, staked12w]).then((values) => {
        // console.log(values);

        const totalSupplyPolyBN = new BigNumber(values[0].toString())
        const totalSupplyEthBN = new BigNumber(values[1].toString())
        const totalSupplyBscBN = new BigNumber(values[2].toString())
        const totalSupplyOverAllBN = totalSupplyPolyBN.plus(totalSupplyEthBN).plus(totalSupplyBscBN)

        const burnedPolyBN = new BigNumber(values[3].toString())
        const burnedEthBN = new BigNumber(values[4].toString())
        const burnedBscBN = new BigNumber(values[5].toString())
        const totalburnedOverAllBN = burnedPolyBN.plus(burnedEthBN).plus(burnedBscBN)

        const vestedPolyBN = new BigNumber(values[6].toString())
        const vestedPolyBN2 = new BigNumber(values[7].toString())
        const multichainPolyBN = new BigNumber(values[8].toString())
        const multichainEthBN = new BigNumber(values[9].toString())
        const multichainBscBN = new BigNumber(values[10].toString())
        const multichainOverAllBN = multichainPolyBN.plus(multichainEthBN).plus(multichainBscBN)
        const vestedOverAllBN = vestedPolyBN.plus(vestedPolyBN2).plus(multichainPolyBN).plus(multichainEthBN).plus(multichainBscBN)

        const circulatingsupplyPolyBN = totalSupplyPolyBN.minus(burnedPolyBN).minus(vestedPolyBN).minus(vestedPolyBN2).minus(multichainPolyBN)
        const circulatingsupplyEthBN = totalSupplyEthBN.minus(burnedEthBN).minus(multichainEthBN)
        const circulatingsupplyBscBN = totalSupplyBscBN.minus(burnedBscBN).minus(multichainBscBN)
        const circulatingsupplyBN = circulatingsupplyPolyBN.plus(circulatingsupplyEthBN).plus(circulatingsupplyBscBN)

        const staked4wBN = new BigNumber(values[11].toString())
        const staked12wBN = new BigNumber(values[12].toString())

        // OUTPUT
        // Totals first
        const totalSupplyOverAllBNfn = totalSupplyOverAllBN.div(10 ** 18).toString()
        res.write("TotalSupply: " + totalSupplyOverAllBNfn + '\r\n');

        const multichainOverAllBNfn = multichainOverAllBN.div(10 ** 18).toString()
        res.write("Multichain total: " + multichainOverAllBNfn + '\r\n');

        const totalwithoutmultichainBNfn = totalSupplyOverAllBN.minus(multichainOverAllBN).div(10 ** 18).toString()
        res.write("Total without Multichain: " + totalwithoutmultichainBNfn + '\r\n');

        const vestedOverAllBNfn = vestedOverAllBN.div(10 ** 18).toString()
        res.write("TotalVested: " + vestedOverAllBNfn + '\r\n');

        const totalburnedOverAllBNfn = totalburnedOverAllBN.div(10 ** 18).toString()
        res.write("Burned: " + totalburnedOverAllBNfn + '\r\n');

        const circulatingsupplyBNfn = circulatingsupplyBN.div(10 ** 18).toString()
        res.write("CirculatingSupply: " + circulatingsupplyBNfn + '\r\n');

        res.write('\r\n');
        res.write('Polygon\r\n');
        res.write('\r\n');

        const totalSupplyPolyBNfn = totalSupplyPolyBN.div(10 ** 18).toString()
        res.write("Polygon TotalSupply: " + totalSupplyPolyBNfn + '\r\n');

        const vestedPolyBNfn = vestedPolyBN.div(10 ** 18).toString()
        res.write("Polygon Vested: " + vestingContracts.polygon[0] + " " + vestedPolyBNfn + '\r\n');

        const vestedPolyBN2fn = vestedPolyBN2.div(10 ** 18).toString()
        res.write("Polygon Vested: " + vestingContracts.polygon[1] + " " + vestedPolyBN2fn + '\r\n');

        const multichainPolyBNfn = multichainPolyBN.div(10 ** 18).toString()
        res.write("Polygon Multichain: " + multichainContracts.polygon[0] + " " + multichainPolyBNfn + '\r\n');

        const burnedPolyBNfn = burnedPolyBN.div(10 ** 18).toString()
        res.write("Polygon Burned: " + burningWallets.polygon + " " + burnedPolyBNfn + '\r\n');

        const circulatingsupplyPolyBNfn = circulatingsupplyPolyBN.div(10 ** 18).toString()
        res.write("Polygon CirculatingSupply: " + circulatingsupplyPolyBNfn + '\r\n');

        res.write('\r\n');
        res.write('Ethereum\r\n');
        res.write('\r\n');

        const totalSupplyEthBNfn = totalSupplyEthBN.div(10 ** 18).toString()
        res.write("Ethereum TotalSupply: " + totalSupplyEthBNfn + '\r\n');


        const multichaiEthBNfn = multichainEthBN.div(10 ** 18).toString()
        res.write("Ethereum Multichain: " + multichainContracts.ethereum[0] +  " " + multichaiEthBNfn + '\r\n');

        const burnedEthBNfn = burnedEthBN.div(10 ** 18).toString()
        res.write("Ethereum Burned: " + burningWallets.ethereum + " " + burnedEthBNfn + '\r\n');

        const circulatingsupplyEthBNfn = circulatingsupplyEthBN.div(10 ** 18).toString()
        res.write("Ethereum CirculatingSupply: " + circulatingsupplyEthBNfn + '\r\n');

        res.write('\r\n');
        res.write('BSC\r\n');
        res.write('\r\n');

        const totalSupplyBscBNfn = totalSupplyBscBN.div(10 ** 18).toString()
        res.write("BSC TotalSupply: " + totalSupplyBscBNfn + '\r\n');

        const multichaiBSCBNfn = multichainBscBN.div(10 ** 18).toString()
        res.write("BSC Multichain: " + multichainContracts.bsc + " " +  multichaiBSCBNfn + '\r\n');

        const burnedBscBNfn = burnedBscBN.div(10 ** 18).toString()
        res.write("BSC Burned: " + burningWallets.bsc + " " + burnedBscBNfn + '\r\n');

        const circulatingsupplyBscBNfn = circulatingsupplyBscBN.div(10 ** 18).toString()
        res.write("BSC CirculatingSupply: " + circulatingsupplyBscBNfn + '\r\n');

        res.write('\r\n');
        res.write('Staked on Polygon\r\n');
        res.write('\r\n');

        const staked4wBNfn = staked4wBN.div(10 ** 18).toString()
        res.write("Staked for  4 weeks: " + staked4wBNfn + '\r\n');

        const staked12wBNfn = staked12wBN.div(10 ** 18).toString()
        res.write("Staked for 12 weeks: " + staked12wBNfn + '\r\n');


        res.end('')
    });

    console.log("end")

    console.log("end of file")
    // res.end("");
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});