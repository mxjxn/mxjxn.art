import fs from 'node:fs';
import ts from 'typescript';
import {createPublicClient,http,parseAbi} from 'viem';
import {mainnet} from 'viem/chains';
const source=ts.transpileModule(fs.readFileSync('src/lib/auction-contract.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {AUCTION_ABI,SALE}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const client=createPublicClient({chain:mainnet,transport:http('https://ethereum-rpc.publicnode.com',{timeout:15000,retryCount:1})});
const chain=await client.getChainId();
if(chain!==1)throw Error('Wrong chain');
const block=await client.getBlock();
const listing=await client.readContract({address:SALE.marketplace,abi:AUCTION_ABI,functionName:'getListing',args:[SALE.listingId],blockNumber:block.number});
const tokenURI=await client.readContract({address:SALE.token,abi:parseAbi(['function tokenURI(uint256) view returns (string)']),functionName:'tokenURI',args:[SALE.tokenId]});
console.log(JSON.stringify({chain,block:block.number,timestamp:block.timestamp,listing,tokenURI},(_,v)=>typeof v==='bigint'?v.toString():v,2));
if (process.argv.includes('--simulate')) {
  const minimum=await client.readContract({address:SALE.marketplace,abi:AUCTION_ABI,functionName:'getListingCurrentPrice',args:[SALE.listingId]});
  const testAccount='0x1111111111111111111111111111111111111111';
  const request={address:SALE.marketplace,abi:AUCTION_ABI,functionName:'bid',args:[SALE.listingId,false],account:testAccount,stateOverride:[{address:testAccount,balance:10n**20n}]};
  // eth_call only: the balance override is ephemeral, with no signer or broadcast.
  await client.simulateContract({...request,value:minimum});
  console.log('Read-only mainnet simulation: minimum bid accepted.');
  try {
    await client.simulateContract({...request,value:minimum-1n});
    throw Error('Under-minimum simulation unexpectedly succeeded');
  } catch (error) {
    if (!/Invalid bid amount|Minimum bid not met/.test(error.message)) throw error;
    console.log('Read-only mainnet simulation: under-minimum bid rejected.');
  }
}
